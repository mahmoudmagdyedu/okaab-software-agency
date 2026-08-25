import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Search,
  CloudCheck,
  LogOut,
  UserRoundPlus,
  CirclePause,
  RotateCcw,
  Percent,
  Minus,
  Plus,
  StickyNote,
  Coffee,
} from "lucide-react";
import {
  addToCart as storeAddToCart,
  cartTotals,
  changeQty as storeChangeQty,
  holdCart,
  usePosCart,
} from "../lib/pos-store";
import { formatSar } from "../lib/format";
import { BrandLogo } from "../components/BrandLogo";

export const Route = createFileRoute("/pos/")({
  head: () => ({
    meta: [
      { title: "شاشة الكاشير — فوترة" },
      {
        name: "description",
        content:
          "شاشة الكاشير الداكنة في نظام فوترة — بيع سريع يعمل أوفلاين أولًا مع سلة وضريبة ١٥٪.",
      },
      { property: "og:title", content: "شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "شاشة الكاشير الداكنة في نظام فوترة — بيع سريع يعمل أوفلاين أولًا.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PosCashier,
});

type Category = {
  id: string;
  label: string;
  dot: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  out?: boolean;
};

const categories: Category[] = [
  { id: "all", label: "الكل", dot: "bg-text-muted" },
  { id: "hot", label: "مشروبات ساخنة", dot: "bg-accent-400" },
  { id: "iced", label: "مثلجة", dot: "bg-info" },
  { id: "tea", label: "شاي وكرك", dot: "bg-warning" },
  { id: "dessert", label: "حلويات", dot: "bg-error" },
  { id: "sandwich", label: "سندويتشات", dot: "bg-success" },
];

const dotByCategory = Object.fromEntries(categories.map((c) => [c.id, c.dot])) as Record<
  string,
  string
>;

const products: Product[] = [
  { id: 1, name: "لاتيه", price: 16.5, category: "hot" },
  { id: 2, name: "كورتادو", price: 15.0, category: "hot" },
  { id: 3, name: "كابتشينو", price: 15.5, category: "hot" },
  { id: 4, name: "فلات وايت", price: 16.0, category: "hot" },
  { id: 5, name: "إسبريسو", price: 11.0, category: "hot" },
  { id: 6, name: "أمريكانو", price: 13.0, category: "hot" },
  { id: 7, name: "سبانيش لاتيه", price: 18.0, category: "hot" },
  { id: 8, name: "موكا", price: 17.5, category: "hot" },
  { id: 9, name: "آيس لاتيه", price: 17.0, category: "iced" },
  { id: 10, name: "آيس أمريكانو", price: 14.0, category: "iced" },
  { id: 11, name: "فرابتشينو كراميل", price: 19.5, category: "iced", out: true },
  { id: 12, name: "آيس موكا", price: 18.5, category: "iced" },
  { id: 13, name: "كولد برو", price: 16.5, category: "iced" },
  { id: 14, name: "شاي كرك", price: 8.5, category: "tea" },
  { id: 15, name: "كرك بالزعفران", price: 12.0, category: "tea" },
  { id: 16, name: "شاي أخضر بالنعناع", price: 10.0, category: "tea" },
  { id: 17, name: "شاي مغربي", price: 11.0, category: "tea" },
  { id: 18, name: "كيكة تمر", price: 13.5, category: "dessert" },
  { id: 19, name: "تشيز كيك زعفران", price: 18.0, category: "dessert" },
  { id: 20, name: "كرواسون زبدة", price: 9.5, category: "dessert" },
  { id: 21, name: "براوني", price: 12.5, category: "dessert" },
  { id: 22, name: "معمول", price: 7.5, category: "dessert" },
  { id: 23, name: "هالومي مشوي", price: 16.0, category: "sandwich" },
  { id: 24, name: "دجاج مشوي", price: 17.5, category: "sandwich" },
  { id: 25, name: "لبنة وزعتر", price: 10.5, category: "sandwich" },
  { id: 26, name: "تونة بالجبن", price: 14.0, category: "sandwich" },
];

/* حلقة تركيز موحّدة بتوكن ring على كل العناصر التفاعلية */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function PosCashier() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const cart = usePosCart();
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (activeCategory === "all" || p.category === activeCategory) &&
          (query.trim() === "" || p.name.includes(query.trim())),
      ),
    [activeCategory, query],
  );

  const { subtotal, vat, total } = cartTotals(cart);
  const discount = 0;

  const addProduct = (product: Product) => {
    if (product.out) return;
    storeAddToCart({ name: product.name, price: product.price });
    // تركيز دائم لحقل البحث — تدفق مسح الباركود لا ينقطع
    searchRef.current?.focus();
  };

  const holdCurrentOrder = () => {
    if (holdCart()) void navigate({ to: "/pos/held" });
  };

  return (
    <div className="dark flex min-h-dvh flex-col bg-bg-base text-text-primary lg:h-screen lg:overflow-hidden">
      {/* الشريط العلوي — 56px */}
      <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border-subtle bg-bg-subtle px-3 py-2 sm:px-4 lg:h-14 lg:py-0">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <BrandLogo compact />
          <span className="hidden text-body-sm font-semibold sm:inline">الرياض — حي النرجس</span>
          <span className="hidden h-4 w-px bg-border-subtle sm:block" />
          <span className="truncate text-body-sm text-text-secondary">سالم الدوسري</span>
          <span className="hidden bg-accent-100 px-2.5 py-1 text-micro text-accent-700 md:inline-flex">
            الشفت الصباحي
          </span>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-3">
          <span className="flex h-9 items-center gap-2 bg-success-bg px-3 text-caption font-medium text-success">
            <CloudCheck className="h-4 w-4" />
            متصل
          </span>
          <span className="num text-body-sm font-medium text-text-secondary">14:32</span>
          <Link
            to="/admin/shifts"
            className={`flex h-11 items-center gap-2 border border-border-subtle bg-bg-overlay px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-bg-base ${focusRing}`}
          >
            <LogOut className="h-4 w-4" />
            إنهاء الشفت
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* منطقة الأصناف — يمين الشاشة */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 p-4 pb-0">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                ref={searchRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم أو امسح الباركود…"
                className="h-12 w-full border border-border-subtle bg-bg-overlay ps-11 pe-4 text-body text-text-primary placeholder:text-text-muted focus:border-ring focus:outline-none"
              />
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex h-11 shrink-0 items-center gap-2 px-4 text-body-sm font-medium transition-colors ${focusRing} ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-border-subtle bg-bg-overlay text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-4 lg:overflow-y-auto xl:grid-cols-5">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                disabled={product.out}
                className={`flex min-h-[104px] flex-col justify-between border border-border-subtle p-3 text-start transition-colors ${focusRing} ${
                  product.out
                    ? "cursor-not-allowed bg-bg-subtle opacity-60"
                    : "bg-bg-overlay hover:border-text-muted active:bg-bg-subtle"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-body-sm font-medium leading-snug text-text-primary">
                    {product.name}
                  </span>
                  {product.out ? (
                    <span className="shrink-0 bg-error-bg px-2 py-0.5 text-caption font-medium text-error">
                      نفد
                    </span>
                  ) : (
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotByCategory[product.category]}`}
                    />
                  )}
                </span>
                <span className="text-body-sm text-text-secondary">
                  <span className="num font-semibold text-text-primary">
                    {formatSar(product.price)}
                  </span>{" "}
                  ر.س
                </span>
              </button>
            ))}
          </div>
        </main>

        {/* السلة — يسار الشاشة (نهاية الاتجاه)، عرض 420px على الديسكتوب */}
        <aside className="flex w-full shrink-0 flex-col border-t border-border-subtle bg-bg-subtle lg:w-[420px] lg:border-s lg:border-t-0">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
            <h1 className="text-h3 font-semibold">الطلب الحالي</h1>
            <div className="flex items-center gap-2">
              <button
                aria-label="إضافة عميل"
                className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
              >
                <UserRoundPlus className="h-5 w-5" />
              </button>
              <button
                onClick={holdCurrentOrder}
                disabled={cart.length === 0}
                className={`flex h-11 items-center gap-2 border border-border-subtle bg-bg-overlay px-3 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                <CirclePause className="h-4 w-4" />
                تعليق الطلب
              </button>
              <Link
                to="/pos/held"
                aria-label="استرجاع طلب معلّق"
                className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
              >
                <RotateCcw className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="px-4 py-10 text-center text-body-sm text-text-muted">
                السلة فارغة — أضف صنفًا من القائمة لبدء الطلب.
              </p>
            ) : (
              cart.map((line) => (
                <div
                  key={line.id}
                  data-testid={`cart-line-${line.id}`}
                  className="border-b border-border-subtle px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-sm font-medium text-text-primary">{line.name}</p>
                    <button
                      aria-label={`خصم على ${line.name}`}
                      className={`flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary ${focusRing}`}
                    >
                      <Percent className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="إنقاص الكمية"
                        onClick={() => storeChangeQty(line.id, -1)}
                        className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-overlay text-text-primary transition-colors hover:bg-bg-base ${focusRing}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="num w-10 text-center text-body font-semibold">
                        {line.qty}
                      </span>
                      <button
                        aria-label="زيادة الكمية"
                        onClick={() => storeChangeQty(line.id, 1)}
                        className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-overlay text-text-primary transition-colors hover:bg-bg-base ${focusRing}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-body-sm text-text-secondary">
                      <span className="num font-semibold text-text-primary">
                        {formatSar(line.price * line.qty)}
                      </span>{" "}
                      ر.س
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-border-subtle bg-bg-subtle px-4 py-3">
            <dl className="space-y-1 text-body-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">المجموع الفرعي</dt>
                <dd className="num text-text-primary">{formatSar(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">الخصم</dt>
                <dd className="num text-text-primary">{formatSar(discount)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">الضريبة (15%)</dt>
                <dd className="num text-text-primary">{formatSar(vat)}</dd>
              </div>
            </dl>
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
              <span className="text-h3 font-semibold">الإجمالي</span>
              <span className="text-price-total font-bold">
                {formatSar(total)}
                <span className="ms-2 font-sans text-body-sm font-normal text-text-secondary">
                  ر.س
                </span>
              </span>
            </div>
            {cart.length === 0 ? (
              <button
                disabled
                className={`mt-3 flex h-14 w-full cursor-not-allowed items-center justify-center bg-primary text-h3 font-semibold text-primary-foreground opacity-50 ${focusRing}`}
              >
                الدفع — <span className="num mx-1">{formatSar(0)}</span> ر.س
              </button>
            ) : (
              <Link
                to="/pos/payment"
                className={`mt-3 flex h-14 w-full items-center justify-center bg-primary text-h3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
              >
                الدفع — <span className="num mx-1">{formatSar(total)}</span> ر.س
              </Link>
            )}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                className={`flex h-11 items-center justify-center gap-1.5 border border-border-subtle bg-bg-overlay text-caption font-medium text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
              >
                <Percent className="h-4 w-4" />
                خصم على الفاتورة
              </button>
              <button
                className={`flex h-11 items-center justify-center gap-1.5 border border-border-subtle bg-bg-overlay text-caption font-medium text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
              >
                <StickyNote className="h-4 w-4" />
                ملاحظة
              </button>
              <button
                className={`flex h-11 items-center justify-center gap-1.5 border border-border-subtle bg-bg-overlay text-caption font-medium text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
              >
                <Coffee className="h-4 w-4" />
                إيقاف مؤقت
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
