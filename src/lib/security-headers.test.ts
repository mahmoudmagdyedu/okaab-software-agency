import assert from "node:assert/strict";
import test from "node:test";

import { getDocumentNonce } from "./csp-client.ts";
import {
  HSTS_VALUE,
  applyHtmlSecurityHeaders,
  buildCsp,
  generateNonce,
  injectNonceIntoTags,
  nonceTransformStream,
} from "./security-headers.ts";

test("production CSP requires a nonce for every executable script", () => {
  const csp = buildCsp("test-nonce");
  const scriptDirective = csp.match(/(?:^|; )script-src ([^;]+)/)?.[1] ?? "";

  assert.match(scriptDirective, /'nonce-test-nonce'/);
  assert.match(scriptDirective, /'strict-dynamic'/);
  assert.doesNotMatch(scriptDirective, /'self'/);
  assert.doesNotMatch(scriptDirective, /'unsafe-inline'/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
});

test("all SSR script and style tags receive only the current response nonce", () => {
  const html =
    '<style nonce="old">x{color:red}</style><script>ok</script><SCRIPT src="/app.js"></SCRIPT>';
  const transformed = injectNonceIntoTags(html, "fresh");

  assert.equal((transformed.match(/nonce="fresh"/g) ?? []).length, 3);
  assert.doesNotMatch(transformed, /nonce="old"/);
});

test("stream transformation handles tags split across chunks", async () => {
  const encoder = new TextEncoder();
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("<!doctype html><scr"));
      controller.enqueue(encoder.encode("ipt>boot()</script><sty"));
      controller.enqueue(encoder.encode("le>.x{color:red}</style>"));
      controller.close();
    },
  });

  const html = await new Response(nonceTransformStream(source, "stream-nonce")).text();
  assert.match(html, /<script nonce="stream-nonce">/);
  assert.match(html, /<style nonce="stream-nonce">/);
});

test("application responses suppress diagnostic headers and add preload HSTS on HTTPS", () => {
  const headers = new Headers({
    server: "internal-platform",
    via: "internal-router",
    "x-powered-by": "framework",
    "x-clerk-auth-status": "signed-out",
  });
  applyHtmlSecurityHeaders(headers, "header-nonce", { secureRequest: true });

  assert.equal(headers.get("strict-transport-security"), HSTS_VALUE);
  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.equal(headers.get("server"), null);
  assert.equal(headers.get("via"), null);
  assert.equal(headers.get("x-powered-by"), null);
  assert.equal(headers.get("x-clerk-auth-status"), null);
  assert.match(headers.get("content-security-policy") ?? "", /nonce-header-nonce/);
});

test("nonce generation is random and has sufficient entropy", () => {
  const first = generateNonce();
  const second = generateNonce();
  assert.notEqual(first, second);
  assert.ok(first.length >= 22);
  assert.ok(second.length >= 22);
});

test("client-mounted tags reuse the nonce already present in the document", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelector: () => ({ nonce: "document-nonce" }) },
  });
  try {
    assert.equal(getDocumentNonce(), "document-nonce");
  } finally {
    if (original) Object.defineProperty(globalThis, "document", original);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
