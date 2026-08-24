import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CirclePause, Trash2 } from "lucide-react";
import { EmptyState } from "../components/DataStates";
import { VAT_RATE, type HeldOrder } from "../lib/data";
import { removeHeld, restoreHeld, usePosHeld } from "../lib/pos-store";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/pos/held")({
  head: () => ({
    meta: [
      { title: "الطلبات المعلّقة — شاشة الكاشير — فوترة" },
      {
        name: "description",
        content: "استرجاع الطلبات المعلّقة في شاشة الكاشير بنظام فوترة.",
      },
      { property: "og:title", content: "الطلبات المعلّقة — شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "استرجاع الطلبات المعلّقة في شاشة الكاشير.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HeldOrders,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function HeldOrders() {
  const orders = usePosHeld();
  const navigate = useNavigate();

  const restore = (order: HeldOrder) => {
    restoreHeld(order.id);
    void navigate({ to: "/pos" });
  };

  return (
    <div className="dark flex min-h-screen flex-col bg-bg-base text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-subtle px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            aria-label="رجوع للكاشير"
            className={`flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="text-h3 font-semibold">الطلبات المعلّقة</h1>
        </div>
        <span className="num text-body-sm font-medium text-text-secondary">14:36</span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        {orders.length === 0 ? (
          <div className="dark">
            <EmptyState
              title="لا طلبات معلّقة"
              body="عند تعليق طلب من شاشة الكاشير سيظهر هنا لاسترجاعه بنقرة واحدة."
              action={
                <Link
                  to="/pos"
                  className={`inline-flex h-11 items-center rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
                >
                  فتح شاشة الكاشير
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const subtotal = order.lines.reduce((s, l) => s + l.price * l.qty, 0);
              const total = subtotal * (1 + VAT_RATE);
              return (
                <li
                  key={order.id}
                  className="rounded-md border border-border-subtle bg-bg-overlay p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-h3 font-semibold">{order.customer}</p>
                      <p className="mt-0.5 text-caption text-text-muted">
                        عُلِّق <span className="num">{order.heldAt}</span>
                        {order.note ? ` — ${order.note}` : ""}
                        <span className="ms-2 inline-flex items-center gap-1 text-text-secondary">
                          <CirclePause className="h-3.5 w-3.5" />
                          {order.lines.length} أصناف
                        </span>
                      </p>
                    </div>
                    <p className="text-body-sm text-text-secondary">
                      <span className="num text-h3 font-semibold text-text-primary">
                        {formatSar(total)}
                      </span>{" "}
                      ر.س
                    </p>
                  </div>

                  <ul className="mt-3 space-y-1 border-t border-border-subtle pt-3">
                    {order.lines.map((l) => (
                      <li
                        key={l.productId}
                        className="flex items-center justify-between text-body-sm"
                      >
                        <span className="text-text-secondary">
                          {l.name} <span className="num text-text-muted">×{l.qty}</span>
                        </span>
                        <span className="num text-text-primary">{formatSar(l.price * l.qty)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => restore(order)}
                      className={`flex h-12 flex-1 items-center justify-center rounded-md bg-primary text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
                    >
                      استرجاع إلى السلة
                    </button>
                    <button
                      aria-label={`حذف طلب ${order.customer}`}
                      onClick={() => removeHeld(order.id)}
                      className={`flex h-12 w-12 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-error transition-colors hover:bg-error-bg ${focusRing}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
