import { createHash } from "node:crypto";

export type QuoteIdempotencyInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
  locale?: string | undefined;
  pageUrl?: string | undefined;
  formStartedAt: number;
};

// Security: Bounding string length prevents resource exhaustion (DoS) during JSON stringification
// and crypto hashing when handling untrusted user input fields.
function capLength(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

export function quoteIdempotencyKey(data: QuoteIdempotencyInput): string {
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify([
        capLength(data.name, 500),
        capLength(data.email.toLowerCase(), 500),
        capLength(data.phone, 100),
        capLength(data.service, 500),
        capLength(data.details, 5000),
        capLength(data.locale ?? "", 50),
        capLength(data.pageUrl ?? "", 2000),
        data.formStartedAt,
      ]),
    )
    .digest("hex");
  return `quote-${fingerprint}`;
}

export function quoteRejection(retryAfterSeconds?: number): Response {
  const status = retryAfterSeconds ? 429 : 400;
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  if (retryAfterSeconds) headers.set("retry-after", String(retryAfterSeconds));
  return new Response(JSON.stringify({ error: "Unable to accept this quote request" }), {
    status,
    headers,
  });
}
