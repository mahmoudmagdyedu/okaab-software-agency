import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  createMawidBooking,
  loadMawidBoard,
  loadMawidSlots,
  type MawidBoard,
  type MawidBookingResult,
  type MawidSlotGroup,
} from "@/lib/mawid-api";

const STEPS = ["الفرع", "الخدمة", "المختص", "الموعد", "بياناتك", "التأكيد"];

function cairoDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function money(value: number, currency = "EGP") {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export default function MawidBooking() {
  const [board, setBoard] = useState<MawidBoard | null>(null);
  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [startLabel, setStartLabel] = useState("");
  const [day, setDay] = useState(() => cairoDateKey());
  const [slots, setSlots] = useState<MawidSlotGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<MawidBookingResult | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
    website: "",
  });

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, index) => addDays(cairoDateKey(), index)),
    [],
  );

  useEffect(() => {
    let active = true;
    loadMawidBoard()
      .then((value) => {
        if (active) setBoard(value);
      })
      .catch(() => {
        if (active) setError("تعذّر تحميل صفحة الحجز. حاول مرة أخرى بعد قليل.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (step !== 3 || !serviceId) return;
    let active = true;
    setLoadingSlots(true);
    setError(null);
    loadMawidSlots({ serviceId, date: day, staffId })
      .then((value) => {
        if (active) setSlots(value);
      })
      .catch(() => {
        if (active) setError("تعذّر تحميل المواعيد المتاحة. جرّب مرة أخرى.");
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [day, serviceId, staffId, step]);

  const branch = board?.branches.find((item) => item.id === branchId) ?? null;
  const service = board?.services.find((item) => item.id === serviceId) ?? null;
  const staff = board?.staff.find((item) => item.id === staffId) ?? null;
  const services = board?.services.filter((item) => item.branchId === branchId) ?? [];
  const staffMembers =
    board?.staff.filter(
      (item) => item.branchId === branchId && (!serviceId || item.serviceIds.includes(serviceId)),
    ) ?? [];

  const back = () => {
    setError(null);
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!serviceId || !staffId || !startsAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createMawidBooking({
        serviceId,
        staffId,
        startsAt,
        fullName: form.fullName,
        phone: form.phone,
        ...(form.email ? { email: form.email } : {}),
        ...(form.note ? { note: form.note } : {}),
        website: form.website,
      });
      setDone(result);
      setStep(5);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message === "slot_taken"
          ? "هذا الموعد حُجز للتو. ارجع واختر موعداً آخر."
          : "تعذّر تأكيد الحجز. راجع البيانات وحاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f3f6f8] text-slate-900 lg:grid lg:grid-cols-[320px_1fr]"
    >
      <aside className="relative overflow-hidden bg-[#0f766e] px-6 py-8 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:px-10 lg:py-12">
        <div className="absolute -left-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <a
          href="/"
          className="relative inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
        >
          <ArrowRight className="size-4" aria-hidden /> العودة إلى عُقاب
        </a>
        <div className="relative mt-10 lg:mt-0">
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <CalendarDays className="size-7" aria-hidden />
          </span>
          <p className="text-sm text-white/70">منصة حجز المواعيد</p>
          <h1 className="mt-2 text-4xl font-black">مَوعِد</h1>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/80">
            اختر الخدمة والوقت المناسب، وأكّد حجزك الحقيقي في أقل من دقيقة.
          </p>
        </div>
        <p className="relative mt-8 text-xs text-white/60">مشروع من عُقاب للبرمجيات</p>
      </aside>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-7 sm:px-8 lg:px-12 lg:py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0f766e]">حجز موعد لدى</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                {board?.tenantName ?? "عيادة سمايل لطب الأسنان"}
              </h2>
            </div>
            {service ? (
              <span className="hidden rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 sm:block">
                {service.name} · {service.durationMinutes} دقيقة
              </span>
            ) : null}
          </div>

          <ol className="mb-8 grid grid-cols-6 gap-1" aria-label="خطوات الحجز">
            {STEPS.map((label, index) => (
              <li key={label} className="min-w-0 text-center">
                <span
                  className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-black ${
                    index <= step ? "bg-[#0f766e] text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </span>
                <span className="mt-1.5 hidden truncate text-[11px] text-slate-500 sm:block">
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {error ? (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center" aria-label="جارٍ التحميل">
              <LoaderCircle className="size-8 animate-spin text-[#0f766e]" aria-hidden />
            </div>
          ) : !board ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#0f766e] px-5 py-3 font-bold text-white"
            >
              إعادة المحاولة
            </button>
          ) : (
            <>
              {step === 0 ? (
                <Stage title="اختر الفرع">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {board.branches.map((item) => (
                      <Choice
                        key={item.id}
                        onClick={() => {
                          setBranchId(item.id);
                          setServiceId(null);
                          setStaffId(null);
                          setStep(1);
                        }}
                      >
                        <MapPin className="size-5 text-[#0f766e]" aria-hidden />
                        <strong>{item.name}</strong>
                        <span className="text-sm leading-6 text-slate-500">{item.address}</span>
                      </Choice>
                    ))}
                  </div>
                </Stage>
              ) : null}

              {step === 1 ? (
                <Stage title="اختر الخدمة" onBack={back}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((item) => (
                      <Choice
                        key={item.id}
                        onClick={() => {
                          setServiceId(item.id);
                          setStaffId(null);
                          setStep(2);
                        }}
                      >
                        <Stethoscope className="size-5 text-[#0f766e]" aria-hidden />
                        <strong>{item.name}</strong>
                        <span className="text-sm leading-6 text-slate-500">{item.description}</span>
                        <span className="mt-1 flex gap-3 text-sm font-bold text-teal-800">
                          <span>{item.durationMinutes} دقيقة</span>
                          <span>{money(item.priceCents, board.currency)}</span>
                        </span>
                      </Choice>
                    ))}
                  </div>
                </Stage>
              ) : null}

              {step === 2 ? (
                <Stage title="اختر مقدم الخدمة" onBack={back}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Choice
                      onClick={() => {
                        setStaffId(null);
                        setStep(3);
                      }}
                    >
                      <UserRound className="size-5 text-[#0f766e]" aria-hidden />
                      <strong>أي مقدم متاح</strong>
                      <span className="text-sm text-slate-500">اعرض لي أسرع المواعيد المتاحة</span>
                    </Choice>
                    {staffMembers.map((item) => (
                      <Choice
                        key={item.id}
                        onClick={() => {
                          setStaffId(item.id);
                          setStep(3);
                        }}
                      >
                        <span className="flex size-10 items-center justify-center rounded-full bg-teal-50 font-black text-teal-800">
                          {item.fullName.replace("د. ", "").charAt(0)}
                        </span>
                        <strong>{item.fullName}</strong>
                        <span className="text-sm text-slate-500">{item.specialty}</span>
                      </Choice>
                    ))}
                  </div>
                </Stage>
              ) : null}

              {step === 3 ? (
                <Stage title="اختر التاريخ والوقت" onBack={back}>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
                    {days.map((date) => {
                      const value = new Date(`${date}T12:00:00Z`);
                      return (
                        <button
                          key={date}
                          type="button"
                          aria-pressed={date === day}
                          onClick={() => {
                            setDay(date);
                            setStartsAt(null);
                          }}
                          className={`flex min-w-16 flex-col items-center rounded-2xl border px-3 py-3 ${
                            date === day
                              ? "border-[#0f766e] bg-teal-50 text-teal-900"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs">
                            {new Intl.DateTimeFormat("ar-EG", { weekday: "short" }).format(value)}
                          </span>
                          <strong className="mt-1 text-lg">{value.getUTCDate()}</strong>
                        </button>
                      );
                    })}
                  </div>

                  {loadingSlots ? (
                    <div className="flex min-h-40 items-center justify-center">
                      <LoaderCircle className="size-7 animate-spin text-[#0f766e]" aria-hidden />
                    </div>
                  ) : slots.every((group) => group.slots.length === 0) ? (
                    <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                      لا توجد مواعيد متاحة في هذا اليوم. اختر يوماً آخر.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {slots
                        .filter((group) => group.slots.length > 0)
                        .map((group) => (
                          <div key={group.staffId}>
                            <p className="mb-2 text-sm font-bold">{group.staffName}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.slots.map((slot) => (
                                <button
                                  key={slot.startsAt}
                                  type="button"
                                  onClick={() => {
                                    setStaffId(group.staffId);
                                    setStartsAt(slot.startsAt);
                                    setStartLabel(slot.label);
                                    setStep(4);
                                  }}
                                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-sm font-bold hover:border-[#0f766e] hover:bg-teal-50 hover:text-teal-900"
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </Stage>
              ) : null}

              {step === 4 ? (
                <Stage title="أدخل بياناتك" onBack={back}>
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="الاسم الكامل" htmlFor="mawid-name">
                        <input
                          id="mawid-name"
                          required
                          minLength={2}
                          autoComplete="name"
                          value={form.fullName}
                          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                          className="mawid-input"
                          placeholder="مثال: ندى إبراهيم"
                        />
                      </Field>
                      <Field label="رقم الهاتف" htmlFor="mawid-phone">
                        <input
                          id="mawid-phone"
                          required
                          minLength={8}
                          maxLength={30}
                          dir="ltr"
                          inputMode="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(event) => setForm({ ...form, phone: event.target.value })}
                          className="mawid-input text-left"
                          placeholder="01000000000"
                        />
                      </Field>
                      <Field label="البريد الإلكتروني (اختياري)" htmlFor="mawid-email">
                        <input
                          id="mawid-email"
                          type="email"
                          dir="ltr"
                          autoComplete="email"
                          value={form.email}
                          onChange={(event) => setForm({ ...form, email: event.target.value })}
                          className="mawid-input text-left"
                        />
                      </Field>
                      <Field label="ملاحظات (اختياري)" htmlFor="mawid-note">
                        <textarea
                          id="mawid-note"
                          rows={3}
                          maxLength={500}
                          value={form.note}
                          onChange={(event) => setForm({ ...form, note: event.target.value })}
                          className="mawid-input resize-none"
                        />
                      </Field>
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden"
                        value={form.website}
                        onChange={(event) => setForm({ ...form, website: event.target.value })}
                      />
                    </div>

                    <dl className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                      <Summary label="الفرع" value={branch?.name ?? ""} />
                      <Summary label="الخدمة" value={service?.name ?? ""} />
                      <Summary label="مقدم الخدمة" value={staff?.fullName ?? ""} />
                      <Summary label="التاريخ" value={day} />
                      <Summary label="الوقت" value={startLabel} />
                      <Summary
                        label="السعر"
                        value={money(service?.priceCents ?? 0, board.currency)}
                      />
                    </dl>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 font-black text-white hover:bg-[#115e59] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                      {submitting ? (
                        <LoaderCircle className="size-5 animate-spin" aria-hidden />
                      ) : null}
                      {submitting ? "جارٍ تأكيد الحجز" : "تأكيد الحجز"}
                    </button>
                  </form>
                </Stage>
              ) : null}

              {step === 5 && done ? (
                <section className="flex min-h-80 flex-col items-center justify-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-8" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-2xl font-black">تم تأكيد حجزك</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                    تم حفظ الموعد في قاعدة البيانات بنجاح. احتفظ برقم الحجز للرجوع إليه.
                  </p>
                  <strong className="mt-4 rounded-xl bg-slate-100 px-5 py-3 font-mono text-lg text-[#0f766e]">
                    {done.bookingRef}
                  </strong>
                  <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" aria-hidden />
                      {done.dateKey}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4" aria-hidden />
                      {done.startLabel}
                    </span>
                    <span>{done.staffName}</span>
                  </div>
                  <a href="/" className="mt-8 font-bold text-[#0f766e] hover:underline">
                    العودة إلى موقع عُقاب
                  </a>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Stage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black">{title}</h3>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowRight className="size-4" aria-hidden /> رجوع
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Choice({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-36 flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm hover:-translate-y-0.5 hover:border-[#0f766e] hover:shadow-md"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
