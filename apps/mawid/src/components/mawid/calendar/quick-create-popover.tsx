import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { minuteLabel, type CalendarService, type CalendarStaff } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export interface QuickCreateTarget {
  staffId: string;
  minute: number;
  dateKey: string;
}

export interface QuickCreatePayload {
  staffId: string;
  serviceId: string;
  customerId?: string | undefined;
  newCustomer?: { fullName: string; phone: string } | undefined;
  minute: number;
  dateKey: string;
}

interface CustomerHit {
  id: string;
  full_name: string;
  phone: string | null;
}

export interface QuickCreatePopoverProps {
  target: QuickCreateTarget;
  tenantId: string;
  staff: CalendarStaff[];
  services: CalendarService[];
  submitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSubmit: (payload: QuickCreatePayload) => void;
}

export function QuickCreatePopover({
  target,
  tenantId,
  staff,
  services,
  submitting,
  errorMessage,
  onCancel,
  onSubmit,
}: QuickCreatePopoverProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<CustomerHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");

  const staffName = staff.find((s) => s.id === target.staffId)?.fullName ?? "";
  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [serviceId, services],
  );

  useEffect(() => {
    if (mode !== "existing" || search.trim().length < 2) {
      setHits([]);
      setSearching(false);
      setSearchError(false);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError(false);
      void supabase
        .from("customers")
        .select("id, full_name, phone")
        .eq("tenant_id", tenantId)
        .ilike("full_name", `%${search.trim()}%`)
        .limit(5)
        .then(({ data, error }) => {
          if (!active) return;
          setHits((data ?? []) as CustomerHit[]);
          setSearchError(Boolean(error));
          setSearching(false);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, mode, tenantId]);

  const canSubmit =
    Boolean(serviceId) &&
    (mode === "existing"
      ? Boolean(customerId)
      : fullName.trim().length > 1 && phone.trim().length > 5);

  return (
    <form
      className="w-[min(320px,calc(100vw-24px))] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 shadow-popover"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || submitting) return;
        onSubmit({
          staffId: target.staffId,
          serviceId,
          customerId: mode === "existing" ? (customerId ?? undefined) : undefined,
          newCustomer:
            mode === "new" ? { fullName: fullName.trim(), phone: phone.trim() } : undefined,
          minute: target.minute,
          dateKey: target.dateKey,
        });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-medium text-[var(--text-primary)]">موعد سريع</p>
        <MonoText className="text-caption text-[var(--text-muted)]">
          {`${target.dateKey} ${minuteLabel(target.minute)}`}
        </MonoText>
      </div>
      <p className="mt-1 text-caption text-[var(--text-muted)]">مع {staffName}</p>

      <div className="mt-3 flex gap-1.5">
        {(["existing", "new"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setCustomerId(null);
              setHits([]);
              setSearchError(false);
            }}
            className={cn(
              "min-h-10 flex-1 rounded-[6px] border px-3 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]",
              mode === value
                ? "border-accent-100 bg-accent-50 text-accent-700"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
            )}
          >
            {value === "existing" ? "عميل موجود" : "عميل جديد"}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {mode === "existing" ? (
          <div className="space-y-2">
            <Label htmlFor="qc-search">ابحث عن العميل</Label>
            <Input
              id="qc-search"
              name="customerSearch"
              autoComplete="off"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCustomerId(null);
              }}
              placeholder="اكتب حرفين على الأقل"
            />
            {searching ? (
              <p className="flex items-center gap-1.5 text-caption text-[var(--text-muted)]">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                جارٍ البحث…
              </p>
            ) : searchError ? (
              <p className="text-caption text-danger-fg">تعذّر البحث عن العملاء. حاول مجددًا.</p>
            ) : search.trim().length >= 2 && hits.length === 0 && !customerId ? (
              <p className="text-caption text-[var(--text-muted)]">لا توجد نتائج مطابقة.</p>
            ) : null}
            <ul className="max-h-[140px] space-y-1 overflow-y-auto">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId(hit.id);
                      setSearch(hit.full_name);
                      setHits([]);
                    }}
                    className="flex min-h-10 w-full items-center justify-between rounded-[6px] px-2 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]"
                  >
                    <span className="truncate">{hit.full_name}</span>
                    <MonoText className="text-caption text-[var(--text-muted)]">
                      {hit.phone ?? ""}
                    </MonoText>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="qc-name">اسم العميل</Label>
              <Input
                id="qc-name"
                name="customerName"
                autoComplete="name"
                required={mode === "new"}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="مثال: نورهان سعيد"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qc-phone">رقم الجوال</Label>
              <Input
                id="qc-phone"
                name="customerPhone"
                autoComplete="tel"
                inputMode="tel"
                required={mode === "new"}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mono-ltr"
                placeholder="+201000000000"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="qc-service">الخدمة</Label>
          <select
            id="qc-service"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="min-h-10 w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 text-body-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]"
          >
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {service ? (
            <p className="text-caption text-[var(--text-muted)]">
              المدة تُحسب تلقائيًا:{" "}
              <MonoText>
                {service.durationMinutes} د — {minuteLabel(target.minute)}
              </MonoText>
            </p>
          ) : null}
        </div>

        {errorMessage ? <InlineAlert tone="danger">{errorMessage}</InlineAlert> : null}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            حفظ الموعد
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        </div>
      </div>
    </form>
  );
}
