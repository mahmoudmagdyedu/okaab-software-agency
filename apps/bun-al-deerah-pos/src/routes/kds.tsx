import { createFileRoute } from "@tanstack/react-router";
import { Check, CheckCheck, Clock, MonitorX, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";

export const Route = createFileRoute("/kds")({
  head: () => ({
    meta: [
      { title: "شاشة المطبخ — فوترة" },
      {
        name: "description",
        content:
          "شاشة عرض المطبخ KDS الداكنة لتجهيز طلبات بُنّ الديرة: تذاكر ملوّنة بالحالة ومؤقّت مرور الوقت.",
      },
      { property: "og:title", content: "شاشة المطبخ — فوترة" },
      { property: "og:description", content: "شاشة عرض المطبخ KDS لتجهيز الطلبات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KdsScreen,
});

type KdsStatus = "new" | "preparing" | "done";

type KdsItem = { name: string; qty: number; notes?: string };
type KdsTicket = {
  id: string;
  number: string;
  type: "محلي" | "سفري" | "توصيل";
  elapsedMin: number;
  status: KdsStatus;
  items: KdsItem[];
};

const initialTickets: KdsTicket[] = [
  {
    id: "t1",
    number: "INV-2026-00421",
    type: "سفري",
    elapsedMin: 2,
    status: "new",
    items: [
      { name: "فلات وايت", qty: 2 },
      { name: "كورتادو", qty: 1, notes: "سكر أقل" },
      { name: "كرواسون زبدة", qty: 1 },
    ],
  },
  {
    id: "t2",
    number: "INV-2026-00420",
    type: "محلي",
    elapsedMin: 5,
    status: "new",
    items: [
      { name: "كرك شاي", qty: 3 },
      { name: "كيكة تمر", qty: 2 },
    ],
  },
  {
    id: "t3",
    number: "INV-2026-00419",
    type: "توصيل",
    elapsedMin: 9,
    status: "preparing",
    items: [
      { name: "موكا مثلجة", qty: 1, notes: "بدون كريمة" },
      { name: "سموذي فراولة", qty: 1 },
      { name: "باستا الدجاج", qty: 1 },
    ],
  },
  {
    id: "t4",
    number: "INV-2026-00418",
    type: "سفري",
    elapsedMin: 14,
    status: "preparing",
    items: [
      { name: "قهوة عربية (دلة)", qty: 1 },
      { name: "معمول تمر", qty: 2 },
    ],
  },
  {
    id: "t5",
    number: "INV-2026-00417",
    type: "محلي",
    elapsedMin: 21,
    status: "preparing",
    items: [
      { name: "لاتيه ساخن", qty: 1 },
      { name: "كابتشينو", qty: 1 },
      { name: "شاي أخضر", qty: 1 },
    ],
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function urgencyColor(min: number): string {
  if (min >= 15) return "text-error";
  if (min >= 8) return "text-warning";
  return "text-success";
}

function KdsScreen() {
  const [tickets, setTickets] = useState<KdsTicket[]>(initialTickets);
  const [view, setView] = useState<"orders" | "empty" | "offline">("orders");

  const advance = (id: string) =>
    setTickets((prev) =>
      prev
        .map((t) =>
          t.id === id
            ? {
                ...t,
                status: t.status === "new" ? "preparing" : ("done" as KdsStatus),
              }
            : t,
        )
        .filter((t) => t.status !== "done"),
    );

  return (
    <div className="dark min-h-dvh bg-bg-base text-text-primary">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-bg-subtle px-3 py-2 sm:flex-nowrap sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <BrandLogo compact />
          <span className="shrink-0 text-body font-semibold sm:text-h3">شاشة المطبخ</span>
          <span className="hidden rounded-md bg-bg-overlay px-2 py-0.5 text-caption text-text-secondary md:inline-flex">
            الرياض — حي النرجس
          </span>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <span className="num text-body-sm text-text-secondary" dir="ltr">
            14:32
          </span>
          <div className="flex min-w-0 overflow-hidden rounded-md border border-border-subtle text-caption">
            {(
              [
                ["orders", "التذاكر"],
                ["empty", "فارغ"],
                ["offline", "أوفلاين"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1.5 transition-colors sm:px-3 ${focusRing} ${
                  view === v
                    ? "bg-bg-overlay font-medium text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {view === "offline" ? (
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-4 text-center">
          <MonitorX className="h-12 w-12 text-text-muted" aria-hidden="true" />
          <h1 className="text-h2 font-semibold">انقطع الاتصال بالنقاط</h1>
          <p className="max-w-sm text-body-sm text-text-secondary">
            ستستكمل التذاكر الجديدة الظهور فور عودة الاتصال. التذاكر الحالية محفوظة على هذه الشاشة.
          </p>
        </div>
      ) : view === "empty" ? (
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-4 text-center">
          <UtensilsCrossed className="h-12 w-12 text-text-muted" aria-hidden="true" />
          <h1 className="text-h2 font-semibold">لا طلبات معلّقة</h1>
          <p className="max-w-sm text-body-sm text-text-secondary">
            كل الطلبات سلّمت. تظهر التذاكر الجديدة هنا فور إرسالها من الكاشير.
          </p>
        </div>
      ) : (
        <main className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tickets.map((t) => (
            <article
              key={t.id}
              className="flex flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-overlay"
            >
              <span
                className={`block h-1 w-full ${
                  t.elapsedMin >= 15 ? "bg-error" : t.elapsedMin >= 8 ? "bg-warning" : "bg-success"
                }`}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="num text-body-sm font-semibold" dir="ltr">
                    {t.number}
                  </span>
                  <span className="rounded bg-bg-subtle px-1.5 py-0.5 text-caption text-text-secondary">
                    {t.type}
                  </span>
                </div>
                <span
                  className={`num flex items-center gap-1 text-body-sm font-semibold ${urgencyColor(t.elapsedMin)}`}
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.elapsedMin} د
                </span>
              </div>

              <ul className="flex-1 space-y-1.5 px-4 py-3">
                {t.items.map((item) => (
                  <li key={item.name} className="text-body-sm">
                    <span className="num font-semibold text-accent-400" dir="ltr">
                      {item.qty}×
                    </span>{" "}
                    <span className="font-medium">{item.name}</span>
                    {item.notes && (
                      <span className="mt-0.5 block text-caption text-warning">{item.notes}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="p-3">
                <button
                  onClick={() => advance(t.id)}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-md text-body-sm font-semibold transition-colors ${focusRing} ${
                    t.status === "new"
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-success text-bg-base hover:opacity-90"
                  }`}
                >
                  {t.status === "new" ? (
                    <>
                      <Check className="h-5 w-5" aria-hidden="true" />
                      بدء التجهيز
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-5 w-5" aria-hidden="true" />
                      تجهيز كامل
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </main>
      )}
    </div>
  );
}
