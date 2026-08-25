import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, Search } from "lucide-react";

export const Route = createFileRoute("/pos/empty")({
  head: () => ({
    meta: [
      { title: "كتالوج فارغ — شاشة الكاشير — فوترة" },
      {
        name: "description",
        content: "حالة شاشة الكاشير عندما لا توجد أصناف بعد في الفرع.",
      },
      { property: "og:title", content: "كتالوج فارغ — شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "حالة شاشة الكاشير عندما لا توجد أصناف بعد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PosEmpty,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function PosEmpty() {
  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-bg-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-subtle px-4">
        <span className="text-body-sm font-semibold">الرياض — حي النرجس</span>
        <span className="num text-body-sm font-medium text-text-secondary">14:38</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 p-4 pb-0">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                disabled
                placeholder="لا يوجد ما يُبحث عنه بعد…"
                className="h-12 w-full cursor-not-allowed rounded-md border border-border-subtle bg-bg-overlay ps-11 pe-4 text-body placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-md bg-bg-overlay text-text-muted">
              <PackageOpen className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-h2 font-semibold">لا أصناف في هذا الفرع بعد</h1>
            <p className="mt-2 max-w-md text-body-sm text-text-secondary">
              الكتالوج فارغ. اطلب من «محمد الغامدي» — مدير المخزون — إضافة الأصناف من لوحة الإدارة،
              وستظهر هنا فور حفظها حتى بدون اتصال.
            </p>
            <Link
              to="/admin/products"
              className={`mt-6 flex h-12 items-center rounded-md bg-primary px-6 text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
            >
              فتح إدارة الأصناف
            </Link>
          </div>
        </main>

        <aside className="flex w-[420px] shrink-0 flex-col items-center justify-center border-s border-border-subtle bg-bg-subtle px-8 text-center">
          <h2 className="text-h3 font-semibold">السلة فارغة</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            لا يمكن بدء طلب قبل إضافة أصناف للكتالوج.
          </p>
          <button
            disabled
            className="mt-6 flex h-14 w-full cursor-not-allowed items-center justify-center rounded-md bg-primary text-h3 font-semibold text-primary-foreground opacity-50"
          >
            الدفع — <span className="num mx-1">0.00</span> ر.س
          </button>
        </aside>
      </div>
    </div>
  );
}
