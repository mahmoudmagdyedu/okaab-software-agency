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

export function quoteIdempotencyKey(data: QuoteIdempotencyInput): string {
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify([
        data.name,
        data.email.toLowerCase(),
        data.phone,
        data.service,
        data.details,
        data.locale ?? "",
        data.pageUrl ?? "",
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
