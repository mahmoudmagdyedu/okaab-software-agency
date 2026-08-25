import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, CreditCard, Delete, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { formatSar } from "../lib/format";
import { cartTotals, completeSale, usePosCart } from "../lib/pos-store";

export const Route = createFileRoute("/pos/payment")({
  head: () => ({
    meta: [
      { title: "الدفع — شاشة الكاشير — فوترة" },
      {
        name: "description",
        content: "نافذة الدفع في شاشة الكاشير: نقدي أو شبكة أو محفظة، مع المبلغ المدفوع والباقي.",
      },
      { property: "og:title", content: "الدفع — شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "نافذة الدفع في شاشة الكاشير بنظام فوترة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentScreen,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

type Method = "cash" | "card" | "wallet";

const methods: Array<{ id: Method; label: string; icon: React.ReactNode }> = [
  { id: "cash", label: "نقدي", icon: <Banknote className="h-5 w-5" /> },
  { id: "card", label: "شبكة", icon: <CreditCard className="h-5 w-5" /> },
  { id: "wallet", label: "محفظة", icon: <Smartphone className="h-5 w-5" /> },
];

function PaymentScreen() {
  const [method, setMethod] = useState<Method>("cash");
  const [paidRaw, setPaidRaw] = useState("100");
  /* لقطة الإيصال تُؤخذ لحظة التأكيد قبل أن يفرغ completeSale السلة —
     وإلا أُعيد حساب الباقي من سلة فارغة على شاشة النجاح */
  const [receipt, setReceipt] = useState<{
    num: string;
    change: number;
    label: string;
  } | null>(null);
  const cart = usePosCart();

  /* الإجمالي من السلة الفعلية؛ وعند فتح الشاشة مباشرة بلا سلة نعرض
     سلة العرض البطل: 87.00 + ضريبة 13.05 = 100.05 */
  const { subtotal, vat, total } = cartTotals(cart);
  const hasCart = cart.length > 0;
  const billTotal = hasCart ? total : 100.05;
  const billVat = hasCart ? vat : 13.05;
  void subtotal;

  const paid = Number(paidRaw || "0");
  const change = Math.max(0, paid - billTotal);
  const remaining = Math.max(0, billTotal - paid);
  const canConfirm = receipt === null && (method !== "cash" || paid >= billTotal);

  const press = (k: string) => {
    setPaidRaw((prev) => {
      if (k === "del") return prev.slice(0, -1);
      if (k === "." && prev.includes(".")) return prev;
      if (prev === "0") return k;
      if ((prev + k).length > 8) return prev;
      return prev + k;
    });
  };

  const confirm = () => {
    const snapshot = {
      change,
      label: methods.find((m) => m.id === method)!.label,
    };
    const num = completeSale();
    setReceipt({ num, ...snapshot });
  };

  if (receipt !== null) {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 text-text-primary">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
          <Banknote className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-h1 font-semibold">تمت العملية بنجاح</h1>
        <p className="mt-2 text-body text-text-secondary">
          فاتورة <span className="num font-semibold text-text-primary">{receipt.num}</span> —{" "}
          <span>{receipt.label}</span>
          {receipt.change > 0 ? (
            <>
              {" "}
              · الباقي للعميل{" "}
              <span className="num font-semibold text-text-primary">
                {formatSar(receipt.change)}
              </span>{" "}
              ر.س
            </>
          ) : null}
        </p>
        <p className="mt-1 text-body-sm text-text-muted">
          أُرسلت للفوترة الإلكترونية (بيئة تجريبية) وتُطبع الآن.
        </p>
        <Link
          to="/pos"
          className={`mt-8 flex h-14 items-center rounded-md bg-primary px-8 text-h3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
        >
          فاتورة جديدة
        </Link>
      </div>
    );
  }

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-bg-base p-4 text-text-primary">
      <div className="w-full max-w-3xl rounded-lg border border-border-subtle bg-bg-subtle shadow-[0_24px_64px_-16px_rgb(0_0_0/0.6)]">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h1 className="text-h2 font-semibold">الدفع</h1>
          <Link
            to="/pos"
            aria-label="إغلاق"
            className={`flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {/* الملخص */}
          <div className="border-b border-border-subtle p-5 md:border-b-0 md:border-e">
            <div className="rounded-sm bg-ink p-4 text-ink-foreground">
              <p className="text-body-sm text-ink-foreground/70">إجمالي الفاتورة</p>
              <p className="text-price-total num-display mt-1 font-bold">
                {formatSar(billTotal)}
                <span className="ms-2 font-sans text-body-sm font-normal text-ink-foreground/70">
                  ر.س
                </span>
              </p>
              <p className="mt-1 text-caption text-ink-foreground/60">
                يشمل ضريبة القيمة المضافة 15% — <span className="num">{formatSar(billVat)}</span>{" "}
                ر.س
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex h-14 flex-col items-center justify-center gap-1 rounded-md text-body-sm font-medium transition-colors ${focusRing} ${
                    method === m.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border-subtle bg-bg-overlay text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {method === "cash" ? (
              <dl className="mt-5 space-y-1.5 text-body-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">المبلغ المدفوع</dt>
                  <dd className="num text-h3 font-semibold">{formatSar(paid)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">الباقي للعميل</dt>
                  <dd className={`num text-h3 font-semibold ${change > 0 ? "text-success" : ""}`}>
                    {formatSar(change)}
                  </dd>
                </div>
                {remaining > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-text-secondary">المتبقي المطلوب</dt>
                    <dd className="num text-h3 font-semibold text-warning">
                      {formatSar(remaining)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-5 rounded-md bg-info-bg px-3 py-2.5 text-body-sm text-info">
                {method === "card"
                  ? "مرّر البطاقة على جهاز الشبكة — سيُؤكَّد المبلغ تلقائيًا."
                  : "اعرض رمز المحفظة للعميل ليمسحه بهاتفه."}
              </p>
            )}

            <button
              disabled={!canConfirm}
              onClick={confirm}
              className={`mt-5 flex h-14 w-full items-center justify-center rounded-md bg-primary text-h3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              تأكيد الدفع — <span className="num mx-1">{formatSar(billTotal)}</span> ر.س
            </button>
          </div>

          {/* لوحة الأرقام — نقدي فقط */}
          <div className={`p-5 ${method !== "cash" ? "pointer-events-none opacity-40" : ""}`}>
            <div className="grid grid-cols-3 gap-2" dir="ltr">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) =>
                k === "del" ? (
                  <button
                    key="del"
                    aria-label="مسح"
                    onClick={() => press("del")}
                    className={`flex h-16 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    key={k}
                    onClick={() => press(k)}
                    className={`num h-16 rounded-md border border-border-subtle bg-bg-overlay text-h2 font-semibold transition-colors hover:bg-bg-base ${focusRing}`}
                  >
                    {k}
                  </button>
                ),
              )}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[50, 100, 200].map((v) => (
                <button
                  key={v}
                  onClick={() => setPaidRaw(String(v))}
                  className={`num flex h-11 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
