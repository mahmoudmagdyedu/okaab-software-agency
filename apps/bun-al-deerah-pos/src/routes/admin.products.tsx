import { createFileRoute } from "@tanstack/react-router";
import { PackageOpen, Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/DataStates";
import { categories, categoryLabel, dotByCategory, products, type Product } from "../lib/data";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "الأصناف — فوترة" },
      {
        name: "description",
        content: "إدارة أصناف مقهى بُنّ الديرة الثمانين: الأسعار والفئات والباركود وحالة التوفر.",
      },
      { property: "og:title", content: "الأصناف — فوترة" },
      { property: "og:description", content: "إدارة أصناف مقهى بُنّ الديرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [outIds, setOutIds] = useState<Set<number>>(
    () => new Set(products.filter((p) => p.out).map((p) => p.id)),
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (query.trim() === "" ||
            p.name.includes(query.trim()) ||
            p.barcode.includes(query.trim())),
      ),
    [query, category],
  );

  const toggleOut = (id: number) =>
    setOutIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">الأصناف</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            <span className="num font-semibold text-text-primary">80</span> صنفًا في خمس فئات —
            التعديل يصل شاشة الكاشير فورًا.
          </p>
        </div>
        <button
          className={`flex h-11 items-center gap-2 bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
        >
          <Plus className="h-4 w-4" />
          صنف جديد
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود…"
            className="h-11 w-full border border-border-subtle bg-bg-base ps-9 pe-3 text-body-sm text-text-primary placeholder:text-text-muted focus:border-ring focus:outline-none"
          />
        </div>
        <select
          aria-label="الفئة"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`h-11 border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary ${focusRing}`}
        >
          <option value="all">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title="لا أصناف مطابقة"
          body="جرّب اسمًا آخر أو امسح الباركود كاملًا."
        />
      ) : (
        <div className="overflow-hidden border border-border-subtle bg-bg-base">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                <th className="px-4 py-2.5 text-start font-semibold">الصنف</th>
                <th className="px-4 py-2.5 text-start font-semibold">الفئة</th>
                <th className="px-4 py-2.5 text-start font-semibold">الباركود</th>
                <th className="px-4 py-2.5 text-end font-semibold">السعر</th>
                <th className="px-4 py-2.5 text-start font-semibold">التوفر</th>
                <th className="px-4 py-2.5 text-end font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.slice(0, 30).map((p) => {
                const isOut = outIds.has(p.id);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-bg-subtle">
                    <td className="px-4 py-2.5 font-medium text-text-primary">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-text-secondary">
                        <span className={`h-2 w-2 rounded-full ${dotByCategory[p.category]}`} />
                        {categoryLabel(p.category)}
                      </span>
                    </td>
                    <td className="num px-4 py-2.5 text-text-muted">{p.barcode}</td>
                    <td className="num px-4 py-2.5 text-end font-medium text-text-primary">
                      {formatSar(p.price)}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => toggleOut(p.id)}
                        className={`inline-flex items-center gap-1.5 text-body-sm text-text-secondary ${focusRing}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${isOut ? "bg-error" : "bg-success"}`}
                        />
                        {isOut ? "نفد" : "متوفر"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      <button
                        aria-label={`تعديل ${p.name}`}
                        onClick={() => setEditing(p)}
                        className={`inline-flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary ${focusRing}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 30 ? (
            <p className="border-t border-border-subtle px-4 py-2.5 text-center text-caption text-text-muted">
              يُعرض أول <span className="num">30</span> من{" "}
              <span className="num">{filtered.length}</span> — ضيّق البحث للوصول لبقية الأصناف
            </p>
          ) : null}
        </div>
      )}

      {/* درج التعديل */}
      {editing ? (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto border-e border-border-subtle bg-bg-base p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 font-semibold text-text-primary">تعديل الصنف</h2>
              <button
                aria-label="إغلاق"
                onClick={() => setEditing(null)}
                className={`flex h-10 w-10 items-center justify-center text-text-secondary hover:bg-bg-subtle hover:text-text-primary ${focusRing}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="p-name"
                  className="mb-1.5 block text-body-sm font-medium text-text-primary"
                >
                  الاسم
                </label>
                <input
                  id="p-name"
                  defaultValue={editing.name}
                  className="h-11 w-full border border-border-subtle bg-bg-base px-3 text-body text-text-primary focus:border-ring focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="p-price"
                    className="mb-1.5 block text-body-sm font-medium text-text-primary"
                  >
                    السعر (ر.س)
                  </label>
                  <input
                    id="p-price"
                    defaultValue={formatSar(editing.price)}
                    className="num h-11 w-full border border-border-subtle bg-bg-base px-3 text-body text-text-primary focus:border-ring focus:outline-none"
                  />
                  <p className="mt-1.5 text-caption text-text-muted">شامل ضريبة 15%</p>
                </div>
                <div>
                  <label
                    htmlFor="p-cat"
                    className="mb-1.5 block text-body-sm font-medium text-text-primary"
                  >
                    الفئة
                  </label>
                  <select
                    id="p-cat"
                    defaultValue={editing.category}
                    className={`h-11 w-full border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary ${focusRing}`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="p-barcode"
                  className="mb-1.5 block text-body-sm font-medium text-text-primary"
                >
                  الباركود
                </label>
                <input
                  id="p-barcode"
                  defaultValue={editing.barcode}
                  className="num h-11 w-full border border-border-subtle bg-bg-base px-3 text-body text-text-primary focus:border-ring focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between border border-border-subtle bg-bg-subtle px-4 py-3">
                <div>
                  <p className="text-body-sm font-medium text-text-primary">متاح للبيع</p>
                  <p className="text-caption text-text-muted">إيقافه يظهر «نفد» في الكاشير</p>
                </div>
                <button
                  onClick={() => toggleOut(editing.id)}
                  className={`inline-flex items-center gap-1.5 text-body-sm font-medium text-text-secondary ${focusRing}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${outIds.has(editing.id) ? "bg-error" : "bg-success"}`}
                  />
                  {outIds.has(editing.id) ? "نفد" : "متوفر"}
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className={`h-11 flex-1 bg-primary text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => setEditing(null)}
                className={`h-11 flex-1 border border-border-subtle bg-bg-base text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
