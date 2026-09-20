import { createFileRoute } from "@tanstack/react-router";

const CLERK_FRONTEND_API = "https://frontend-api.clerk.dev";
const CLERK_PROXY_PATH = "/__clerk";

function getOriginalIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

async function proxyClerkFrontendApi(request: Request) {
  const secretKey = process.env["CLERK_SECRET_KEY"];
  if (!secretKey) {
    return new Response("Clerk proxy is not configured", { status: 503 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamPath = incomingUrl.pathname.slice(CLERK_PROXY_PATH.length) || "/";
  const safeUpstreamPath = "/" + upstreamPath.replace(/^[/\\]+/, "");
  const upstreamUrl = new URL(`${safeUpstreamPath}${incomingUrl.search}`, CLERK_FRONTEND_API);
  // The production adapter reconstructs Request URLs with its internal
  // localhost origin. Clerk must receive the public, configured proxy URL.
  const proxyUrl =
    process.env["CLERK_PROXY_URL"]?.replace(/\/$/, "") || `https://okaab.org${CLERK_PROXY_PATH}`;
  const headers = new Headers(request.headers);

  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("host");
  headers.set("Clerk-Proxy-Url", proxyUrl);
  headers.set("Clerk-Secret-Key", secretKey);
  headers.set("X-Forwarded-For", getOriginalIp(request));

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.set("cache-control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

const handlers = {
  GET: ({ request }: { request: Request }) => proxyClerkFrontendApi(request),
  POST: ({ request }: { request: Request }) => proxyClerkFrontendApi(request),
  PUT: ({ request }: { request: Request }) => proxyClerkFrontendApi(request),
  PATCH: ({ request }: { request: Request }) => proxyClerkFrontendApi(request),
  DELETE: ({ request }: { request: Request }) => proxyClerkFrontendApi(request),
};

export const Route = createFileRoute("/__clerk/$")({
  server: { handlers },
});
