import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(40),
  service: z.string().trim().min(1).max(120),
  details: z.string().trim().min(1).max(3000),
  locale: z.string().trim().max(10).optional(),
  pageUrl: z.string().trim().max(300).optional(),
})

export const submitQuoteRequest = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    const result = await sendTemplateEmail('quote-request', 'sales@okaab.org', {
      templateData: data,
      replyTo: data.email,
      idempotencyKey: `quote-${data.email}-${Date.now()}`,
    })
    return { ok: result.sent }
  })
