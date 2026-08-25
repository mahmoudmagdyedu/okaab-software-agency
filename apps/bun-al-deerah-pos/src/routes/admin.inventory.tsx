import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, ClipboardCheck, History, TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
  branchById,
  productById,
  recipes,
  stockItems,
  stockMoves,
  stocktakeRows,
  transfers,
  type StockItem,
} from "../lib/data";
import { formatDate, formatSar } from "../lib/format";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "المخزون — فوترة" },
      {
        name: "description",
        content:
          "أرصدة فرعَي بُنّ الديرة، حركات المخزون، التحويلات بين الفروع، الجرد، ووصفات الأصناف.",
      },
      { property: "og:title", content: "المخزون — فوترة" },
      { property: "og:description", content: "إدارة مخزون مقهى بُنّ الديرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

type Tab = "stock" | "moves" | "transfer" | "stocktake" | "recipes";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "stock", label: "الأرصدة" },
  { id: "moves", label: "الحركات" },
  { id: "transfer", label: "التحويلات" },
  { id: "stocktake", label: "الجرد" },
  { id: "recipes", label: "الوصفات" },
];

const itemById = (id: string): StockItem => stockItems.find((s) => s.id === id)!;

function InventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const lowStock = stockItems.filter((s) => Object.values(s.stock).some((v) => v < s.reorderLevel));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h1 font-bold text-text-primary">المخزون</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          {lowStock.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-warning">
              <TriangleAlert className="h-4 w-4" />
              <span className="num">{lowStock.length}</span> مواد تحت حد الطلب في فرع واحد على الأقل
            </span>
          ) : (
            "كل المواد فوق حد الطلب"
          )}
        </p>
      </div>

      <div className="inline-flex w-fit flex-wrap gap-1 border border-border-subtle bg-bg-base p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-9 px-4 text-body-sm font-medium transition-colors ${focusRing} ${
              tab === t.id ? "bg-ink text-ink-foreground" : "text-text-secondary hover:bg-bg-subtle"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stock" ? (
        <div className="overflow-hidden border border-border-subtle bg-bg-base">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                <th className="px-4 py-2.5 text-start font-semibold">المادة</th>
                <th className="px-4 py-2.5 text-end font-semibold">النرجس</th>
                <th className="px-4 py-2.5 text-end font-semibold">الروضة</th>
                <th className="px-4 py-2.5 text-end font-semibold">حد الطلب</th>
                <th className="px-4 py-2.5 text-start font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stockItems.map((s) => {
                const low =
                  s.stock["narjes"]! < s.reorderLevel || s.stock["rawdah"]! < s.reorderLevel;
                const narjesRatio = Math.min(1, s.stock["narjes"]! / (s.reorderLevel * 2 || 1));
                const rawdahRatio = Math.min(1, s.stock["rawdah"]! / (s.reorderLevel * 2 || 1));
                return (
                  <tr key={s.id} className="transition-colors hover:bg-bg-subtle">
                    <td className="px-4 py-2.5 font-medium text-text-primary">
                      {s.name}
                      <span className="ms-1.5 text-caption text-text-muted">({s.unit})</span>
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      <span
                        className={`num ${s.stock["narjes"]! < s.reorderLevel ? "font-semibold text-warning" : "text-text-primary"}`}
                      >
                        {s.stock["narjes"]}
                      </span>
                      <span className="mt-1 block h-1 w-full bg-bg-subtle">
                        <span
                          className={`block h-full ${s.stock["narjes"]! < s.reorderLevel ? "bg-warning" : "bg-ink"}`}
                          style={{ width: `${narjesRatio * 100}%` }}
                        />
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      <span
                        className={`num ${s.stock["rawdah"]! < s.reorderLevel ? "font-semibold text-warning" : "text-text-primary"}`}
                      >
                        {s.stock["rawdah"]}
                      </span>
                      <span className="mt-1 block h-1 w-full bg-bg-subtle">
                        <span
                          className={`block h-full ${s.stock["rawdah"]! < s.reorderLevel ? "bg-warning" : "bg-ink"}`}
                          style={{ width: `${rawdahRatio * 100}%` }}
                        />
                      </span>
                    </td>
                    <td className="num px-4 py-2.5 text-end text-text-muted">{s.reorderLevel}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                        <span
                          className={`h-2 w-2 rounded-full ${low ? "bg-warning" : "bg-success"}`}
                        />
                        {low ? "تحت حد الطلب" : "كافٍ"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "moves" ? (
        <div className="overflow-hidden border border-border-subtle bg-bg-base">
          <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3.5">
            <History className="h-4 w-4 text-text-muted" />
            <h2 className="text-h3 font-semibold text-text-primary">حركات المخزون الأخيرة</h2>
          </div>
          <ul className="divide-y divide-border-subtle">
            {stockMoves.map((m) => {
              const item = itemById(m.itemId);
              const branch = branchById(m.branchId);
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">
                      {item.name} — {m.reason}
                    </p>
                    <p className="text-caption text-text-muted">
                      {branch.city} {branch.name} · {formatDate(m.at)}
                    </p>
                  </div>
                  <span
                    className={`num text-body-sm font-semibold ${
                      m.kind === "in"
                        ? "text-success"
                        : m.kind === "out"
                          ? "text-text-secondary"
                          : "text-error"
                    }`}
                  >
                    {m.kind === "in" ? "+" : m.kind === "adjust" ? "" : "-"}
                    {m.qty} {item.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {tab === "transfer" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              className={`flex h-11 items-center gap-2 bg-primary px-4 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              تحويل جديد بين الفرعين
            </button>
          </div>
          <div className="overflow-hidden border border-border-subtle bg-bg-base">
            <ul className="divide-y divide-border-subtle">
              {transfers.map((t) => {
                const item = itemById(t.itemId);
                return (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-text-primary">
                        {item.name} — <span className="num">{t.qty}</span> {item.unit}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-caption text-text-muted">
                        {branchById(t.fromBranchId).city} {branchById(t.fromBranchId).name}
                        <ArrowLeftRight className="h-3 w-3" />
                        {branchById(t.toBranchId).city} {branchById(t.toBranchId).name} ·{" "}
                        {formatDate(t.at)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                      <span
                        className={`h-2 w-2 rounded-full ${t.status === "in-transit" ? "bg-info" : "bg-success"}`}
                      />
                      {t.status === "in-transit" ? "في الطريق" : "استُلم"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "stocktake" ? (
        <div className="overflow-hidden border border-border-subtle bg-bg-base">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-text-muted" />
              <h2 className="text-h3 font-semibold text-text-primary">جرد فرع النرجس — ٢٣ أغسطس</h2>
            </div>
            <button
              className={`h-10 bg-primary px-4 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
            >
              اعتماد الفروقات
            </button>
          </div>
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                <th className="px-4 py-2.5 text-start font-semibold">المادة</th>
                <th className="px-4 py-2.5 text-end font-semibold">رصيد النظام</th>
                <th className="px-4 py-2.5 text-end font-semibold">المعدود فعليًا</th>
                <th className="px-4 py-2.5 text-end font-semibold">الفرق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stocktakeRows.map((r) => {
                const item = itemById(r.itemId);
                const diff = r.counted - r.system;
                return (
                  <tr key={r.itemId} className="transition-colors hover:bg-bg-subtle">
                    <td className="px-4 py-2.5 font-medium text-text-primary">{item.name}</td>
                    <td className="num px-4 py-2.5 text-end text-text-secondary">
                      {r.system} {item.unit}
                    </td>
                    <td className="num px-4 py-2.5 text-end text-text-primary">
                      {r.counted} {item.unit}
                    </td>
                    <td
                      className={`num px-4 py-2.5 text-end font-semibold ${diff === 0 ? "text-success" : "text-error"}`}
                    >
                      {diff === 0 ? "مطابق" : `${diff} ${item.unit}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "recipes" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {recipes.map((r) => {
            const product = productById(r.productId);
            const cost = r.ingredients.reduce((s, ing) => s + ing.qty * 30, 0);
            return (
              <div key={r.productId} className="border border-border-subtle bg-bg-base p-5">
                <h3 className="text-h3 font-semibold text-text-primary">{product.name}</h3>
                <p className="mt-0.5 text-caption text-text-muted">
                  سعر البيع <span className="num">{formatSar(product.price)}</span> ر.س
                </p>
                <ul className="mt-4 space-y-2">
                  {r.ingredients.map((ing) => {
                    const item = itemById(ing.itemId);
                    return (
                      <li
                        key={ing.itemId}
                        className="flex items-center justify-between text-body-sm"
                      >
                        <span className="text-text-secondary">{item.name}</span>
                        <span className="num text-text-primary">
                          {ing.qty} {item.unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 border-t border-border-subtle pt-3 text-caption text-text-muted">
                  يُخصم من المخزون تلقائيًا عند كل عملية بيع
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
