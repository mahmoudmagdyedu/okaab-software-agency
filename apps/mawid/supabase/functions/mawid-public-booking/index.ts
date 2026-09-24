import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.3";

const allowedOrigins = new Set([
  "https://okaab.org",
  "https://www.okaab.org",
  "https://okaab-mawid-ef3bbc493d4a.herokuapp.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

const minute = 60_000;

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  return {
    "access-control-allow-origin":
      origin && allowedOrigins.has(origin) ? origin : "https://okaab.org",
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "POST, OPTIONS",
    vary: "Origin",
  };
}

function json(req: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(req), "content-type": "application/json; charset=utf-8" },
  });
}

function fail(code: string, status = 400): never {
  throw Object.assign(new Error(code), { status });
}

function text(value: unknown, max: number, required = false) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) fail("invalid_input");
  if (result.length > max) fail("invalid_input");
  return result;
}

function uuid(value: unknown) {
  const result = text(value, 36, true);
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(result)) {
    fail("invalid_input");
  }
  return result;
}

// ⚡ Bolt: Cache Intl.DateTimeFormat instances to avoid instantiation overhead in hot loops
const offsetFormatters = new Map<string, Intl.DateTimeFormat>();
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function timeZoneOffsetMinutes(instant: Date, timeZone: string) {
  let dtf = offsetFormatters.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    offsetFormatters.set(timeZone, dtf);
  }
  const parts = dtf.formatToParts(instant);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    pick("year"),
    pick("month") - 1,
    pick("day"),
    pick("hour") % 24,
    pick("minute"),
    pick("second"),
  );
  return (asUtc - instant.getTime()) / minute;
}

function zonedToUtc(date: string, minuteOfDay: number, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const naive = Date.UTC(year || 1970, (month || 1) - 1, day || 1) + minuteOfDay * minute;
  let guess = new Date(naive - timeZoneOffsetMinutes(new Date(naive), timeZone) * minute);
  guess = new Date(naive - timeZoneOffsetMinutes(guess, timeZone) * minute);
  return guess;
}

function weekdayOf(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year || 1970, (month || 1) - 1, day || 1)).getUTCDay();
}

function formatTime(instant: Date | string, timeZone: string) {
  let dtf = timeFormatters.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    timeFormatters.set(timeZone, dtf);
  }
  return dtf.format(typeof instant === "string" ? new Date(instant) : instant);
}

function formatDateKey(instant: Date | string, timeZone: string) {
  let dtf = dateFormatters.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateFormatters.set(timeZone, dtf);
  }
  return dtf.format(typeof instant === "string" ? new Date(instant) : instant);
}

function computeSlots(input: {
  date: string;
  timeZone: string;
  rules: Array<{ weekday: number; startMinute: number; endMinute: number }>;
  busy: Array<{ startsAt: string; endsAt: string }>;
  blackouts: Array<{ startsAt: string; endsAt: string }>;
  durationMinutes: number;
  bufferMinutes: number;
}) {
  const blocked = [...input.busy, ...input.blackouts].map((range) => ({
    start: new Date(range.startsAt).getTime() - input.bufferMinutes * minute,
    end: new Date(range.endsAt).getTime() + input.bufferMinutes * minute,
  }));
  const now = Date.now();
  const seen = new Set<number>();
  const slots: Array<{ startsAt: string; endsAt: string; label: string }> = [];

  for (const rule of input.rules.filter((item) => item.weekday === weekdayOf(input.date))) {
    for (
      let current = rule.startMinute;
      current + input.durationMinutes <= rule.endMinute;
      current += 15
    ) {
      const start = zonedToUtc(input.date, current, input.timeZone);
      const startMs = start.getTime();
      const endMs = startMs + input.durationMinutes * minute;
      if (startMs < now || seen.has(startMs)) continue;
      if (blocked.some((range) => startMs < range.end && range.start < endMs)) continue;
      seen.add(startMs);
      slots.push({
        startsAt: start.toISOString(),
        endsAt: new Date(endMs).toISOString(),
        label: formatTime(start, input.timeZone),
      });
    }
  }
  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function loadService(serviceId: string) {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, tenant_id, branch_id, name, duration_minutes, buffer_minutes, price_cents, deposit_cents, is_active",
    )
    .eq("id", serviceId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.is_active) fail("service_not_found", 404);
  return data;
}

