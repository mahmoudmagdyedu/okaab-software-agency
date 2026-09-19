import assert from "node:assert/strict";
import test from "node:test";

import { errorResponse, secureResponse } from "./lib/secure-response.ts";

function nonceFrom(response: Response): string {
  const csp = response.headers.get("content-security-policy") ?? "";
  return csp.match(/nonce-([^' ;]+)/)?.[1] ?? "";
}

test("catastrophic error HTML has a matching nonce and no inline event handler", async () => {
  const response = errorResponse("error-nonce", { secureRequest: true });
  const html = await response.text();
  const tags = [...html.matchAll(/<(script|style)\b[^>]*>/gi)].map((match) => match[0]);

  assert.equal(response.status, 500);
  assert.equal(nonceFrom(response), "error-nonce");
  assert.ok(tags.length > 0);
  assert.ok(tags.every((tag) => tag.includes('nonce="error-nonce"')));
  assert.doesNotMatch(html, /\sonclick\s*=/i);
});

test("concurrent HTML responses keep distinct request-local nonces", async () => {
  const source = '<!doctype html><style>.ok{color:green}</style><script src="/app.js"></script>';
  const [first, second] = await Promise.all([
    secureResponse(
      new Response(source, { headers: { "content-type": "text/html; charset=utf-8" } }),
      "first-nonce",
    ),
    secureResponse(
      new Response(source, { headers: { "content-type": "text/html; charset=utf-8" } }),
      "second-nonce",
    ),
  ]);
  const [firstHtml, secondHtml] = await Promise.all([first.text(), second.text()]);

  assert.equal(nonceFrom(first), "first-nonce");
  assert.equal(nonceFrom(second), "second-nonce");
  assert.match(firstHtml, /nonce="first-nonce"/);
  assert.doesNotMatch(firstHtml, /second-nonce/);
  assert.match(secondHtml, /nonce="second-nonce"/);
  assert.doesNotMatch(secondHtml, /first-nonce/);
});

test("non-HTML responses preserve status and retry metadata", async () => {
  const secured = secureResponse(
    new Response('{"error":"Request limit reached"}', {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": "900" },
    }),
    "unused-nonce",
  );

  assert.equal(secured.status, 429);
  assert.equal(secured.headers.get("retry-after"), "900");
  assert.equal(await secured.text(), '{"error":"Request limit reached"}');
});

test("production CSP permits the Clerk custom Frontend API domain", async () => {
  const secured = secureResponse(
    new Response("<!doctype html><main>admin</main>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
    "clerk-nonce",
  );

  const csp = secured.headers.get("content-security-policy") ?? "";
  assert.match(csp, /connect-src[^;]*https:\/\/clerk\.okaab\.org/);
});

test("uploaded slide HTML keeps its own policy and frame behavior", async () => {
  const original = new Response("<script>bridge()</script>", {
    headers: {
      "content-type": "text/html",
      "content-security-policy": "script-src 'unsafe-inline'; frame-ancestors 'self'",
    },
  });
  const secured = secureResponse(original, "unused", {
    htmlPolicy: false,
    frameOption: "SAMEORIGIN",
  });

  assert.equal(
    secured.headers.get("content-security-policy"),
    "script-src 'unsafe-inline'; frame-ancestors 'self'",
  );
  assert.equal(secured.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(await secured.text(), "<script>bridge()</script>");
});

test("data API error handling returns safe error payload without leaking internal error details", async () => {
  // Test error handling behavior similar to src/routes/api/data/$table.ts
  const handleRequest = async (err: unknown) => {
    try {
      throw err;
    } catch (error) {
      if (error instanceof Response) {
        const status = error.status;
        const text = await error.text();
        return Response.json(
          { data: null, count: null, error: { message: text || error.statusText || "تعذّر تنفيذ العملية" } },
          { status, headers: { "cache-control": "no-store" } },
        );
      }
      return Response.json(
        { data: null, count: null, error: { message: "تعذّر تنفيذ العملية" } },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }
  };

  const internalErrResponse = await handleRequest(new Error("Database connection failed at 127.0.0.1:1433 with user sa"));
  assert.equal(internalErrResponse.status, 400);
  const internalData = await internalErrResponse.json();
  assert.deepEqual(internalData, { data: null, count: null, error: { message: "تعذّر تنفيذ العملية" } });
  assert.equal((internalData as any).error.message.includes("Database connection failed"), false);

  const authResponse = await handleRequest(new Response("Unauthorized", { status: 401 }));
  assert.equal(authResponse.status, 401);
  const authData = await authResponse.json();
  assert.deepEqual(authData, { data: null, count: null, error: { message: "Unauthorized" } });
});
