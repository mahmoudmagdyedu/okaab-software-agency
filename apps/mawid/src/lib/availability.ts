import { supabase } from "@/integrations/supabase/client";

export const WEEKDAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export interface StaffOption {
  id: string;
  branchId: string;
  fullName: string;
  specialty: string;
}

export interface WorkWindow {
  id: string;
  staffId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
}

export interface Exception {
  id: string;
  staffId: string | null;
  branchId: string | null;
  startsAt: string;
  endsAt: string;
  reason: string;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

export function availabilityErrorMessage(message: string): string {
  if (message.includes("invalid_window")) return "نهاية النافذة يجب أن تكون بعد بدايتها.";
  if (message.includes("overlap")) return "النافذة تتقاطع مع نافذة أخرى في اليوم نفسه.";
  if (message.includes("invalid_range")) return "مدة الاستثناء غير صحيحة.";
  if (message.includes("row-level security") || message.includes("permission")) {
    return "لا تملك صلاحية تعديل التوفر.";
  }
  return "تعذّر حفظ التغييرات، حاول مرة أخرى.";
}

export async function fetchStaffOptions(tenantId: string): Promise<StaffOption[]> {
  const { data, error } = await supabase
    .from("staff")
    .select("id, branch_id, full_name, specialty")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    branchId: s.branch_id,
    fullName: s.full_name,
    specialty: s.specialty ?? "",
  }));
}

export async function fetchWorkWindows(staffId: string): Promise<WorkWindow[]> {
  const { data, error } = await supabase
    .from("availability_rules")
    .select("id, staff_id, weekday, start_minute, end_minute, is_active")
    .eq("staff_id", staffId)
    .order("weekday")
    .order("start_minute");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    staffId: r.staff_id,
    weekday: r.weekday,
    startMinute: r.start_minute,
    endMinute: r.end_minute,
    isActive: r.is_active,
  }));
}

export async function addWorkWindow(input: {
  tenantId: string;
  staffId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  existing: WorkWindow[];
}): Promise<void> {
  if (input.endMinute <= input.startMinute) throw new Error("invalid_window");
  const clash = input.existing.some(
    (w) =>
      w.weekday === input.weekday &&
      w.isActive &&
      input.startMinute < w.endMinute &&
      input.endMinute > w.startMinute,
  );
  if (clash) throw new Error("overlap");
  const { error } = await supabase.from("availability_rules").insert({
    tenant_id: input.tenantId,
    staff_id: input.staffId,
    weekday: input.weekday,
    start_minute: input.startMinute,
    end_minute: input.endMinute,
    is_active: true,
  });
  if (error) throw error;
}

export async function toggleWorkWindow(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("availability_rules")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}

export async function removeWorkWindow(id: string): Promise<void> {
  const { error } = await supabase.from("availability_rules").delete().eq("id", id);
  if (error) throw error;
}

/** نسخ نوافذ يوم واحد على بقية أيام الأسبوع المحددة. */
export async function copyDayWindows(input: {
  tenantId: string;
  staffId: string;
  windows: WorkWindow[];
  fromWeekday: number;
  toWeekdays: number[];
}): Promise<void> {
  const source = input.windows.filter((w) => w.weekday === input.fromWeekday);
  if (source.length === 0) throw new Error("invalid_window");
  const targets = input.toWeekdays.filter((d) => d !== input.fromWeekday);
  if (targets.length === 0) return;

  const { error: delError } = await supabase
    .from("availability_rules")
    .delete()
    .eq("staff_id", input.staffId)
    .in("weekday", targets);
  if (delError) throw delError;

  const rows = targets.flatMap((weekday) =>
    source.map((w) => ({
      tenant_id: input.tenantId,
      staff_id: input.staffId,
      weekday,
      start_minute: w.startMinute,
      end_minute: w.endMinute,
      is_active: w.isActive,
    })),
  );
  const { error } = await supabase.from("availability_rules").insert(rows);
  if (error) throw error;
}

export async function fetchExceptions(
  tenantId: string,
  staffId: string,
  branchId: string,
): Promise<Exception[]> {
  const { data, error } = await supabase
    .from("blackout_dates")
    .select("id, staff_id, branch_id, starts_at, ends_at, reason")
    .eq("tenant_id", tenantId)
    .or(`staff_id.eq.${staffId},branch_id.eq.${branchId}`)
    .order("starts_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    staffId: row.staff_id,
    branchId: row.branch_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason ?? "",
  }));
}

/** تحويل يوم+وقت محلي (بتوقيت الفرع) إلى لحظة UTC. */
export function localToUtc(dateKey: string, time: string, timeZone: string): string {
  const base = new Date(`${dateKey}T${time}:00Z`);
  const asLocal = new Date(base.toLocaleString("en-US", { timeZone }));
  const offset = asLocal.getTime() - base.getTime();
  return new Date(base.getTime() - offset).toISOString();
}

export async function addException(input: {
  tenantId: string;
  staffId: string | null;
  branchId: string;
  timezone: string;
  date: string;
  fromTime: string;
  toTime: string;
  reason: string;
}): Promise<void> {
  const startsAt = localToUtc(input.date, input.fromTime, input.timezone);
  const endsAt = localToUtc(input.date, input.toTime, input.timezone);
  if (new Date(endsAt) <= new Date(startsAt)) throw new Error("invalid_range");
  const { error } = await supabase.from("blackout_dates").insert({
    tenant_id: input.tenantId,
    staff_id: input.staffId,
    branch_id: input.staffId ? null : input.branchId,
    starts_at: startsAt,
    ends_at: endsAt,
    reason: input.reason.trim() || "استثناء توفر",
  });
  if (error) throw error;
}

export async function removeException(id: string): Promise<void> {
  const { error } = await supabase.from("blackout_dates").delete().eq("id", id);
  if (error) throw error;
}