async function daySlots(input: { serviceId: string; date: string; staffId?: string | null }) {
  const service = await loadService(input.serviceId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) fail("invalid_date");

  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select("timezone")
    .eq("id", service.branch_id)
    .maybeSingle();
  if (branchError) throw branchError;
  const timeZone = branch?.timezone || "Africa/Cairo";

  let staffQuery = supabase
    .from("staff")
    .select("id, full_name")
    .eq("tenant_id", service.tenant_id)
    .eq("branch_id", service.branch_id)
    .eq("is_active", true)
    .order("created_at");
  if (input.staffId) staffQuery = staffQuery.eq("id", input.staffId);
  const { data: staffRows, error: staffError } = await staffQuery;
  if (staffError) throw staffError;

  const staffIds = (staffRows ?? []).map((member) => member.id);
  if (!staffIds.length) return [];
  const { data: serviceLinks, error: linksError } = await supabase
    .from("staff_services")
    .select("staff_id")
    .eq("service_id", service.id)
    .in("staff_id", staffIds);
  if (linksError) throw linksError;
  const eligibleIds = new Set((serviceLinks ?? []).map((link) => link.staff_id));
  const staff = (staffRows ?? []).filter((member) => eligibleIds.has(member.id));
  if (!staff.length) return [];

  const ids = staff.map((member) => member.id);
  const dayStart = new Date(`${input.date}T00:00:00Z`);
  dayStart.setUTCDate(dayStart.getUTCDate() - 1);
  const dayEnd = new Date(`${input.date}T00:00:00Z`);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 2);
  const [rules, appointments, blackouts] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("staff_id, weekday, start_minute, end_minute")
      .in("staff_id", ids)
      .eq("is_active", true),
    supabase
      .from("appointments")
      .select("staff_id, starts_at, ends_at")
      .in("staff_id", ids)
      .neq("status", "cancelled")
      .gte("starts_at", dayStart.toISOString())
      .lt("starts_at", dayEnd.toISOString()),
    supabase
      .from("blackout_dates")
      .select("staff_id, branch_id, starts_at, ends_at")
      .eq("tenant_id", service.tenant_id)
      .lt("starts_at", dayEnd.toISOString())
      .gt("ends_at", dayStart.toISOString()),
  ]);
  for (const result of [rules, appointments, blackouts]) if (result.error) throw result.error;

  return staff.map((member) => ({
    staffId: member.id,
    staffName: member.full_name,
    slots: computeSlots({
      date: input.date,
      timeZone,
      rules: (rules.data ?? [])
        .filter((row) => row.staff_id === member.id)
        .map((row) => ({
          weekday: row.weekday,
          startMinute: row.start_minute,
          endMinute: row.end_minute,
        })),
      busy: (appointments.data ?? [])
        .filter((row) => row.staff_id === member.id)
        .map((row) => ({ startsAt: row.starts_at, endsAt: row.ends_at })),
      blackouts: (blackouts.data ?? [])
        .filter(
          (row) =>
            (!row.branch_id || row.branch_id === service.branch_id) &&
            (!row.staff_id || row.staff_id === member.id),
        )
        .map((row) => ({ startsAt: row.starts_at, endsAt: row.ends_at })),
      durationMinutes: service.duration_minutes,
      bufferMinutes: service.buffer_minutes,
    }),
  }));
}

async function board(body: Record<string, unknown>) {
  const slug = text(body.slug, 80, true);
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, currency, is_active")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!tenant?.is_active) fail("tenant_not_found", 404);

  const [branches, services, staff, links] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name, address, phone, timezone, free_cancellation_hours")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("created_at"),
    supabase
      .from("services")
      .select(
        "id, branch_id, name, description, duration_minutes, buffer_minutes, price_cents, deposit_cents",
      )
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("staff")
      .select("id, branch_id, full_name, specialty")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("created_at"),
    supabase.from("staff_services").select("staff_id, service_id").eq("tenant_id", tenant.id),
  ]);
  for (const result of [branches, services, staff, links]) if (result.error) throw result.error;

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    currency: tenant.currency,
    demoMode: false,
    branches: (branches.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      phone: item.phone,
      timezone: item.timezone,
      freeCancellationHours: item.free_cancellation_hours,
    })),
    services: (services.data ?? []).map((item) => ({
      id: item.id,
      branchId: item.branch_id,
      name: item.name,
      description: item.description ?? "",
      durationMinutes: item.duration_minutes,
      bufferMinutes: item.buffer_minutes,
      priceCents: item.price_cents,
      depositCents: item.deposit_cents,
    })),
    staff: (staff.data ?? []).map((item) => ({
      id: item.id,
      branchId: item.branch_id,
      fullName: item.full_name,
      specialty: item.specialty ?? "",
      serviceIds: (links.data ?? [])
        .filter((link) => link.staff_id === item.id)
        .map((link) => link.service_id),
    })),
  };
}

