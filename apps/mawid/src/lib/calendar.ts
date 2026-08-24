import { supabase } from "@/integrations/supabase/client";
import type { AppointmentStatus } from "@/components/mawid/status-badge";
import { formatDateKey, formatTime, minuteOfDay } from "@/lib/slots";

export const DAY_START_MINUTE = 9 * 60; // 9:00 صباحًا
export const DAY_END_MINUTE = 21 * 60; // 9:00 مساءً
export const SLOT_MINUTES = 30;
export const SLOT_HEIGHT_PX = 64; // 30 دقيقة ≈ 64px
export const PX_PER_MINUTE = SLOT_HEIGHT_PX / SLOT_MINUTES;

export interface CalendarStaff {
  id: string;
  fullName: string;
  specialty: string;
}

export interface CalendarService {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  depositCents: number;
}

export interface CalendarAppointment {
  id: string;
  staffId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  startLabel: string;
  endLabel: string;
  dateKey: string;
  startMinute: number;
  durationMinutes: number;
  priceCents: number;
  depositCents: number;
  depositPaidCents: number;
  note: string;
  bookingRef: string;
}

export interface CalendarWeek {
  tenantName: string;
  branchName: string;
  timeZone: string;
  days: string[];
  staff: CalendarStaff[];
  services: CalendarService[];
  appointments: CalendarAppointment[];
}

/** بداية أسبوع الفرع (السبت) بصيغة YYYY-MM-DD. */
export function weekStartOf(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  const shift = (dt.getUTCDay() + 1) % 7; // السبت = بداية الأسبوع
  dt.setUTCDate(dt.getUTCDate() - shift);
  return dt.toISOString().slice(0, 10);
}

export function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

const WEEKDAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function weekdayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).getUTCDay()] ?? "";
}

export function dayNumberLabel(dateKey: string): string {
  return dateKey.slice(8, 10);
}

interface Row {
  id: string;
  staff_id: string;
  customer_id: string;
  service_id: string;
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  deposit_cents: number;
  deposit_paid_cents: number;
  note: string | null;
  booking_ref: string;
  customers: { full_name: string; phone: string | null } | null;
  services: { name: string } | null;
}

export async function fetchCalendarWeek(
  tenantId: string,
  weekStart: string,
): Promise<CalendarWeek> {
  const [tenantRes, branchRes, staffRes, servicesRes] = await Promise.all([
    supabase.from("tenants").select("name").eq("id", tenantId).maybeSingle(),
    supabase
      .from("branches")
      .select("name, timezone")
      .eq("tenant_id", tenantId)
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("staff")
      .select("id, full_name, specialty")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("created_at"),
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents, deposit_cents")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (tenantRes.error) throw tenantRes.error;
  if (branchRes.error) throw branchRes.error;
  if (staffRes.error) throw staffRes.error;
  if (servicesRes.error) throw servicesRes.error;

  const timeZone = branchRes.data?.timezone ?? "Africa/Cairo";
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i));
  const rangeStart = new Date(`${weekStart}T00:00:00Z`);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 1);
  const rangeEnd = new Date(`${addDaysKey(weekStart, 8)}T00:00:00Z`);

  const apptRes = await supabase
    .from("appointments")
    .select(
      "id, staff_id, customer_id, service_id, status, starts_at, ends_at, price_cents, deposit_cents, deposit_paid_cents, note, booking_ref, customers(full_name, phone), services(name)",
    )
    .eq("tenant_id", tenantId)
    .gte("starts_at", rangeStart.toISOString())
    .lt("starts_at", rangeEnd.toISOString())
    .order("starts_at");

  if (apptRes.error) throw apptRes.error;

  const appointments: CalendarAppointment[] = ((apptRes.data ?? []) as unknown as Row[]).map(
    (row) => ({
      id: row.id,
      staffId: row.staff_id,
      customerId: row.customer_id,
      customerName: row.customers?.full_name ?? "عميل",
      customerPhone: row.customers?.phone ?? "",
      serviceId: row.service_id,
      serviceName: row.services?.name ?? "خدمة",
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      startLabel: formatTime(row.starts_at, timeZone),
      endLabel: formatTime(row.ends_at, timeZone),
      dateKey: formatDateKey(row.starts_at, timeZone),
      startMinute: minuteOfDay(row.starts_at, timeZone),
      durationMinutes: Math.round(
        (new Date(row.ends_at).getTime() - new Date(row.starts_at).getTime()) / 60000,
      ),
      priceCents: row.price_cents,
      depositCents: row.deposit_cents,
      depositPaidCents: row.deposit_paid_cents,
      note: row.note ?? "",
      bookingRef: row.booking_ref,
    }),
  );

  return {
    tenantName: tenantRes.data?.name ?? "منشأتي",
    branchName: branchRes.data?.name ?? "الفرع الرئيسي",
    timeZone,
    days,
    staff: (staffRes.data ?? []).map((s) => ({
      id: s.id,
      fullName: s.full_name,
      specialty: s.specialty ?? "",
    })),
    services: (servicesRes.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.duration_minutes,
      priceCents: s.price_cents,
      depositCents: s.deposit_cents,
    })),
    appointments,
  };
}

export interface AppointmentEvent {
  id: string;
  eventType: string;
  createdAt: string;
}

export async function fetchAppointmentEvents(appointmentId: string): Promise<AppointmentEvent[]> {
  const { data, error } = await supabase
    .from("appointment_events")
    .select("id, event_type, created_at")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    eventType: row.event_type,
    createdAt: row.created_at,
  }));
}

export const EVENT_LABELS: Record<string, string> = {
  created: "أُنشئ الموعد",
  rescheduled: "أُعيدت جدولته",
  status_changed: "تغيّرت الحالة",
  deposit_paid: "دُفع العربون",
};

/** الساعات المعروضة في عمود الوقت. */
export function hourMarks(): number[] {
  const marks: number[] = [];
  for (let m = DAY_START_MINUTE; m <= DAY_END_MINUTE; m += 60) marks.push(m);
  return marks;
}

export function minuteLabel(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function moneyLabel(cents: number): string {
  return `${(cents / 100).toLocaleString("en-US")} ج.م`;
}
