/**
 * Public booking data is handled by a narrowly scoped Supabase Edge Function.
 * The browser never receives a service-role key and the existing UI remains unchanged.
 */
import type { Slot } from "@/lib/slots";

export interface PublicBranch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  timezone: string;
  freeCancellationHours: number;
}

export interface PublicService {
  id: string;
  branchId: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents: number;
  depositCents: number;
}

export interface PublicStaff {
  id: string;
  branchId: string;
  fullName: string;
  specialty: string;
  serviceIds: string[];
}

export interface PublicBoard {
  tenantId: string;
  tenantName: string;
  currency: string;
  demoMode: boolean;
  branches: PublicBranch[];
  services: PublicService[];
  staff: PublicStaff[];
}

export interface StaffDaySlots {
  staffId: string;
  staffName: string;
  slots: Slot[];
}

export interface BookingResult {
  bookingRef: string;
  startLabel: string;
  dateKey: string;
  staffName: string;
  serviceName: string;
  branchName: string;
  priceCents: number;
  depositCents: number;
  needsDeposit: boolean;
  demoMode: boolean;
}

async function invokeBookingApi<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!supabaseUrl || !publishableKey) throw new Error("booking_service_unavailable");

  const response = await fetch(`${supabaseUrl}/functions/v1/mawid-public-booking`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${publishableKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const body = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!response.ok || !body?.data) throw new Error(body?.error || "booking_service_unavailable");
  return body.data;
}

export function loadPublicBoard(slug: string): Promise<PublicBoard> {
  return invokeBookingApi<PublicBoard>("board", { slug });
}

export function loadDaySlots(input: {
  serviceId: string;
  date: string;
  staffId?: string | null | undefined;
}): Promise<StaffDaySlots[]> {
  return invokeBookingApi<StaffDaySlots[]>("slots", input);
}

export function createPublicBooking(input: {
  serviceId: string;
  staffId: string;
  startsAt: string;
  fullName: string;
  phone: string;
  email?: string | undefined;
  note?: string | undefined;
}): Promise<BookingResult> {
  return invokeBookingApi<BookingResult>("book", input);
}
