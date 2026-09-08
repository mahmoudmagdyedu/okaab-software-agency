import { renderErrorPage } from "./error-page.ts";
import {
  applyBaseSecurityHeaders,
  applyHtmlSecurityHeaders,
  injectNonceIntoTags,
  nonceTransformStream,
  type ResponseSecurityOptions,
} from "./security-headers.ts";

type SecureResponseOptions = ResponseSecurityOptions & { htmlPolicy?: boolean };

export function errorResponse(nonce: string, options: ResponseSecurityOptions = {}): Response {
  const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
  applyHtmlSecurityHeaders(headers, nonce, options);
  return new Response(injectNonceIntoTags(renderErrorPage(), nonce), { status: 500, headers });
}

export function secureResponse(
  response: Response,
  nonce: string,
  { htmlPolicy = true, ...options }: SecureResponseOptions = {},
): Response {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const headers = new Headers(response.headers);

  if (!htmlPolicy || !contentType.includes("text/html")) {
    applyBaseSecurityHeaders(headers, options);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  applyHtmlSecurityHeaders(headers, nonce, options);
  headers.delete("content-length");
  headers.delete("etag");
  return new Response(response.body ? nonceTransformStream(response.body, nonce) : null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
