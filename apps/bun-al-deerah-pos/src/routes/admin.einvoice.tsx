import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Clock3, PlugZap, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { getInvoices, invoiceStatusLabel } from "../lib/data";
import { formatDate, formatSar, formatTime } from "../lib/format";

export const Route = createFileRoute("/admin/einvoice")({
  head: () => ({
    meta: [
      { title: "مراقب الفوترة الإلكترونية — فوترة" },
      {
        name: "description",
        content:
          "مراقب إرسال الفواتير للفوترة الإلكترونية: مُرسلة ومعلّقة ومرفوضة مع رموز الأخطاء — بيئة تجريبية.",
      },
      { property: "og:title", content: "مراقب الفوترة الإلكترونية — فوترة" },
      {
        property: "og:description",
        content: "مراقب إرسال الفواتير — بيئة تجريبية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EinvoiceMonitor,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const errorExplain: Record<string, string> = {
  "BR-KSA-12": "الرقم الضريبي للمشتري غير مكتمل في فاتورة ضريبية",
  "XSD-412": "حقل إلزامي مفقود في ملف الفاتورة",
  "SIG-09": "تعذّر التحقق من التوقيع — أُعيد التوليد تلقائيًا",
  "BR-S-08": "قيمة الضريبة لا تطابق مجموع البنود",
};

const onboardingSteps = [
  {
    title: "بيانات المنشأة والرقم الضريبي",
    body: "تحققنا من الرقم الضريبي 310122393500003.",
    done: true,
  },
  {
    title: "إصدار شهادة التشفير",
    body: "أُصدرت شهادة بيئة تجريبية صالحة حتى أغسطس 2027.",
    done: true,
  },
  {
    title: "ربط الحل التقني",
    body: "سُجّل جهازا الفرعين (كاشير ١ و٢) على البيئة التجريبية.",
    done: true,
  },
  { title: "فاتورة تحقق أولى", body: "أرسل فاتورة تجريبية واحدة لإتمام الربط.", done: false },
];

function EinvoiceMonitor() {
  const [tab, setTab] = useState<"monitor" | "onboarding">("monitor");
  const stats = useMemo(() => {
    const all = getInvoices();
    return {
      sent: all.filter((i) => i.status === "sent"),
      pending: all.filter((i) => i.status === "pending"),
      rejected: all.filter((i) => i.status === "rejected"),
    };
  }, []);

  const cards = [
    {
      label: "مُرسلة ومقبولة",
      count: stats.sent.length,
      icon: <CheckCircle2 className="h-5 w-5" />,
      cls: "bg-success-bg text-success",
    },
    {
      label: "معلّقة — تُرسل تلقائيًا",
      count: stats.pending.length,
      icon: <Clock3 className="h-5 w-5" />,
      cls: "bg-info-bg text-info",
    },
    {
      label: "مرفوضة — تحتاج مراجعة",
      count: stats.rejected.length,
      icon: <CircleAlert className="h-5 w-5" />,
      cls: "bg-error-bg text-error",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">مراقب الفوترة</h1>
          <p className="mt-1 flex items-center gap-1.5 text-body-sm text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-success" />
            متوافق تقنيًا مع متطلبات المرحلة الثانية — بيئة تجريبية
          </p>
        </div>
        <div className="inline-flex border border-border-subtle bg-bg-base p-1">
          {(
            [
              ["monitor", "المراقب"],
              ["onboarding", "الربط التجريبي"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`h-9 px-4 text-body-sm font-medium transition-colors ${focusRing} ${
                tab === id ? "bg-ink text-ink-foreground" : "text-text-secondary hover:bg-bg-subtle"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "onboarding" ? (
        <section className="rounded-md border border-border-subtle bg-bg-base p-6">
          <h2 className="text-h3 font-semibold text-text-primary">الربط التجريبي — أربع خطوات</h2>
          <ol className="mt-5 space-y-4">
            {onboardingSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    s.done ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                  }`}
                >
                  {s.done ? <CheckCircle2 className="h-5 w-5" /> : <PlugZap className="h-5 w-5" />}
                </span>
                <div className="flex-1 border-b border-border-subtle pb-4">
                  <p className="text-body font-medium text-text-primary">{s.title}</p>
                  <p className="mt-0.5 text-body-sm text-text-secondary">{s.body}</p>
                </div>
                {!s.done ? (
                  <button
                    className={`h-11 shrink-0 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
                  >
                    إرسال فاتورة التحقق
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-4 rounded-md bg-ink p-5 text-ink-foreground"
              >
                <span className="flex h-11 w-11 items-center justify-center text-ink-foreground/80">
                  {c.icon}
                </span>
                <div>
                  <p className="num-display text-[36px] font-bold">{c.count}</p>
                  <p className="text-caption text-ink-foreground/60">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-md border border-border-subtle bg-bg-base">
            <div className="border-b border-border-subtle px-5 py-3.5">
              <h2 className="text-h3 font-semibold text-text-primary">أحدث الأحداث</h2>
            </div>
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                  <th className="px-5 py-2.5 text-start">الفاتورة</th>
                  <th className="px-4 py-2.5 text-start">الوقت</th>
                  <th className="px-4 py-2.5 text-start">الحالة</th>
                  <th className="px-4 py-2.5 text-start">التفصيل</th>
                  <th className="px-5 py-2.5 text-end">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[
                  ...stats.rejected.slice(0, 6),
                  ...stats.pending.slice(0, 4),
                  ...stats.sent.slice(0, 4),
                ].map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-bg-subtle">
                    <td className="num px-5 py-2.5 font-medium text-accent-700">{inv.number}</td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {formatDate(inv.createdAt)}{" "}
                      <span className="num text-text-muted">{formatTime(inv.createdAt)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            inv.status === "sent"
                              ? "bg-success"
                              : inv.status === "pending"
                                ? "bg-info"
                                : "bg-error"
                          }`}
                        />
                        {invoiceStatusLabel[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">
                      {inv.status === "rejected" && inv.errorCode ? (
                        <>
                          <span className="num font-medium text-error">{inv.errorCode}</span> —{" "}
                          {errorExplain[inv.errorCode] ?? "خطأ غير مصنّف"}
                        </>
                      ) : inv.status === "pending" ? (
                        "تُعاد المحاولة خلال دقائق تلقائيًا"
                      ) : (
                        "قُبلت وخُتمت"
                      )}
                    </td>
                    <td className="num px-5 py-2.5 text-end font-medium text-text-primary">
                      {formatSar(inv.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
