import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { categories, company, dotByCategory, products } from "../lib/data";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "منيو بُنّ الديرة — اطلب من طاولتك" },
      {
        name: "description",
        content:
          "منيو مقهى بُنّ الديرة الرقمي عبر QR: مشروبات ساخنة ومثلجة، شاي وكرك، حلويات وسندويتشات بأسعار شاملة الضريبة.",
      },
      { property: "og:title", content: "منيو بُنّ الديرة — اطلب من طاولتك" },
      {
        property: "og:description",
        content: "مشروبات ساخنة ومثلجة، شاي وكرك، حلويات وسندويتشات — اطلب من طاولتك عبر QR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicMenu,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function PublicMenu() {
  const [cat, setCat] = useState("hot");
  const [loading, setLoading] = useState(false);
  const list = products.filter((p) => p.category === cat && !p.out);
  const activeCat = categories.find((c) => c.id === cat);

  const switchCat = (id: string) => {
    if (id === cat) return;
    setLoading(true);
    setCat(id);
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl bg-bg-base text-text-primary">
      <header className="border-b border-border-subtle bg-bg-base px-5 pb-5 pt-8 text-center">
        <BrandLogo className="justify-center" />
        <h1 className="sr-only">{company.name}</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          الرياض — حي النرجس · طاولة{" "}
          <span className="num" dir="ltr">
            12
          </span>
        </p>
      </header>

      <nav
        aria-label="فئات المنيو"
        className="no-scrollbar sticky top-0 z-10 overflow-x-auto border-b border-border-subtle bg-bg-base/95 backdrop-blur"
      >
        <div className="flex gap-1 bg-bg-subtle p-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => switchCat(c.id)}
              aria-pressed={cat === c.id}
              className={`h-11 shrink-0 rounded-sm px-3 text-body-sm font-medium transition-colors sm:px-4 ${focusRing} ${
                cat === c.id ? "bg-ink text-ink-foreground" : "text-text-secondary hover:bg-bg-base"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="px-4 py-5">
        <h2 className="text-h2 font-semibold text-text-primary">{activeCat?.label}</h2>

        {loading ? (
          <ul className="mt-4 space-y-3" aria-busy="true" aria-label="جارٍ التحميل">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex animate-pulse items-center justify-between rounded-md border border-border-subtle bg-bg-base p-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-bg-subtle" />
                  <div className="h-3 w-20 rounded bg-bg-subtle" />
                </div>
                <div className="h-5 w-14 rounded bg-bg-subtle" />
              </li>
            ))}
          </ul>
        ) : list.length === 0 ? (
          <div className="mt-8 rounded-md border border-border-subtle bg-bg-subtle p-8 text-center">
            <p className="text-h3 font-semibold text-text-primary">لا أصناف متاحة في هذه الفئة</p>
            <p className="mt-1 text-body-sm text-text-secondary">جرّب فئة أخرى من الأعلى.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-bg-base p-4 transition-colors hover:bg-bg-subtle"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-9 w-9 shrink-0 rounded-full ${dotByCategory[p.category]}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-caption text-text-muted">{activeCat?.label}</p>
                  </div>
                </div>
                <p className="num text-body font-semibold text-text-primary">
                  {formatSar(p.price)}{" "}
                  <span className="text-caption font-normal text-text-muted">ر.س</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 border-t border-border-subtle pt-4 text-center text-caption text-text-muted">
          جميع الأسعار شاملة ضريبة القيمة المضافة{" "}
          <span className="num" dir="ltr">
            15%
          </span>{" "}
          · الرقم الضريبي{" "}
          <span className="num" dir="ltr">
            {company.vatNumber}
          </span>
        </p>
      </main>
    </div>
  );
}
