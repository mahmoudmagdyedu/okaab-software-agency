export interface MawidBranch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  timezone: string;
  freeCancellationHours: number;
}

export interface MawidService {
  id: string;
  branchId: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents: number;
  depositCents: number;
}

export interface MawidStaff {
  id: string;
  branchId: string;
  fullName: string;
  specialty: string;
  serviceIds: string[];
}

export interface MawidBoard {
  tenantName: string;
  currency: string;
  branches: MawidBranch[];
  services: MawidService[];
  staff: MawidStaff[];
}

export interface MawidSlot {
  startsAt: string;
  endsAt: string;
  label: string;
}

export interface MawidSlotGroup {
  staffId: string;
  staffName: string;
  slots: MawidSlot[];
}

export interface MawidBookingResult {
  bookingRef: string;
  dateKey: string;
  startLabel: string;
  serviceName: string;
  staffName: string;
  priceCents: number;
  depositCents: number;
  needsDeposit: boolean;
}

const supabaseUrl = import.meta.env["VITE_MAWID_SUPABASE_URL"] as string | undefined;
const publishableKey = import.meta.env["VITE_MAWID_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

function endpoint() {
  if (!supabaseUrl || !publishableKey) {
    throw new Error("mawid_not_configured");
  }
  return `${supabaseUrl}/functions/v1/mawid-booking`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: publishableKey ?? "",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error || "request_failed");
  return payload;
}

export function loadMawidBoard() {
  return request<MawidBoard>(`${endpoint()}?action=board`);
}

export function loadMawidSlots(input: {
  serviceId: string;
  date: string;
  staffId?: string | null;
}) {
  const params = new URLSearchParams({
    action: "slots",
    serviceId: input.serviceId,
    date: input.date,
  });
  if (input.staffId) params.set("staffId", input.staffId);
  return request<MawidSlotGroup[]>(`${endpoint()}?${params.toString()}`);
}

export function createMawidBooking(input: {
  serviceId: string;
  staffId: string;
  startsAt: string;
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  website?: string;
}) {
  return request<MawidBookingResult>(endpoint(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}
