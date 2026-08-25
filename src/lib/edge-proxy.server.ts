function configuration() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing Supabase public configuration");
  return { url: url.replace(/\/$/, ""), key };
}

export async function invokeEdge(name: string, request: Request, body?: unknown, query = "") {
  const { url, key } = configuration();
  const headers = new Headers({ apikey: key });
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const signature = request.headers.get("x-hub-signature");
  if (signature) headers.set("x-hub-signature", signature);
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("content-type", "application/json");
    payload = JSON.stringify(body);
  } else if (!["GET", "HEAD"].includes(request.method)) {
    headers.set("content-type", request.headers.get("content-type") ?? "application/octet-stream");
    payload = await request.arrayBuffer();
  }
  const init: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(55_000),
  };
  if (payload !== undefined) init.body = payload;
  return fetch(`${url}/functions/v1/${name}${query}`, init);
}

export function copyEdgeResponse(response: Response) {
  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}