async function book(body: Record<string, unknown>) {
  const serviceId = uuid(body.serviceId);
  const staffId = uuid(body.staffId);
  const fullName = text(body.fullName, 120, true);
  const phone = text(body.phone, 30, true);
  const email = text(body.email, 254);
  const note = text(body.note, 1000);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("invalid_input");
  const startsAt = new Date(text(body.startsAt, 40, true));
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now()) fail("invalid_time");

  const service = await loadService(serviceId);
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, full_name, branch_id, tenant_id, is_active")
    .eq("id", staffId)
    .maybeSingle();
  if (staffError) throw staffError;
  if (
    !staff?.is_active ||
    staff.tenant_id !== service.tenant_id ||
    staff.branch_id !== service.branch_id
  )
    fail("staff_not_found", 404);

  const { data: link } = await supabase
    .from("staff_services")
    .select("staff_id")
    .eq("staff_id", staff.id)
    .eq("service_id", service.id)
    .maybeSingle();
  if (!link) fail("staff_not_found", 404);
  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select("name, timezone")
    .eq("id", staff.branch_id)
    .maybeSingle();
  if (branchError) throw branchError;
  const timeZone = branch?.timezone || "Africa/Cairo";
  const day = formatDateKey(startsAt, timeZone);
  const available = await daySlots({ serviceId, date: day, staffId });
  if (
    !available.some((member) =>
      member.slots.some((slot) => slot.startsAt === startsAt.toISOString()),
    )
  )
    fail("slot_taken", 409);

  const { data: existing, error: customerLookupError } = await supabase
    .from("customers")
    .select("id")
    .eq("tenant_id", service.tenant_id)
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();
  if (customerLookupError) throw customerLookupError;
  let customerId = existing?.id;
  if (!customerId) {
    const { data: created, error: customerError } = await supabase
      .from("customers")
      .insert({
        tenant_id: service.tenant_id,
        full_name: fullName,
        phone,
        email: email || null,
        notes: "",
      })
      .select("id")
      .single();
    if (customerError) throw customerError;
    customerId = created.id;
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * minute);
  const [{ data: resources, error: resourcesError }, { data: busyResources, error: busyError }] =
    await Promise.all([
      supabase
        .from("resources")
        .select("id")
        .eq("tenant_id", service.tenant_id)
        .eq("branch_id", staff.branch_id)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("appointments")
        .select("resource_id")
        .eq("branch_id", staff.branch_id)
        .neq("status", "cancelled")
        .lt("starts_at", endsAt.toISOString())
        .gt("ends_at", startsAt.toISOString()),
    ]);
  if (resourcesError) throw resourcesError;
  if (busyError) throw busyError;
  const taken = new Set((busyResources ?? []).map((item) => item.resource_id));
  const resource = (resources ?? []).find((item) => !taken.has(item.id));
  if (!resource) fail("slot_taken", 409);

  const bookingRef = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const needsDeposit = service.deposit_cents > 0;
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      tenant_id: service.tenant_id,
      branch_id: staff.branch_id,
      staff_id: staff.id,
      service_id: service.id,
      customer_id: customerId,
      resource_id: resource.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: needsDeposit ? "pending_deposit" : "confirmed",
      price_cents: service.price_cents,
      deposit_cents: service.deposit_cents,
      deposit_paid_cents: 0,
      note,
      booking_ref: bookingRef,
    })
    .select("id")
    .single();
  if (appointmentError) {
    if (appointmentError.code === "23P01" || appointmentError.code === "23505")
      fail("slot_taken", 409);
    throw appointmentError;
  }
  await supabase.from("appointment_events").insert({
    tenant_id: service.tenant_id,
    appointment_id: appointment.id,
    event_type: "created",
    payload: { source: "public_booking", starts_at: startsAt.toISOString() },
  });

  return {
    bookingRef,
    startLabel: formatTime(startsAt, timeZone),
    dateKey: day,
    staffName: staff.full_name,
    serviceName: service.name,
    branchName: branch?.name ?? "",
    priceCents: service.price_cents,
    depositCents: service.deposit_cents,
    needsDeposit,
    demoMode: false,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return json(req, 403, { error: "origin_not_allowed" });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    let data: unknown;
    if (body.action === "board") data = await board(body);
    else if (body.action === "slots")
      data = await daySlots({
        serviceId: uuid(body.serviceId),
        date: text(body.date, 10, true),
        staffId: body.staffId ? uuid(body.staffId) : null,
      });
    else if (body.action === "book") data = await book(body);
    else fail("invalid_action");
    return json(req, 200, { data });
  } catch (error) {
    const candidate = error as { message?: string; status?: number };
    const status =
      candidate.status && candidate.status >= 400 && candidate.status < 500
        ? candidate.status
        : 500;
    if (status === 500) console.error(error);
    return json(req, status, {
      error: status === 500 ? "booking_service_unavailable" : candidate.message,
    });
  }
});
