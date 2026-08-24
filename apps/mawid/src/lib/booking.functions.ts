import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getBookingBoard = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { loadPublicBoard } = await import("@/lib/booking.server");
    return loadPublicBoard(data.slug);
  });

export const getBookingSlots = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        serviceId: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        staffId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { loadDaySlots } = await import("@/lib/booking.server");
    return loadDaySlots(data);
  });

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        serviceId: z.string().uuid(),
        staffId: z.string().uuid(),
        startsAt: z.string().min(1),
        fullName: z.string().trim().min(2).max(80),
        phone: z
          .string()
          .trim()
          .regex(/^[0-9+\s-]{8,20}$/),
        email: z.string().trim().email().optional().or(z.literal("")),
        note: z.string().trim().max(300).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createPublicBooking } = await import("@/lib/booking.server");
    return createPublicBooking(data);
  });
