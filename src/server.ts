import "./lib/error-capture";
import appCssUrl from "./styles.css?url";
import serverEntry from "@tanstack/react-start/server-entry";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const handler = serverEntry as ServerEntry;
const MAWID_ORIGIN = "https://okaab-mawid-ef3bbc493d4a.herokuapp.com";

function isMawidPath(pathname: string) {
  return /^(?:\/maw'id|\/maw%27id)(?:\/|$)/i.test(pathname);
}

async function proxyMawid(request: Request): Promise<Response | null> {
  const incomingUrl = new URL(request.url);
  if (!isMawidPath(incomingUrl.pathname)) return null;

  const normalizedPath = incomingUrl.pathname.replace(/^\/maw%27id/i, "/maw'id");
  const upstreamPath = normalizedPath.replace(
    /^\/maw'id(?=\/(?:assets\/|favicon\.(?:ico|png)$))/i,
    "",
  );
  const upstreamUrl = new URL(`${upstreamPath}${incomingUrl.search}`, MAWID_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("accept-encoding", "identity");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });
  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");

  const location = responseHeaders.get("location");
  if (location) {
    responseHeaders.set("location", location.replace(MAWID_ORIGIN, incomingUrl.origin));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const COMPRESSIBLE_CONTENT_TYPES = [
  "text/",
  "application/javascript",
  "application/json",
  "application/ld+json",
  "application/xml",
  "image/svg+xml",
];

function appendVary(headers: Headers, value: string) {
  const current = headers.get("vary");
  const values = current ? current.split(",").map((item) => item.trim().toLowerCase()) : [];
  if (!values.includes(value.toLowerCase())) {
    headers.set("vary", current ? `${current}, ${value}` : value);
  }
}

function withPerformanceHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const pathname = new URL(request.url).pathname;

  if (/^\/(?:assets|fonts)\//.test(pathname)) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  } else if (/\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(pathname)) {
    headers.set("cache-control", "public, max-age=2592000");
  }

  const contentType = headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("text/html")) {
    headers.append("link", `<${appCssUrl}>; rel=preload; as=style`);
  }
  const acceptsGzip = /(?:^|,)\s*gzip\s*(?:;|,|$)/i.test(
    request.headers.get("accept-encoding") ?? "",
  );
  const canCompress =
    request.method !== "HEAD" &&
    response.body != null &&
    response.status !== 204 &&
    response.status !== 304 &&
    !headers.has("content-encoding") &&
    !headers.has("content-range") &&
    acceptsGzip &&
    COMPRESSIBLE_CONTENT_TYPES.some((type) => contentType.includes(type));

  if (canCompress) {
    headers.set("content-encoding", "gzip");
    headers.delete("content-length");
    appendVary(headers, "Accept-Encoding");
    return new Response(response.body.pipeThrough(new CompressionStream("gzip")), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const mawIdResponse = await proxyMawid(request);
      if (mawIdResponse) return mawIdResponse;
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withPerformanceHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
