import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/DataStates";
import {
  branches,
  branchById,
  employeeById,
  getInvoices,
  invoiceStatusLabel,
  paymentLabel,
  type InvoiceStatus,
  type PaymentMethod,
} from "../lib/data";
import { formatDate, formatSar, formatTime } from "../lib/format";

export const Route = createFileRoute("/admin/invoices/")({
  head: () => ({
    meta: [
      { title: "الفواتير — فوترة" },
      {
        name: "description",
        content: "سجل فواتير مقهى بُنّ الديرة الخمسمئة: بحث وفلاتر بالفرع والحالة وقناة الدفع.",
      },
      { property: "og:title", content: "الفواتير — فوترة" },
      {
        property: "og:description",
        content: "سجل فواتير مقهى بُنّ الديرة مع بحث وفلاتر.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvoicesPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const PAGE_SIZE = 15;

const statusDot: Record<InvoiceStatus, string> = {
  sent: "bg-success",
  pending: "bg-info",
  rejected: "bg-error",
};

function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [payment, setPayment] = useState<"all" | PaymentMethod>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim();
    return getInvoices().filter(
      (inv) =>
        (branch === "all" || inv.branchId === branch) &&
        (status === "all" || inv.status === status) &&
        (payment === "all" || inv.payment === payment) &&
        (q === "" || inv.number.includes(q) || employeeById(inv.cashierId).name.includes(q)),
    );
  }, [query, branch, status, payment]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const reset = () => setPage(0);

  const selectCls = `h-11 rounded-md border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary ${focusRing}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-h1 font-bold text-text-primary">الفواتير</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          <span className="num font-semibold text-text-primary">{filtered.length}</span> فاتورة
          مطابقة — من أصل 500 مرقّمة تسلسليًا.
        </p>
      </div>

      {/* الفلاتر */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
            placeholder="ابحث برقم الفاتورة أو اسم الكاشير…"
            className={`h-11 w-full rounded-md border border-border-subtle bg-bg-base ps-9 pe-3 text-body-sm text-text-primary placeholder:text-text-muted focus:border-ring focus:outline-none`}
          />
        </div>
        <select
          aria-label="الفرع"
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            reset();
          }}
          className={selectCls}
        >
          <option value="all">كل الفروع</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.city} — {b.name}
            </option>
          ))}
        </select>
        <select
          aria-label="حالة الفوترة"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "all" | InvoiceStatus);
            reset();
          }}
          className={selectCls}
        >
          <option value="all">كل الحالات</option>
          <option value="sent">مُرسلة</option>
          <option value="pending">معلّقة</option>
          <option value="rejected">مرفوضة</option>
        </select>
        <select
          aria-label="قناة الدفع"
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value as "all" | PaymentMethod);
            reset();
          }}
          className={selectCls}
        >
          <option value="all">كل قنوات الدفع</option>
          <option value="cash">نقدي</option>
          <option value="card">شبكة</option>
          <option value="wallet">محفظة</option>
        </select>
      </div>

      {/* الجدول */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="لا نتائج مطابقة"
          body="جرّب توسيع الفلاتر أو البحث برقم فاتورة كامل مثل INV-2026-00418."
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-border-subtle bg-bg-base">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                <th className="px-4 py-2.5 text-start">الرقم</th>
                <th className="px-4 py-2.5 text-start">التاريخ</th>
                <th className="px-4 py-2.5 text-start">الفرع</th>
                <th className="px-4 py-2.5 text-start">الكاشير</th>
                <th className="px-4 py-2.5 text-start">الدفع</th>
                <th className="px-4 py-2.5 text-start">الحالة</th>
                <th className="px-4 py-2.5 text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-bg-subtle">
                  <td className="px-4 py-2.5">
                    <Link
                      to="/admin/invoices/$id"
                      params={{ id: inv.number }}
                      className={`num rounded font-medium text-accent-700 hover:underline ${focusRing}`}
                    >
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {formatDate(inv.createdAt)}{" "}
                    <span className="num text-text-muted">{formatTime(inv.createdAt)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {branchById(inv.branchId).city}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {employeeById(inv.cashierId).name}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{paymentLabel[inv.payment]}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                      <span className={`h-2 w-2 rounded-full ${statusDot[inv.status]}`} />
                      {invoiceStatusLabel[inv.status]}
                    </span>
                  </td>
                  <td className="num px-4 py-2.5 text-end font-medium text-text-primary">
                    {formatSar(inv.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ترقيم الصفحات */}
      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between">
          <p className="text-caption text-text-muted">
            صفحة <span className="num">{safePage + 1}</span> من{" "}
            <span className="num">{pageCount}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              aria-label="الصفحة التالية"
              className={`flex h-10 items-center gap-1 rounded-md border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary transition-colors hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              التالية
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="الصفحة السابقة"
              className={`flex h-10 items-center gap-1 rounded-md border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary transition-colors hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              <ChevronRight className="h-4 w-4" />
              السابقة
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
