import { supabase } from "@/integrations/supabase/client";
import type { AppointmentStatus } from "@/components/mawid/status-badge";

export const PAGE_SIZE = 10;

export interface AppointmentRow {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  dateLabel: string;
  timeLabel: string;
  priceCents: number;
  status: AppointmentStatus;
}

export interface AppointmentsPage {
  rows: AppointmentRow[];
  total: number;
  timeZone: string;
}

export interface AppointmentsQuery {
  tenantId: string;
  search: string;
  status: AppointmentStatus | "all";
  sort: "starts_at" | "price_cents";
  direction: "asc" | "desc";
  page: number;
}

async function tenantTimeZone(tenantId: string): Promise<string> {
  const { data, error } = await supabase
    .from("tenants")
    .select("timezone")
    .eq("id", tenantId)
    .single();
  if (error) throw error;
  return data.timezone;
}

function fmtTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(iso));
}

function fmtDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone }).format(new Date(iso));
}

export async function fetchAppointments(q: AppointmentsQuery): Promise<AppointmentsPage> {
  const timeZone = await tenantTimeZone(q.tenantId);

  let query = supabase
    .from("appointments")
    .select(
      "id, booking_ref, starts_at, ends_at, status, price_cents, customer_id, customers(full_name, phone), services(name), staff(full_name)",
      { count: "exact" },
    )
    .eq("tenant_id", q.tenantId);

  if (q.status !== "all") query = query.eq("status", q.status);
  if (q.search.trim()) query = query.ilike("booking_ref", `%${q.search.trim()}%`);

  const from = q.page * PAGE_SIZE;
  const { data, error, count } = await query
    .order(q.sort, { ascending: q.direction === "asc" })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  return {
    total: count ?? 0,
    timeZone,
    rows: (data ?? []).map((r) => ({
      id: r.id,
      bookingRef: r.booking_ref,
      customerId: r.customer_id,
      customerName: r.customers?.full_name ?? "",
      customerPhone: r.customers?.phone ?? "",
      serviceName: r.services?.name ?? "",
      staffName: r.staff?.full_name ?? "",
      dateLabel: fmtDate(r.starts_at, timeZone),
      timeLabel: `${fmtTime(r.starts_at, timeZone)} – ${fmtTime(r.ends_at, timeZone)}`,
      priceCents: r.price_cents,
      status: r.status as AppointmentStatus,
    })),
  };
}

export interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  visits: number;
}

export async function fetchCustomers(tenantId: string, search: string): Promise<CustomerRow[]> {
  let query = supabase
    .from("customers")
    .select("id, full_name, phone, email, appointments(count)")
    .eq("tenant_id", tenantId)
    .order("full_name", { ascending: true })
    .limit(100);

  const term = search.trim();
  if (term) query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    fullName: c.full_name,
    phone: c.phone,
    email: c.email,
    visits: (c.appointments as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export interface CustomerVisit {
  id: string;
  dateLabel: string;
  timeLabel: string;
  serviceName: string;
  staffName: string;
  priceCents: number;
  status: AppointmentStatus;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string;
  totalVisits: number;
  completedVisits: number;
  noShowVisits: number;
  spentCents: number;
  lastVisitLabel: string | null;
  visits: CustomerVisit[];
}

export async function fetchCustomerProfile(
  tenantId: string,
  customerId: string,
): Promise<CustomerProfile> {
  const timeZone = await tenantTimeZone(tenantId);

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, notes")
    .eq("tenant_id", tenantId)
    .eq("id", customerId)
    .single();
  if (error) throw error;

  const { data: appts, error: apptError } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, price_cents, services(name), staff(full_name)")
    .eq("tenant_id", tenantId)
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false });
  if (apptError) throw apptError;

  const list = appts ?? [];
  const completed = list.filter((a) => a.status === "completed");

  return {
    id: customer.id,
    fullName: customer.full_name,
    phone: customer.phone,
    email: customer.email,
    notes: customer.notes,
    totalVisits: list.length,
    completedVisits: completed.length,
    noShowVisits: list.filter((a) => a.status === "no_show").length,
    spentCents: completed.reduce((sum, a) => sum + a.price_cents, 0),
    lastVisitLabel: list[0] ? fmtDate(list[0].starts_at, timeZone) : null,
    visits: list.map((a) => ({
      id: a.id,
      dateLabel: fmtDate(a.starts_at, timeZone),
      timeLabel: `${fmtTime(a.starts_at, timeZone)} – ${fmtTime(a.ends_at, timeZone)}`,
      serviceName: a.services?.name ?? "",
      staffName: a.staff?.full_name ?? "",
      priceCents: a.price_cents,
      status: a.status as AppointmentStatus,
    })),
  };
}

export async function saveCustomerNotes(customerId: string, notes: string): Promise<void> {
  const { error } = await supabase.from("customers").update({ notes }).eq("id", customerId);
  if (error) throw error;
}

export function money(cents: number): string {
  return `${(cents / 100).toLocaleString("en-US")} ج.م`;
}
