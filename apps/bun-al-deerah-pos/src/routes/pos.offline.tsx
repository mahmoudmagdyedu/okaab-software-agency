import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudOff, LogOut, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { OfflineBanner } from "../components/DataStates";
import { categories, dotByCategory, products } from "../lib/data";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/pos/offline")({
  head: () => ({
    meta: [
      { title: "وضع عدم الاتصال — شاشة الكاشير — فوترة" },
      {
        name: "description",
        content: "شاشة الكاشير في وضع عدم الاتصال — البيع مستمر والفواتير تُزامَن لاحقًا.",
      },
      { property: "og:title", content: "وضع عدم الاتصال — شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "البيع مستمر أوفلاين والفواتير تُزامَن عند عودة الاتصال.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PosOffline,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function PosOffline() {
  const [activeCategory, setActiveCategory] = useState("all");
  const visible = useMemo(
    () => products.filter((p) => activeCategory === "all" || p.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-bg-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-subtle px-4">
        <div className="flex items-center gap-3">
          <span className="text-body-sm font-semibold">الرياض — حي النرجس</span>
          <span className="h-4 w-px bg-border-subtle" />
          <span className="text-body-sm text-text-secondary">سالم الدوسري</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 items-center gap-2 rounded-md bg-warning-bg px-3 text-caption font-medium text-warning">
            <CloudOff className="h-4 w-4" />
            غير متصل
          </span>
          <span className="num text-body-sm font-medium text-text-secondary">14:35</span>
          <button
            className={`flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-bg-overlay px-4 text-body-sm font-medium transition-colors hover:bg-bg-base ${focusRing}`}
          >
            <LogOut className="h-4 w-4" />
            إنهاء الشفت
          </button>
        </div>
      </header>

      <OfflineBanner pendingCount={7} />

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 p-4 pb-0">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                placeholder="البحث والباركود يعملان محليًا…"
                className="h-12 w-full rounded-md border border-border-subtle bg-bg-overlay ps-11 pe-4 text-body placeholder:text-text-muted focus:border-ring focus:outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[{ id: "all", label: "الكل", dot: "bg-text-muted" }, ...categories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-body-sm font-medium transition-colors ${focusRing} ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border-subtle bg-bg-overlay text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-5 content-start gap-3 overflow-y-auto p-4">
            {visible.slice(0, 15).map((p) => (
              <button
                key={p.id}
                disabled={p.out}
                className={`flex min-h-[104px] flex-col justify-between rounded-md border border-border-subtle p-3 text-start transition-colors ${focusRing} ${
                  p.out
                    ? "cursor-not-allowed bg-bg-subtle opacity-60"
                    : "bg-bg-overlay hover:border-text-muted active:bg-bg-subtle"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-body-sm font-medium leading-snug">{p.name}</span>
                  {p.out ? (
                    <span className="shrink-0 rounded-md bg-error-bg px-2 py-0.5 text-caption font-medium text-error">
                      نفد
                    </span>
                  ) : (
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotByCategory[p.category]}`}
                    />
                  )}
                </span>
                <span className="text-body-sm text-text-secondary">
                  <span className="num font-semibold text-text-primary">{formatSar(p.price)}</span>{" "}
                  ر.س
                </span>
              </button>
            ))}
          </div>
        </main>

        <aside className="flex w-[420px] shrink-0 flex-col items-center justify-center border-s border-border-subtle bg-bg-subtle px-8 text-center">
          <CloudOff className="h-10 w-10 text-warning" />
          <h2 className="mt-4 text-h3 font-semibold">البيع لا يتوقف</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            كل فاتورة تُحفظ على الجهاز وتُرسَل للفوترة الإلكترونية فور عودة الاتصال — برقمها
            التسلسلي نفسه.
          </p>
          <p className="mt-4 rounded-md bg-warning-bg px-3 py-2 text-caption text-warning">
            <span className="num font-semibold">7</span> فواتير بانتظار المزامنة منذ{" "}
            <span className="num">14:20</span>
          </p>
          <Link
            to="/pos"
            className={`mt-6 flex h-11 items-center rounded-md border border-border-subtle bg-bg-overlay px-4 text-body-sm font-medium transition-colors hover:bg-bg-base ${focusRing}`}
          >
            العودة للوضع المتصل
          </Link>
        </aside>
      </div>
    </div>
  );
}
