import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, Sun, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { MonoText } from "@/components/mawid/mono-text";
import { SlotChip } from "@/components/mawid/slot-chip";
import { Stepper } from "@/components/mawid/stepper";
import { addDaysKey, dayNumberLabel, moneyLabel, weekdayLabel } from "@/lib/calendar";
import { getBookingBoard, getBookingSlots, submitBooking } from "@/lib/booking.functions";
import { formatDateKey } from "@/lib/slots";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$slug")({
  head: () => ({
    meta: [
      { title: "احجز موعدك — مَوعِد" },
      {
        name: "description",
        content:
          "احجز موعدك أونلاين في دقيقة: اختر الفرع والخدمة ومقدم الخدمة والوقت المناسب، وأكِّد الحجز فورًا.",
      },
      { property: "og:title", content: "احجز موعدك — مَوعِد" },
      {
        property: "og:description",
        content: "حجز مواعيد عربي سهل: اختر الخدمة والوقت وأكِّد في ست خطوات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingPage,
});

const STEPS = ["الفرع", "الخدمة", "مقدم الخدمة", "الموعد", "بياناتك", "التأكيد"];

interface Chosen {
  branchId: string | null;
  serviceId: string | null;
  staffId: string | null;
  startsAt: string | null;
  startLabel: string;
}

function BookingPage() {
  const { slug } = Route.useParams();
  const loadBoard = useServerFn(getBookingBoard);
  const loadSlots = useServerFn(getBookingSlots);
  const book = useServerFn(submitBooking);

  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<Chosen>({
    branchId: null,
    serviceId: null,
    staffId: null,
    startsAt: null,
    startLabel: "",
  });
  const today = formatDateKey(new Date(), "Africa/Cairo");
  const [day, setDay] = useState(today);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Awaited<ReturnType<typeof submitBooking>> | null>(null);

  const boardQuery = useQuery({
    queryKey: ["booking-board", slug],
    queryFn: () => loadBoard({ data: { slug } }),
  });

  const board = boardQuery.data;
  const service = board?.services.find((s) => s.id === chosen.serviceId) ?? null;

  const slotsQuery = useQuery({
    queryKey: ["booking-slots", chosen.serviceId, chosen.staffId, day],
    enabled: step === 3 && !!chosen.serviceId,
    queryFn: () =>
      loadSlots({
        data: { serviceId: chosen.serviceId!, date: day, staffId: chosen.staffId },
      }),
  });

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysKey(today, i)), [today]);

  if (boardQuery.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full" />
      </Shell>
    );
  }

  if (boardQuery.isError || !board) {
    return (
      <Shell>
        <ErrorState
          title="تعذّر تحميل صفحة الحجز"
          message="تأكد من الرابط أو حاول مرة أخرى بعد قليل."
          onRetry={() => void boardQuery.refetch()}
        />
      </Shell>
    );
  }

  const branchServices = board.services.filter((s) => s.branchId === chosen.branchId);
  const branchStaff = board.staff.filter(
    (st) =>
      st.branchId === chosen.branchId &&
      (st.serviceIds.length === 0 || !chosen.serviceId || st.serviceIds.includes(chosen.serviceId)),
  );

  const goto = (next: number) => {
    setError(null);
    setStep(next);
  };

  const onConfirm = async () => {
    if (!chosen.serviceId || !chosen.staffId || !chosen.startsAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await book({
        data: {
          serviceId: chosen.serviceId,
          staffId: chosen.staffId,
          startsAt: chosen.startsAt,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          note: form.note || undefined,
        },
      });
      setDone(result);
      setStep(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("slot_taken")
          ? "هذه الفتحة حُجزت للتو. اختر وقتًا آخر."
          : "تعذّر إتمام الحجز. راجع بياناتك وحاول مجددًا.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell
      tenantName={board.tenantName}
      summary={
        service
          ? `${service.name} • ${service.durationMinutes} د`
          : (board.branches.find((b) => b.id === chosen.branchId)?.name ?? undefined)
      }
    >
      <header className="flex flex-col gap-1">
        <p className="text-caption text-muted-foreground">حجز موعد لدى</p>
        <h1 className="text-h1 text-foreground">{board.tenantName}</h1>
      </header>

      <Stepper steps={STEPS} current={step} />

      {board.demoMode ? (
        <InlineAlert tone="info">
          نسخة عرض تفاعلية — يمكنك تجربة جميع الخطوات، ولن تُحفظ بياناتك أو يُنشأ حجز حقيقي.
        </InlineAlert>
      ) : null}

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {/* 1) الفرع */}
      {step === 0 ? (
        <Section title="اختر الفرع">
          <div className="grid gap-3 sm:grid-cols-2">
            {board.branches.map((branch) => (
              <Choice
                key={branch.id}
                selected={chosen.branchId === branch.id}
                onClick={() => {
                  setChosen({
                    branchId: branch.id,
                    serviceId: null,
                    staffId: null,
                    startsAt: null,
                    startLabel: "",
                  });
                  goto(1);
                }}
              >
                <span className="flex items-center gap-2 text-body font-medium text-foreground">
                  <MapPin className="size-4 text-accent-700" strokeWidth={1.5} aria-hidden />
                  {branch.name}
                </span>
                <span className="text-body-sm text-muted-foreground">{branch.address}</span>
              </Choice>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 2) الخدمة */}
      {step === 1 ? (
        <Section title="اختر الخدمة" onBack={() => goto(0)}>
          {branchServices.length === 0 ? (
            <EmptyState title="لا توجد خدمات متاحة" hint="جرّب فرعًا آخر أو تواصل مع المنشأة." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {branchServices.map((s) => (
                <Choice
                  key={s.id}
                  selected={chosen.serviceId === s.id}
                  onClick={() => {
                    setChosen((c) => ({ ...c, serviceId: s.id, staffId: null, startsAt: null }));
                    goto(2);
                  }}
                >
                  <span className="text-body font-medium text-foreground">{s.name}</span>
                  <span className="text-body-sm text-muted-foreground">{s.description}</span>
                  <span className="flex items-center gap-3 pt-1">
                    <MonoText className="text-caption text-accent-700">
                      {s.durationMinutes} د
                    </MonoText>
                    <MonoText className="text-caption text-foreground">
                      {moneyLabel(s.priceCents)}
                    </MonoText>
                  </span>
                </Choice>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {/* 3) مقدم الخدمة */}
      {step === 2 ? (
        <Section title="اختر مقدم الخدمة" onBack={() => goto(1)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice
              selected={chosen.staffId === null}
              onClick={() => {
                setChosen((c) => ({ ...c, staffId: null, startsAt: null }));
                goto(3);
              }}
            >
              <span className="flex items-center gap-2 text-body font-medium text-foreground">
                <User className="size-4 text-accent-700" strokeWidth={1.5} aria-hidden />
                أي مقدم متاح
              </span>
              <span className="text-body-sm text-muted-foreground">أسرع وقت متاح في الفرع</span>
            </Choice>
            {branchStaff.map((st) => (
              <Choice
                key={st.id}
                selected={chosen.staffId === st.id}
                onClick={() => {
                  setChosen((c) => ({ ...c, staffId: st.id, startsAt: null }));
                  goto(3);
                }}
              >
                <span className="flex items-center gap-2">
                  <LetterAvatar name={st.fullName} />
                  <span className="text-body font-medium text-foreground">{st.fullName}</span>
                </span>
                <span className="text-body-sm text-muted-foreground">{st.specialty}</span>
              </Choice>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 4) الموعد */}
      {step === 3 ? (
        <Section title="اختر التاريخ والوقت" onBack={() => goto(2)}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDay(d);
                  setChosen((current) => ({ ...current, startsAt: null, startLabel: "" }));
                }}
                aria-pressed={day === d}
                className={cn(
                  "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md border transition-colors",
                  day === d
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-border bg-background text-muted-foreground hover:bg-surface-subtle",
                )}
              >
                <span className="text-caption">{weekdayLabel(d)}</span>
                <MonoText className="text-body font-medium text-foreground">
                  {dayNumberLabel(d)}
                </MonoText>
              </button>
            ))}
          </div>

          {slotsQuery.isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : slotsQuery.isError ? (
            <ErrorState
              title="تعذّر تحميل المواعيد المتاحة"
              message="تحقّق من الاتصال ثم حاول مرة أخرى."
              onRetry={() => void slotsQuery.refetch()}
            />
          ) : (slotsQuery.data ?? []).every((g) => g.slots.length === 0) ? (
            <EmptyState
              icon={CalendarDays}
              title="لا توجد فتحات في هذا اليوم"
              hint="اختر تاريخًا آخر من الشريط أعلاه."
            />
          ) : (
            <div className="flex flex-col gap-5">
              {(slotsQuery.data ?? [])
                .filter((g) => g.slots.length > 0)
                .map((group) => (
                  <div key={group.staffId} className="flex flex-col gap-2">
                    <p className="text-body-sm font-medium text-foreground">{group.staffName}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.slots.map((slot) => (
                        <SlotChip
                          key={slot.startsAt}
                          time={slot.label}
                          selected={chosen.startsAt === slot.startsAt}
                          onClick={() => {
                            setChosen((c) => ({
                              ...c,
                              staffId: group.staffId,
                              startsAt: slot.startsAt,
                              startLabel: slot.label,
                            }));
                            goto(4);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Section>
      ) : null}

      {/* 5) بياناتك */}
      {step === 4 ? (
        <Section title="بياناتك" onBack={() => goto(3)}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="مثال: ندى إبراهيم"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input
                  id="phone"
                  name="phone"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  pattern="[0-9+\\s-]{8,20}"
                  className="font-mono"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="01000000000"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="email"
                  name="email"
                  dir="ltr"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="note">ملاحظات (اختياري)</Label>
                <Textarea
                  id="note"
                  name="note"
                  rows={3}
                  maxLength={300}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
            </div>

            <Summary
              branch={board.branches.find((b) => b.id === chosen.branchId)?.name ?? ""}
              service={service?.name ?? ""}
              staff={board.staff.find((s) => s.id === chosen.staffId)?.fullName ?? ""}
              day={chosen.startsAt ? formatDateKey(chosen.startsAt, "Africa/Cairo") : day}
              time={chosen.startLabel}
              priceCents={service?.priceCents ?? 0}
              depositCents={service?.depositCents ?? 0}
            />

            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={submitting}
              disabled={form.fullName.trim().length < 2 || form.phone.trim().length < 8}
            >
              {board.demoMode ? "تجربة تأكيد الحجز" : "تأكيد الحجز"}
            </Button>
          </form>
        </Section>
      ) : null}

      {/* 6) التأكيد */}
      {step === 5 && done ? (
        <section className="flex flex-col items-center gap-4 rounded-md border border-border bg-background px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 className="size-6 text-success-fg" strokeWidth={1.5} aria-hidden />
          </span>
          <h2 className="text-h2 text-foreground">
            {done.demoMode ? "تمت تجربة الحجز بنجاح" : "تم تأكيد حجزك"}
          </h2>
          <p className="text-body-sm text-muted-foreground">
            {done.demoMode
              ? "هذه معاينة فقط؛ لم تُحفظ بياناتك ولم يُنشأ موعد حقيقي."
              : done.needsDeposit
                ? "الحجز مبدئي حتى سداد العربون. سنرسل لك رابط الدفع عبر واتساب."
                : "سنرسل لك تذكيرًا قبل الموعد عبر واتساب."}
          </p>
          <div className="flex flex-col items-center gap-1">
            <p className="text-caption text-muted-foreground">رقم الحجز</p>
            <MonoText className="text-h3 text-accent-700">{done.bookingRef}</MonoText>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-body-sm text-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays
                className="size-4 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <MonoText>{done.dateKey}</MonoText>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
              <MonoText>{done.startLabel}</MonoText>
            </span>
            <span>{done.serviceName}</span>
            <span>{done.staffName}</span>
          </div>
          {done.needsDeposit ? (
            <InlineAlert tone="warning">
              العربون المطلوب: {moneyLabel(done.depositCents)} من إجمالي{" "}
              {moneyLabel(done.priceCents)}
            </InlineAlert>
          ) : null}
        </section>
      ) : null}
    </Shell>
  );
}

function Shell({
  children,
  tenantName,
  summary,
}: {
  children: React.ReactNode;
  tenantName?: string | undefined;
  summary?: string | undefined;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex flex-col items-center justify-center gap-6 bg-accent-600 px-8 py-12 text-center lg:sticky lg:top-0 lg:h-screen">
        <Sun className="size-16 text-on-dark" strokeWidth={1.5} aria-hidden />
        <div>
          <p className="text-h2 font-bold text-on-dark">{tenantName ?? "مَوعِد"}</p>
          <p className="mt-1 text-caption text-on-dark-soft">حجز موعدك في خطوات قليلة</p>
        </div>
        {summary ? (
          <p className="border border-on-dark px-4 py-2 text-body-sm text-on-dark">{summary}</p>
        ) : null}
      </aside>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

function Section({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3 text-foreground">{title}</h2>
        {onBack ? (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
            رجوع
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-20 flex-col gap-1 rounded-md border p-4 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-accent-600 bg-accent-50"
          : "border-border bg-background hover:bg-surface-subtle",
      )}
    >
      {children}
    </button>
  );
}

function Summary({
  branch,
  service,
  staff,
  day,
  time,
  priceCents,
  depositCents,
}: {
  branch: string;
  service: string;
  staff: string;
  day: string;
  time: string;
  priceCents: number;
  depositCents: number;
}) {
  const rows: Array<[string, React.ReactNode]> = [
    ["الفرع", branch],
    ["الخدمة", service],
    ["مقدم الخدمة", staff || "أي مقدم متاح"],
    ["التاريخ", <MonoText key="d">{day}</MonoText>],
    ["الوقت", <MonoText key="t">{time}</MonoText>],
    ["السعر", <MonoText key="p">{moneyLabel(priceCents)}</MonoText>],
  ];
  if (depositCents > 0) {
    rows.push(["العربون", <MonoText key="dep">{moneyLabel(depositCents)}</MonoText>]);
  }

  return (
    <dl className="grid gap-2 rounded-md border border-border bg-surface-subtle p-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 text-body-sm">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
