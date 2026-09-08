import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { consumeQuoteRateLimits } from "@/lib/quote-rate-limit";
import { quoteIdempotencyKey, quoteRejection } from "@/lib/quote-security";

const subjectField = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\r\n]*$/, "Line breaks are not allowed");

const schema = z.object({
  name: subjectField(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(40),
  service: subjectField(120),
  details: z.string().trim().min(1).max(3000),
  locale: z.string().trim().max(10).optional(),
  pageUrl: z.string().trim().max(300).optional(),
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().positive(),
});

const MIN_FORM_COMPLETION_MS = 1_200;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1_000;

function rejectAbusiveRequest(retryAfterSeconds?: number): never {
  throw quoteRejection(retryAfterSeconds);
}

function trustedClientAddress() {
  const forwardedFor = getRequestHeader("x-forwarded-for");
  if (process.env["DYNO"] && forwardedFor) {
    const addresses = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (addresses.length > 0) return addresses.at(-1)!;
  }

  return getRequestIP() || "unknown";
}

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const elapsed = Date.now() - data.formStartedAt;
    if (data.website || elapsed < MIN_FORM_COMPLETION_MS || elapsed > MAX_FORM_AGE_MS) {
      rejectAbusiveRequest();
    }

    const ip = trustedClientAddress();
    const email = data.email.toLowerCase();
    const rateLimit = await consumeQuoteRateLimits([
      { identity: `ip:${ip}`, limit: 5, windowMs: 10 * 60 * 1_000 },
      { identity: `email:${email}`, limit: 3, windowMs: 30 * 60 * 1_000 },
    ]);
    if (!rateLimit.allowed) rejectAbusiveRequest(rateLimit.retryAfterSeconds);

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const result = await sendTemplateEmail("quote-request", "sales@okaab.org", {
      templateData: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        details: data.details,
        locale: data.locale,
        pageUrl: data.pageUrl,
      },
      replyTo: data.email,
      idempotencyKey: quoteIdempotencyKey(data),
    });
    return { ok: result.sent };
  });
