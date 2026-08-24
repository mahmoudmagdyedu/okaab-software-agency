import { supabase } from "@/integrations/supabase/client";
import type { AppointmentStatus } from "@/components/mawid/status-badge";

export interface TodayAppointment {
  id: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  timeLabel: string;
  status: AppointmentStatus;
}

export interface TodayBoard {
  tenantName: string;
  branchName: string;
  todayLabel: string;
  total: number;
  expectedRevenueCents: number;
  occupancyPercent: number;
  noShow: number;
  appointments: TodayAppointment[];
}

/** طول يوم العمل بالدقائق لكل مقدم خدمة (9:00 – 21:00). */
const WORKDAY_MINUTES = 720;

function timeLabel(startsAt: string, endsAt: string, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  return `${fmt.format(new Date(startsAt))} – ${fmt.format(new Date(endsAt))}`;
}

export async function fetchToday(tenantId: string): Promise<TodayBoard> {
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("name, timezone, branches(name)")
    .eq("id", tenantId)
    .single();
  if (tenantError) throw tenantError;

  const timeZone = tenant.timezone;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const { data: rows, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, price_cents, customers(full_name), services(name, duration_minutes), staff(full_name)",
    )
    .eq("tenant_id", tenantId)
    .gte("starts_at", dayStart.toISOString())
    .lt("starts_at", dayEnd.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;

  const { count: staffCount } = await supabase
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  const list = rows ?? [];
  const bookedMinutes = list
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (r.services?.duration_minutes ?? 0), 0);
  const capacity = Math.max(1, (staffCount ?? 1) * WORKDAY_MINUTES);

  return {
    tenantName: tenant.name,
    branchName: tenant.branches?.[0]?.name ?? "",
    todayLabel: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone }).format(
      dayStart,
    ),
    total: list.length,
    expectedRevenueCents: list
      .filter((r) => r.status === "confirmed" || r.status === "completed")
      .reduce((sum, r) => sum + r.price_cents, 0),
    occupancyPercent: Math.min(100, Math.round((bookedMinutes / capacity) * 100)),
    noShow: list.filter((r) => r.status === "no_show").length,
    appointments: list.map((r) => ({
      id: r.id,
      customerName: r.customers?.full_name ?? "",
      serviceName: r.services?.name ?? "",
      staffName: r.staff?.full_name ?? "",
      timeLabel: timeLabel(r.starts_at, r.ends_at, timeZone),
      status: r.status as AppointmentStatus,
    })),
  };
}
