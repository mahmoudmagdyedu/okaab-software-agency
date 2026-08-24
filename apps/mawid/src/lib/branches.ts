import { supabase } from "@/integrations/supabase/client";

export interface BranchRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  freeCancellationHours: number;
  depositPercent: number;
  isActive: boolean;
}

export interface BranchClosure {
  id: string;
  branchId: string | null;
  startsAt: string;
  endsAt: string;
  reason: string;
}

/** المناطق الزمنية المدعومة للعرض — التخزين UTC دائمًا. */
export const BRANCH_TIMEZONES: { value: string; label: string }[] = [
  { value: "Asia/Riyadh", label: "الرياض (GMT+3)" },
  { value: "Asia/Baghdad", label: "بغداد (GMT+3)" },
  { value: "Asia/Kuwait", label: "الكويت (GMT+3)" },
  { value: "Asia/Qatar", label: "الدوحة (GMT+3)" },
  { value: "Asia/Bahrain", label: "المنامة (GMT+3)" },
  { value: "Asia/Dubai", label: "دبي (GMT+4)" },
  { value: "Asia/Muscat", label: "مسقط (GMT+4)" },
  { value: "Africa/Cairo", label: "القاهرة (GMT+2/+3)" },
  { value: "Asia/Amman", label: "عمّان (GMT+3)" },
  { value: "Asia/Beirut", label: "بيروت (GMT+2/+3)" },
  { value: "Africa/Casablanca", label: "الدار البيضاء (GMT+1)" },
  { value: "Africa/Tunis", label: "تونس (GMT+1)" },
];

export function branchErrorMessage(message: string): string {
  if (message.includes("row-level security") || message.includes("permission")) {
    return "لا تملك صلاحية تعديل إعدادات الفروع.";
  }
  return "تعذّر حفظ التغييرات، حاول مرة أخرى.";
}

export async function fetchBranches(tenantId: string): Promise<BranchRecord[]> {
  const { data, error } = await supabase
    .from("branches")
    .select(
      "id, name, address, phone, timezone, free_cancellation_hours, deposit_percent, is_active",
    )
    .eq("tenant_id", tenantId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address ?? "",
    phone: b.phone ?? "",
    timezone: b.timezone,
    freeCancellationHours: b.free_cancellation_hours,
    depositPercent: b.deposit_percent,
    isActive: b.is_active,
  }));
}

export async function updateBranch(
  branchId: string,
  patch: {
    name: string;
    address: string;
    phone: string;
    timezone: string;
    freeCancellationHours: number;
    depositPercent: number;
    isActive: boolean;
  },
): Promise<void> {
  const { error } = await supabase
    .from("branches")
    .update({
      name: patch.name,
      address: patch.address,
      phone: patch.phone,
      timezone: patch.timezone,
      free_cancellation_hours: patch.freeCancellationHours,
      deposit_percent: patch.depositPercent,
      is_active: patch.isActive,
    })
    .eq("id", branchId);
  if (error) throw error;
}

export async function fetchBranchClosures(
  tenantId: string,
  branchId: string,
): Promise<BranchClosure[]> {
  const { data, error } = await supabase
    .from("blackout_dates")
    .select("id, branch_id, starts_at, ends_at, reason")
    .eq("tenant_id", tenantId)
    .eq("branch_id", branchId)
    .is("staff_id", null)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    branchId: row.branch_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason ?? "",
  }));
}

/** تحويل يوم محلي (بتوقيت الفرع) إلى لحظة UTC. */
export function localDayToUtc(dateKey: string, timeZone: string, endOfDay: boolean): string {
  const base = new Date(`${dateKey}T${endOfDay ? "23:59:59" : "00:00:00"}Z`);
  const asLocal = new Date(base.toLocaleString("en-US", { timeZone }));
  const offset = asLocal.getTime() - base.getTime();
  return new Date(base.getTime() - offset).toISOString();
}

export async function addBranchClosure(input: {
  tenantId: string;
  branchId: string;
  timezone: string;
  fromDate: string;
  toDate: string;
  reason: string;
}): Promise<void> {
  const startsAt = localDayToUtc(input.fromDate, input.timezone, false);
  const endsAt = localDayToUtc(input.toDate, input.timezone, true);
  if (new Date(endsAt) <= new Date(startsAt)) throw new Error("invalid_range");
  const { error } = await supabase.from("blackout_dates").insert({
    tenant_id: input.tenantId,
    branch_id: input.branchId,
    starts_at: startsAt,
    ends_at: endsAt,
    reason: input.reason.trim() || "إجازة الفرع",
  });
  if (error) throw error;
}

export async function removeBranchClosure(id: string): Promise<void> {
  const { error } = await supabase.from("blackout_dates").delete().eq("id", id);
  if (error) throw error;
}
