import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, Lock, Timer } from "lucide-react";
import { useState } from "react";
import { branchById, employeeById, shifts, type Shift } from "../lib/data";
import { formatDate, formatSar, formatTime } from "../lib/format";

export const Route = createFileRoute("/admin/shifts")({
  head: () => ({
    meta: [
      { title: "الشفتات — فتح وإغلاق وتقرير Z — فوترة" },
      {
        name: "description",
        content:
          "فتح الشفت بعهدة نقدية وإغلاقه بتقرير Z: نقدي وشبكة وضريبة وفرق العهدة، مع سجل الشفتات.",
      },
      { property: "og:title", content: "الشفتات — فوترة" },
      {
        property: "og:description",
        content: "فتح وإغلاق الشفتات بتقرير Z لمقهى بُنّ الديرة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShiftsPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function shiftExpectedCash(s: Shift) {
  return s.openingFloat + s.cashSales;
}

function ShiftsPage() {
  const [closing, setClosing] = useState<Shift | null>(null);
  const [opening, setOpening] = useState(false);
  const openShift = shifts.find((s) => s.closedAt === null)!;
  const closed = shifts.filter((s) => s.closedAt !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">الشفتات</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            فتح بالعهدة، إغلاق بتقرير Z، وسجل كامل للفرعين.
          </p>
        </div>
        <button
          onClick={() => setOpening(true)}
          className={`flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
        >
          <Timer className="h-4 w-4" />
          فتح شفت جديد
        </button>
      </div>

      {/* الشفت المفتوح حاليًا */}
      <section className="rounded-md border border-border-subtle bg-bg-base p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-success-bg text-success">
              <CircleCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-h3 font-semibold text-text-primary">
                شفت مفتوح الآن — {openShift.label}
              </h2>
              <p className="text-caption text-text-secondary">
                {employeeById(openShift.employeeId).name} · {branchById(openShift.branchId).city}{" "}
                {branchById(openShift.branchId).name} · فُتح{" "}
                <span className="num">{formatTime(openShift.openedAt)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setClosing(openShift)}
            className={`flex h-11 items-center gap-2 rounded-md bg-destructive px-4 text-body-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 ${focusRing}`}
          >
            <Lock className="h-4 w-4" />
            إغلاق الشفت وإصدار Z
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "العهدة الافتتاحية", value: formatSar(openShift.openingFloat) },
            { label: "مبيعات نقدية", value: formatSar(openShift.cashSales) },
            { label: "مبيعات شبكة", value: formatSar(openShift.cardSales) },
            { label: "عدد الفواتير", value: String(openShift.invoiceCount) },
          ].map((s) => (
            <div key={s.label} className="rounded-md bg-ink px-4 py-3 text-ink-foreground">
              <dt className="text-micro text-ink-foreground/60">{s.label}</dt>
              <dd className="num-display mt-1 text-[24px] font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* سجل الشفتات */}
      <section className="overflow-hidden rounded-md border border-border-subtle bg-bg-base">
        <div className="border-b border-border-subtle px-5 py-3.5">
          <h2 className="text-h3 font-semibold text-text-primary">سجل الشفتات</h2>
        </div>
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
              <th className="px-4 py-2.5 text-start">تقرير Z</th>
              <th className="px-4 py-2.5 text-start">الموظف</th>
              <th className="px-4 py-2.5 text-start">الفرع</th>
              <th className="px-4 py-2.5 text-start">التاريخ</th>
              <th className="px-4 py-2.5 text-end">إجمالي المبيعات</th>
              <th className="px-4 py-2.5 text-end">الضريبة</th>
              <th className="px-4 py-2.5 text-end">فرق العهدة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {closed.map((s) => {
              const variance = (s.actualCash ?? 0) - shiftExpectedCash(s);
              const totalSales = s.cashSales + s.cardSales + s.walletSales;
              return (
                <tr key={s.id} className="transition-colors hover:bg-bg-subtle">
                  <td className="num px-4 py-2.5 font-medium text-accent-700">{s.zNumber}</td>
                  <td className="px-4 py-2.5 font-medium text-text-primary">
                    {employeeById(s.employeeId).name}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {branchById(s.branchId).city} — {branchById(s.branchId).name}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{formatDate(s.closedAt!)}</td>
                  <td className="num px-4 py-2.5 text-end text-text-primary">
                    {formatSar(totalSales)}
                  </td>
                  <td className="num px-4 py-2.5 text-end text-text-secondary">
                    {formatSar(s.vatTotal)}
                  </td>
                  <td className="num px-4 py-2.5 text-end font-medium">
                    {variance === 0 ? (
                      <span className="inline-flex items-center justify-end gap-1.5 text-body-sm text-text-secondary">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        مطابق
                      </span>
                    ) : (
                      <span className={variance > 0 ? "text-info" : "text-error"}>
                        {formatSar(variance)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* مودال فتح شفت */}
      {opening ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-overlay p-6 shadow-[0_24px_64px_-16px_rgb(16_24_40/0.4)]">
            <h2 className="text-h3 font-semibold text-text-primary">فتح شفت جديد</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              عُدّ النقدية في الدرج وسجّلها كعهدة افتتاحية.
            </p>
            <label
              htmlFor="float"
              className="mt-5 mb-1.5 block text-body-sm font-medium text-text-primary"
            >
              العهدة الافتتاحية (ر.س)
            </label>
            <input
              id="float"
              defaultValue="500.00"
              className="num h-12 w-full rounded-md border border-border-subtle bg-bg-base px-3 text-h3 font-semibold text-text-primary focus:border-ring focus:outline-none"
            />
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setOpening(false)}
                className={`h-11 flex-1 rounded-md bg-primary text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
              >
                فتح الشفت
              </button>
              <button
                onClick={() => setOpening(false)}
                className={`h-11 flex-1 rounded-md border border-border-subtle bg-bg-base text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* مودال إغلاق الشفت — تقرير Z */}
      {closing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border-subtle bg-bg-overlay p-6 shadow-[0_24px_64px_-16px_rgb(16_24_40/0.4)]">
            <h2 className="text-h3 font-semibold text-text-primary">إغلاق الشفت — تقرير Z</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              {employeeById(closing.employeeId).name} · {closing.label}
            </p>

            <dl className="mt-5 space-y-2 rounded-md border border-border-subtle bg-bg-subtle p-4 text-body-sm">
              {[
                ["العهدة الافتتاحية", formatSar(closing.openingFloat)],
                ["مبيعات نقدية", formatSar(closing.cashSales)],
                ["مبيعات شبكة", formatSar(closing.cardSales)],
                ["مبيعات محفظة", formatSar(closing.walletSales)],
                ["ضريبة القيمة المضافة المحصّلة", formatSar(closing.vatTotal)],
                ["عدد الفواتير", String(closing.invoiceCount)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-text-secondary">{k}</dt>
                  <dd className="num font-medium text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>

            <dl className="mt-2 rounded-md bg-ink px-4 py-3 text-ink-foreground">
              <div className="flex items-center justify-between">
                <dt className="text-body-sm font-medium">النقدية المتوقعة في الدرج</dt>
                <dd className="num-display text-[28px] font-semibold">
                  {formatSar(shiftExpectedCash(closing))}
                </dd>
              </div>
            </dl>

            <label
              htmlFor="actual"
              className="mt-4 mb-1.5 block text-body-sm font-medium text-text-primary"
            >
              النقدية الفعلية المعدودة (ر.س)
            </label>
            <input
              id="actual"
              defaultValue={formatSar(shiftExpectedCash(closing))}
              className="num h-12 w-full rounded-md border border-border-subtle bg-bg-base px-3 text-h3 font-semibold text-text-primary focus:border-ring focus:outline-none"
            />

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setClosing(null)}
                className={`h-11 flex-1 rounded-md bg-destructive text-body-sm font-medium text-destructive-foreground hover:opacity-90 ${focusRing}`}
              >
                إغلاق الشفت وإصدار Z
              </button>
              <button
                onClick={() => setClosing(null)}
                className={`h-11 flex-1 rounded-md border border-border-subtle bg-bg-base text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
