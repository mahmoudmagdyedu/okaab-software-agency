import { describe, expect, it } from "vitest";

import {
  computeDaySlots,
  formatDateKey,
  formatTime,
  isSlotFree,
  minuteOfDay,
  weekdayOf,
  zonedToUtc,
} from "./slots";

const TZ = "Africa/Cairo";
const rules = [
  { weekday: 0, startMinute: 9 * 60, endMinute: 21 * 60 },
  { weekday: 1, startMinute: 9 * 60, endMinute: 21 * 60 },
  { weekday: 2, startMinute: 9 * 60, endMinute: 12 * 60 },
];

describe("تحويل التوقيت", () => {
  it("يحوّل توقيت الفرع إلى UTC", () => {
    expect(zonedToUtc("2026-01-12", 9 * 60, TZ).toISOString()).toBe("2026-01-12T07:00:00.000Z");
  });

  it("يحترم التوقيت الصيفي عند تغيّره", () => {
    // القاهرة: توقيت صيفي في يوليو (+03)
    expect(zonedToUtc("2026-07-12", 9 * 60, TZ).toISOString()).toBe("2026-07-12T06:00:00.000Z");
  });

  it("يتعامل مع منتصف الليل وبداية اليوم", () => {
    const midnight = zonedToUtc("2026-01-12", 0, TZ);
    expect(formatTime(midnight, TZ)).toBe("00:00");
    expect(formatDateKey(midnight, TZ)).toBe("2026-01-12");
    expect(minuteOfDay(midnight, TZ)).toBe(0);
  });

  it("يحسب يوم الأسبوع", () => {
    expect(weekdayOf("2026-01-11")).toBe(0); // الأحد
    expect(weekdayOf("2026-01-12")).toBe(1); // الاثنين
  });
});

describe("توليد الفتحات", () => {
  it("يولّد فتحات كل 15 دقيقة داخل قاعدة اليوم", () => {
    const slots = computeDaySlots({
      date: "2026-01-12",
      timeZone: TZ,
      rules,
      busy: [],
      blackouts: [],
      durationMinutes: 30,
      stepMinutes: 15,
    });
    expect(slots[0]?.label).toBe("09:00");
    expect(slots.at(-1)?.label).toBe("20:30");
    expect(slots).toHaveLength(((21 - 9) * 60 - 30) / 15 + 1);
  });

  it("يستبعد الفتحات المحجوزة", () => {
    const slots = computeDaySlots({
      date: "2026-01-12",
      timeZone: TZ,
      rules,
      busy: [{ startsAt: "2026-01-12T07:00:00.000Z", endsAt: "2026-01-12T07:30:00.000Z" }],
      blackouts: [],
      durationMinutes: 30,
      stepMinutes: 30,
    });
    expect(slots.map((s) => s.label)).not.toContain("09:00");
    expect(slots.map((s) => s.label)).toContain("09:30");
  });

  it("يطبّق مدة التحضير قبل الموعد وبعده", () => {
    const slots = computeDaySlots({
      date: "2026-01-12",
      timeZone: TZ,
      rules,
      busy: [{ startsAt: "2026-01-12T08:00:00.000Z", endsAt: "2026-01-12T08:30:00.000Z" }],
      blackouts: [],
      durationMinutes: 30,
      bufferMinutes: 15,
      stepMinutes: 15,
    });
    const labels = slots.map((s) => s.label);
    // الموعد 10:00–10:30 بتوقيت الفرع + 15 دقيقة تحضير ⇒ 09:45–10:45 محجوبة
    expect(labels).not.toContain("09:30");
    expect(labels).not.toContain("10:30");
    expect(labels).toContain("09:15");
    expect(labels).toContain("10:45");
  });

  it("يستبعد أيام الإجازة والاستثناءات", () => {
    const whole = computeDaySlots({
      date: "2026-01-12",
      timeZone: TZ,
      rules,
      busy: [],
      blackouts: [{ startsAt: "2026-01-12T07:00:00.000Z", endsAt: "2026-01-12T19:00:00.000Z" }],
      durationMinutes: 30,
    });
    expect(whole).toHaveLength(0);
  });

  it("يعيد لا شيء ليوم بلا قواعد توفر", () => {
    expect(
      computeDaySlots({
        date: "2026-01-16", // الجمعة
        timeZone: TZ,
        rules,
        busy: [],
        blackouts: [],
        durationMinutes: 30,
      }),
    ).toHaveLength(0);
  });

  it("لا يقترح فتحات ماضية", () => {
    const slots = computeDaySlots({
      date: "2026-01-12",
      timeZone: TZ,
      rules,
      busy: [],
      blackouts: [],
      durationMinutes: 30,
      stepMinutes: 60,
      now: "2026-01-12T12:00:00.000Z",
    });
    expect(slots[0]?.label).toBe("14:00");
  });

  it("يمنع تجاوز نهاية نافذة التوفر", () => {
    const slots = computeDaySlots({
      date: "2026-01-13", // الثلاثاء 9:00–12:00
      timeZone: TZ,
      rules,
      busy: [],
      blackouts: [],
      durationMinutes: 90,
      stepMinutes: 30,
    });
    expect(slots.at(-1)?.label).toBe("10:30");
  });
});

describe("التحقق اللحظي من الفتحة", () => {
  it("يكشف التعارض", () => {
    const busy = [{ startsAt: "2026-01-12T08:00:00.000Z", endsAt: "2026-01-12T08:30:00.000Z" }];
    expect(isSlotFree("2026-01-12T08:15:00.000Z", 30, busy)).toBe(false);
    expect(isSlotFree("2026-01-12T08:30:00.000Z", 30, busy)).toBe(true);
  });
});
