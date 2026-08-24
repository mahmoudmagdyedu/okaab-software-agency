import { supabase } from "@/integrations/supabase/client";

export type TemplateKey =
  "template_confirmation" | "template_reminder" | "template_cancellation" | "template_deposit";

export interface NotificationSettings {
  tenantId: string;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  senderName: string;
  reminderOffsetsHours: number[];
  quietStartMinute: number;
  quietEndMinute: number;
  template_confirmation: string;
  template_reminder: string;
  template_cancellation: string;
  template_deposit: string;
}

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  template_confirmation: "رسالة التأكيد",
  template_reminder: "رسالة التذكير",
  template_cancellation: "رسالة الإلغاء",
  template_deposit: "طلب العربون",
};

/** المتغيرات المسموح بها داخل نصوص الرسائل. */
export const TEMPLATE_VARIABLES = [
  "customer_name",
  "service_name",
  "staff_name",
  "branch_name",
  "date",
  "time",
  "deposit",
  "booking_ref",
] as const;

export const REMINDER_CHOICES = [72, 48, 24, 12, 4, 2, 1] as const;

export const MAX_TEMPLATE_LENGTH = 700;

const SAMPLE: Record<string, string> = {
  customer_name: "سارة العبيدي",
  service_name: "تنظيف الأسنان",
  staff_name: "د. ليان الحسن",
  branch_name: "فرع الزهراء",
  date: "2026-08-24",
  time: "14:30",
  deposit: "150 ج.م",
  booking_ref: "A7F3C9D1",
};

/** استبدال المتغيرات ببيانات نموذجية للمعاينة قبل الحفظ. */
export function renderPreview(template: string): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) => SAMPLE[key] ?? match);
}

/** المتغيرات المكتوبة في النص وغير المعروفة. */
export function unknownVariables(template: string): string[] {
  const found = [...template.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/g)]
    .map((m) => m[1] ?? "")
    .filter((key) => key.length > 0);
  return [...new Set(found.filter((key) => !TEMPLATE_VARIABLES.includes(key as never)))];
}

export function minuteLabel(minute: number): string {
  const h = Math.floor(minute / 60) % 24;
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseMinuteLabel(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export async function fetchNotificationSettings(tenantId: string): Promise<NotificationSettings> {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("no_settings");

  return {
    tenantId: data.tenant_id,
    whatsappEnabled: data.whatsapp_enabled,
    smsEnabled: data.sms_enabled,
    senderName: data.sender_name,
    reminderOffsetsHours: [...data.reminder_offsets_hours].sort((a, b) => b - a),
    quietStartMinute: data.quiet_start_minute,
    quietEndMinute: data.quiet_end_minute,
    template_confirmation: data.template_confirmation,
    template_reminder: data.template_reminder,
    template_cancellation: data.template_cancellation,
    template_deposit: data.template_deposit,
  };
}

export function validateSettings(s: NotificationSettings): string | null {
  if (!s.whatsappEnabled && !s.smsEnabled) return "اختر قناة واحدة على الأقل.";
  if (s.senderName.trim().length === 0) return "اسم المُرسِل مطلوب.";
  if (s.senderName.trim().length > 60) return "اسم المُرسِل أطول من 60 حرفًا.";
  if (s.reminderOffsetsHours.length === 0) return "اختر توقيت تذكير واحدًا على الأقل.";
  for (const key of Object.keys(TEMPLATE_LABELS) as TemplateKey[]) {
    const text = s[key].trim();
    if (text.length === 0) return `${TEMPLATE_LABELS[key]}: النص مطلوب.`;
    if (text.length > MAX_TEMPLATE_LENGTH)
      return `${TEMPLATE_LABELS[key]}: النص أطول من ${MAX_TEMPLATE_LENGTH} حرفًا.`;
    const unknown = unknownVariables(text);
    if (unknown.length > 0) return `${TEMPLATE_LABELS[key]}: متغير غير معروف {{${unknown[0]}}}.`;
  }
  return null;
}

export async function saveNotificationSettings(s: NotificationSettings): Promise<void> {
  const invalid = validateSettings(s);
  if (invalid) throw new Error(invalid);

  const { error } = await supabase
    .from("notification_settings")
    .update({
      whatsapp_enabled: s.whatsappEnabled,
      sms_enabled: s.smsEnabled,
      sender_name: s.senderName.trim(),
      reminder_offsets_hours: [...s.reminderOffsetsHours].sort((a, b) => b - a),
      quiet_start_minute: s.quietStartMinute,
      quiet_end_minute: s.quietEndMinute,
      template_confirmation: s.template_confirmation.trim(),
      template_reminder: s.template_reminder.trim(),
      template_cancellation: s.template_cancellation.trim(),
      template_deposit: s.template_deposit.trim(),
    })
    .eq("tenant_id", s.tenantId);
  if (error) throw error;
}
