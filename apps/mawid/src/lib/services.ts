import { supabase } from "@/integrations/supabase/client";

export interface ServiceRecord {
  id: string;
  branchId: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents: number;
  depositCents: number;
  isActive: boolean;
}

export interface ServiceInput {
  branchId: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents: number;
  depositCents: number;
  isActive: boolean;
}

export const DURATION_PRESETS = [15, 20, 30, 45, 60, 90, 120];

export function serviceErrorMessage(message: string): string {
  if (message.includes("invalid_name")) return "اسم الخدمة يجب أن يكون حرفين على الأقل.";
  if (message.includes("invalid_duration")) return "المدة يجب أن تكون بين 5 و480 دقيقة.";
  if (message.includes("invalid_price")) return "السعر أو العربون غير صحيح.";
  if (message.includes("deposit_gt_price")) return "العربون لا يمكن أن يتجاوز سعر الخدمة.";
  if (message.includes("has_appointments"))
    return "لا يمكن حذف خدمة لها مواعيد؛ أوقِف تفعيلها بدلًا من ذلك.";
  if (message.includes("row-level security") || message.includes("permission")) {
    return "لا تملك صلاحية تعديل الخدمات.";
  }
  return "تعذّر حفظ التغييرات، حاول مرة أخرى.";
}

export function validateService(input: ServiceInput): void {
  if (input.name.trim().length < 2) throw new Error("invalid_name");
  if (input.durationMinutes < 5 || input.durationMinutes > 480) throw new Error("invalid_duration");
  if (
    input.bufferMinutes < 0 ||
    input.bufferMinutes > 120 ||
    input.priceCents < 0 ||
    input.depositCents < 0
  ) {
    throw new Error("invalid_price");
  }
  if (input.depositCents > input.priceCents) throw new Error("deposit_gt_price");
}

export function formatMoney(cents: number, currency = "SAR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function fetchServices(tenantId: string): Promise<ServiceRecord[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, branch_id, name, description, duration_minutes, buffer_minutes, price_cents, deposit_cents, is_active",
    )
    .eq("tenant_id", tenantId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    branchId: row.branch_id,
    name: row.name,
    description: row.description ?? "",
    durationMinutes: row.duration_minutes,
    bufferMinutes: row.buffer_minutes,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    isActive: row.is_active,
  }));
}

export async function createService(tenantId: string, input: ServiceInput): Promise<void> {
  validateService(input);
  const { error } = await supabase.from("services").insert({
    tenant_id: tenantId,
    branch_id: input.branchId,
    name: input.name.trim(),
    description: input.description.trim(),
    duration_minutes: input.durationMinutes,
    buffer_minutes: input.bufferMinutes,
    price_cents: input.priceCents,
    deposit_cents: input.depositCents,
    is_active: input.isActive,
  });
  if (error) throw error;
}

export async function updateService(id: string, input: ServiceInput): Promise<void> {
  validateService(input);
  const { error } = await supabase
    .from("services")
    .update({
      branch_id: input.branchId,
      name: input.name.trim(),
      description: input.description.trim(),
      duration_minutes: input.durationMinutes,
      buffer_minutes: input.bufferMinutes,
      price_cents: input.priceCents,
      deposit_cents: input.depositCents,
      is_active: input.isActive,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function toggleService(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("service_id", id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) throw new Error("has_appointments");

  await supabase.from("staff_services").delete().eq("service_id", id);
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}
