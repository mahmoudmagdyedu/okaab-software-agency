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
const CANONICAL_HOST = "okaab.org";
const SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://cqxloxfxxwuhdkppjcpr.supabase.co https://fuzkonswngdogylzvivw.supabase.co wss://cqxloxfxxwuhdkppjcpr.supabase.co wss://fuzkonswngdogylzvivw.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

function getForwardedProtocol(request: Request) {
  return (
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ||
    new URL(request.url).protocol.replace(":", "").toLowerCase()
  );
}

function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const protocol = getForwardedProtocol(request);
  const isProductionHost = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;

  if (!isProductionHost || (protocol === "https" && url.hostname === CANONICAL_HOST)) {
    return null;
  }

  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return Response.redirect(url, 308);
}

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
  const secureRequest = getForwardedProtocol(request) === "https";

  if (secureRequest) {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (/^\/(?:assets|fonts)\//.test(pathname)) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  } else if (/\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(pathname)) {
    headers.set("cache-control", "public, max-age=2592000");
  }

  const contentType = headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("text/html")) {
    headers.set("content-security-policy", SECURITY_POLICY);
    headers.set("cache-control", "no-cache, max-age=0, must-revalidate");
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
      const redirect = canonicalRedirect(request);
      if (redirect) return withPerformanceHeaders(request, redirect);
      const mawIdResponse = await proxyMawid(request);
      if (mawIdResponse) return withPerformanceHeaders(request, mawIdResponse);
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withPerformanceHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return withPerformanceHeaders(request, new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }));
    }
  },
};
