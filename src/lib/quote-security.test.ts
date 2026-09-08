import assert from "node:assert/strict";
import test from "node:test";

import {
  quoteIdempotencyKey,
  quoteRejection,
  type QuoteIdempotencyInput,
} from "./quote-security.ts";

const base: QuoteIdempotencyInput = {
  name: "Mahmoud",
  email: "USER@example.com",
  phone: "+201234567890",
  service: "Web development",
  details: "A legitimate project request",
  locale: "en",
  pageUrl: "https://okaab.org/",
  formStartedAt: 1_800_000_000_000,
};

test("quote retries keep one stable idempotency key", () => {
  assert.equal(
    quoteIdempotencyKey(base),
    quoteIdempotencyKey({ ...base, email: "user@example.com" }),
  );
});

test("every forwarded quote field participates in idempotency", () => {
  const original = quoteIdempotencyKey(base);
  const variants: QuoteIdempotencyInput[] = [
    { ...base, name: "Different name" },
    { ...base, phone: "+201111111111" },
    { ...base, service: "Mobile app" },
    { ...base, details: "Different request" },
    { ...base, locale: "ar" },
    { ...base, pageUrl: "https://okaab.org/en/" },
    { ...base, formStartedAt: base.formStartedAt + 1 },
  ];
  assert.ok(variants.every((variant) => quoteIdempotencyKey(variant) !== original));
});

test("rate-limit rejection preserves 429 and Retry-After", async () => {
  const response = quoteRejection(900);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
  assert.deepEqual(await response.json(), { error: "Unable to accept this quote request" });
});
