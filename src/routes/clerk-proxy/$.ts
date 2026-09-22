import { createFileRoute } from "@tanstack/react-router";

const CLERK_FRONTEND_API = "https://frontend-api.clerk.dev";
const CLERK_PROXY_URL = "https://okaab.org/clerk-proxy";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const addresses = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (addresses.length > 0) return addresses[addresses.length - 1]!;
  }
  return request.headers.get("cf-connecting-ip") || "127.0.0.1";
}

async function proxyClerkRequest({
  request,
  params,
}: {
  request: Request;
  params: { _splat?: string };
}) {
  const secretKey = process.env["CLERK_SECRET_KEY"];
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is missing for the Clerk Frontend API proxy");
    return new Response("Authentication service is not configured", { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const path = (params._splat || "").replace(/^[/\\]+/, "");
  const upstreamUrl = new URL(`/${path}${requestUrl.search}`, CLERK_FRONTEND_API);
  if (upstreamUrl.origin !== new URL(CLERK_FRONTEND_API).origin) {
    return new Response("Invalid proxy destination", { status: 400 });
  }
  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete("host");
  requestHeaders.delete("content-length");
  requestHeaders.set("Clerk-Proxy-Url", CLERK_PROXY_URL);
  requestHeaders.set("Clerk-Secret-Key", secretKey);
  requestHeaders.set("X-Forwarded-For", getClientIp(request));

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: requestHeaders,
    ...(hasBody ? { body: await request.arrayBuffer() } : {}),
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  const location = responseHeaders.get("location");
  if (location?.startsWith(CLERK_FRONTEND_API)) {
    responseHeaders.set("location", location.replace(CLERK_FRONTEND_API, CLERK_PROXY_URL));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

const handlers = {
  GET: proxyClerkRequest,
  POST: proxyClerkRequest,
  PUT: proxyClerkRequest,
  PATCH: proxyClerkRequest,
  DELETE: proxyClerkRequest,
  OPTIONS: proxyClerkRequest,
};

export const Route = createFileRoute("/clerk-proxy/$")({
  server: { handlers },
});
