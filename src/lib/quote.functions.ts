import { createServerFn } from '@tanstack/react-start'
import { getRequestIP, setResponseHeader, setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'

import { consumeQuoteRateLimit } from '@/lib/quote-rate-limit'

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(40),
  service: z.string().trim().min(1).max(120),
  details: z.string().trim().min(1).max(3000),
  locale: z.string().trim().max(10).optional(),
  pageUrl: z.string().trim().max(300).optional(),
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().positive(),
})

const MIN_FORM_COMPLETION_MS = 1_200
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1_000

function rejectAbusiveRequest(retryAfterSeconds?: number): never {
  if (retryAfterSeconds) {
    setResponseStatus(429)
    setResponseHeader('retry-after', String(retryAfterSeconds))
  } else {
    setResponseStatus(400)
  }
  throw new Error('Unable to accept this quote request')
}

export const submitQuoteRequest = createServerFn({ method: 'POST' })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const elapsed = Date.now() - data.formStartedAt
    if (data.website || elapsed < MIN_FORM_COMPLETION_MS || elapsed > MAX_FORM_AGE_MS) {
      rejectAbusiveRequest()
    }

    const ip = getRequestIP({ xForwardedFor: true }) || 'unknown'
    const email = data.email.toLowerCase()
    const limits = [
      consumeQuoteRateLimit(`ip:${ip}`, 5, 10 * 60 * 1_000),
      consumeQuoteRateLimit(`email:${email}`, 3, 30 * 60 * 1_000),
    ]
    const blocked = limits.find((limit) => !limit.allowed)
    if (blocked) rejectAbusiveRequest(blocked.retryAfterSeconds)

    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    const result = await sendTemplateEmail('quote-request', 'sales@okaab.org', {
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
      idempotencyKey: `quote-${data.email}-${Date.now()}`,
    })
    return { ok: result.sent }
  })
