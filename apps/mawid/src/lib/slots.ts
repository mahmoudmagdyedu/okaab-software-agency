/**
 * محرك الفتحات — دوال TypeScript نقية يشترك فيها الواجهة والخادم.
 * التخزين UTC دائمًا، والحساب بتوقيت الفرع.
 * الفتحات المتاحة = قواعد التوفر − الحجوزات − الاستثناءات − مدة التحضير.
 */

export interface AvailabilityRule {
  /** 0 = الأحد … 6 = السبت (متوافق مع Date.getUTCDay) */
  weekday: number;
  /** دقائق من منتصف ليل يوم الفرع */
  startMinute: number;
  endMinute: number;
}

export interface TimeRange {
  /** ISO UTC */
  startsAt: string;
  endsAt: string;
}

export interface SlotEngineInput {
  /** تاريخ اليوم بتوقيت الفرع بصيغة YYYY-MM-DD */
  date: string;
  timeZone: string;
  rules: AvailabilityRule[];
  /** المواعيد القائمة (UTC) */
  busy: TimeRange[];
  /** الإجازات والاستثناءات (UTC) */
  blackouts: TimeRange[];
  durationMinutes: number;
  /** مدة التحضير قبل الموعد وبعده */
  bufferMinutes?: number;
  /** خطوة توليد الفتحات بالدقائق */
  stepMinutes?: number;
  /** لا تُقترح فتحات قبل هذه اللحظة (ISO UTC) */
  now?: string;
}

export interface Slot {
  /** ISO UTC */
  startsAt: string;
  endsAt: string;
  /** التسمية المعروضة بتوقيت الفرع، LTR */
  label: string;
}

const MINUTE = 60_000;

/** إزاحة المنطقة الزمنية بالدقائق عند لحظة معيّنة. */
export function timeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(instant);
  const pick = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asUTC = Date.UTC(
    pick("year"),
    pick("month") - 1,
    pick("day"),
    pick("hour") % 24,
    pick("minute"),
    pick("second"),
  );
  return (asUTC - instant.getTime()) / MINUTE;
}

/** يحوّل (تاريخ فرع + دقائق من منتصف ليله) إلى لحظة UTC. */
export function zonedToUtc(date: string, minuteOfDay: number, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const naive = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 0, 0, 0) + minuteOfDay * MINUTE;
  let guess = new Date(naive - timeZoneOffsetMinutes(new Date(naive), timeZone) * MINUTE);
  // تصحيح ثانٍ يلزم عند حدود تغيّر التوقيت الصيفي
  guess = new Date(naive - timeZoneOffsetMinutes(guess, timeZone) * MINUTE);
  return guess;
}

/** يوم الأسبوع (0..6) لتاريخ بتوقيت الفرع. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).getUTCDay();
}

/** تنسيق الوقت LTR بتوقيت الفرع مثل 10:30 */
export function formatTime(instant: Date | string, timeZone: string): string {
  const dt = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

/** التاريخ بصيغة YYYY-MM-DD بتوقيت الفرع. */
export function formatDateKey(instant: Date | string, timeZone: string): string {
  const dt = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
}

/** دقائق من منتصف ليل يوم الفرع للحظة UTC. */
export function minuteOfDay(instant: Date | string, timeZone: string): number {
  const [h, m] = formatTime(instant, timeZone).split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** يولّد الفتحات المتاحة ليوم واحد بتوقيت الفرع. */
export function computeDaySlots(input: SlotEngineInput): Slot[] {
  const {
    date,
    timeZone,
    rules,
    busy,
    blackouts,
    durationMinutes,
    bufferMinutes = 0,
    stepMinutes = 15,
    now,
  } = input;

  if (durationMinutes <= 0) return [];

  const weekday = weekdayOf(date);
  const dayRules = rules.filter((r) => r.weekday === weekday && r.endMinute > r.startMinute);
  if (dayRules.length === 0) return [];

  const blocked = [...busy, ...blackouts].map((r) => ({
    start: new Date(r.startsAt).getTime() - bufferMinutes * MINUTE,
    end: new Date(r.endsAt).getTime() + bufferMinutes * MINUTE,
  }));
  const floor = now ? new Date(now).getTime() : Number.NEGATIVE_INFINITY;

  const slots: Slot[] = [];
  const seen = new Set<number>();

  for (const rule of dayRules) {
    for (let m = rule.startMinute; m + durationMinutes <= rule.endMinute; m += stepMinutes) {
      const start = zonedToUtc(date, m, timeZone);
      const startMs = start.getTime();
      const endMs = startMs + durationMinutes * MINUTE;
      if (startMs < floor) continue;
      if (seen.has(startMs)) continue;
      if (blocked.some((b) => overlaps(startMs, endMs, b.start, b.end))) continue;
      seen.add(startMs);
      slots.push({
        startsAt: new Date(startMs).toISOString(),
        endsAt: new Date(endMs).toISOString(),
        label: formatTime(start, timeZone),
      });
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** هل الفتحة المطلوبة متاحة فعلًا؟ (تحقق لحظي قبل السحب والإفلات) */
export function isSlotFree(
  startsAt: string,
  durationMinutes: number,
  busy: TimeRange[],
  bufferMinutes = 0,
): boolean {
  const startMs = new Date(startsAt).getTime();
  const endMs = startMs + durationMinutes * MINUTE;
  return !busy.some((b) =>
    overlaps(
      startMs,
      endMs,
      new Date(b.startsAt).getTime() - bufferMinutes * MINUTE,
      new Date(b.endsAt).getTime() + bufferMinutes * MINUTE,
    ),
  );
}
