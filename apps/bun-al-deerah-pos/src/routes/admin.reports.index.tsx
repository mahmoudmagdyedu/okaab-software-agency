import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpLeft,
  BadgeDollarSign,
  Landmark,
  ReceiptText,
  Repeat2,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  branchById,
  employeeById,
  getInvoices,
  paymentLabel,
  type PaymentMethod,
} from "../lib/data";
import { formatInt, formatSar } from "../lib/format";

export const Route = createFileRoute("/admin/reports/")({
  head: () => ({
    meta: [
      { title: "نظرة عامة — بُنّ الديرة" },
      {
        name: "description",
        content: "لوحة تشغيل بُنّ الديرة: المبيعات والفواتير والأصناف والفروع.",
      },
      { property: "og:title", content: "بُنّ الديرة — لوحة العمليات" },
      { property: "og:description", content: "نظرة موحدة على مبيعات وتشغيل فروع بُنّ الديرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsOverview,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const dayLabels = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

function ReportsOverview() {
  const stats = useMemo(() => {
    const invoices = getInvoices();
    const anchor = Date.parse("2026-08-23T21:00:00Z");
    const day = 24 * 60 * 60 * 1000;
    const today = invoices.filter((invoice) => anchor - Date.parse(invoice.createdAt) < day);
    const week = invoices.filter((invoice) => anchor - Date.parse(invoice.createdAt) < 7 * day);
    const sum = (list: typeof invoices) =>
      list.reduce((total, invoice) => total + invoice.total, 0);

    const dailySales = dayLabels.map((label, index) => {
      const start = anchor - (6 - index + 1) * day;
      const end = start + day;
      const total = invoices
        .filter((invoice) => {
          const time = Date.parse(invoice.createdAt);
          return time >= start && time < end;
        })
        .reduce((value, invoice) => value + invoice.total, 0);
      return { label, total: Math.round(total) };
    });

    const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const invoice of week) {
      for (const line of invoice.lines) {
        const row = byProduct.get(line.name) ?? { name: line.name, qty: 0, revenue: 0 };
        row.qty += line.qty;
        row.revenue += line.price * line.qty;
        byProduct.set(line.name, row);
      }
    }
    const topProducts = [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
    const maxQty = topProducts[0]?.qty ?? 1;

    const byBranch = new Map<string, number>();
    for (const invoice of week) {
      byBranch.set(invoice.branchId, (byBranch.get(invoice.branchId) ?? 0) + invoice.total);
    }
    const branchRows = [...byBranch.entries()].map(([id, total]) => ({
      branch: branchById(id),
      total,
    }));
    const maxBranch = Math.max(...branchRows.map((branch) => branch.total), 1);

    const byEmployee = new Map<string, { total: number; count: number }>();
    for (const invoice of week) {
      const row = byEmployee.get(invoice.cashierId) ?? { total: 0, count: 0 };
      row.total += invoice.total;
      row.count += 1;
      byEmployee.set(invoice.cashierId, row);
    }
    const employeeRows = [...byEmployee.entries()].map(([id, values]) => ({
      employee: employeeById(id),
      ...values,
    }));

    const byPayment = new Map<PaymentMethod, number>();
    for (const invoice of today) {
      byPayment.set(invoice.payment, (byPayment.get(invoice.payment) ?? 0) + invoice.total);
    }

    return {
      todayTotal: sum(today),
      todayCount: today.length,
      weekTotal: sum(week),
      weekCount: week.length,
      weekVat: week.reduce((total, invoice) => total + invoice.vat, 0),
      dailySales,
      topProducts,
      maxQty,
      branchRows,
      maxBranch,
      employeeRows,
      byPayment,
    };
  }, []);

  const kpis = [
    {
      label: "صافي مبيعات اليوم",
      value: `${formatSar(stats.todayTotal)} ر.س`,
      note: "مقارنة بـ 9,840 ر.س أمس",
      change: "12.4%",
      icon: <BadgeDollarSign className="h-4 w-4" />,
    },
    {
      label: "الفواتير",
      value: formatInt(stats.todayCount),
      note: `من ${formatInt(stats.weekCount)} هذا الأسبوع`,
      change: "8.1%",
      icon: <ReceiptText className="h-4 w-4" />,
    },
    {
      label: "مبيعات 7 أيام",
      value: `${formatSar(stats.weekTotal)} ر.س`,
      note: "الفرعان يحققان نموًا ثابتًا",
      change: "6.7%",
      icon: <Repeat2 className="h-4 w-4" />,
    },
    {
      label: "الضريبة المحصّلة",
      value: `${formatSar(stats.weekVat)} ر.س`,
      note: "محسوبة من الفواتير المكتملة",
      change: "2.3%",
      icon: <Landmark className="h-4 w-4" />,
    },
  ];

  const paymentEntries = [...stats.byPayment.entries()];
  const maxPayment = Math.max(...paymentEntries.map(([, value]) => value), 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-text-muted">
            الأحد، 23 أغسطس 2026
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight text-text-primary">
            صباح الخير، نورة
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            هذه صورة حيّة لأداء فروع بُنّ الديرة اليوم.
          </p>
        </div>
        <Link
          to="/admin/reports/vat"
          className={`flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
        >
          تقرير الضريبة
          <ArrowUpLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <section
            key={item.label}
            className="rounded-lg border border-border-subtle bg-bg-base p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ink-foreground">
                {item.icon}
              </span>
              <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-semibold text-success">
                ↗ {item.change}
              </span>
            </div>
            <p className="num-display mt-5 text-[28px] font-medium leading-none text-text-primary">
              {item.value}
            </p>
            <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] text-text-secondary">
              {item.label}
            </p>
            <p className="mt-1 text-caption text-text-muted">{item.note}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)]">
        <section className="rounded-lg border border-border-subtle bg-bg-base p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-h2 font-semibold text-text-primary">إيقاع المبيعات</h2>
              <p className="mt-1 text-caption text-text-muted">
                إجمالي المبيعات اليومية عبر الفرعين
              </p>
            </div>
            <div className="flex rounded-full bg-bg-subtle p-1 text-caption">
              <span className="rounded-full bg-ink px-3 py-1 text-ink-foreground">7 أيام</span>
              <span className="px-3 py-1 text-text-muted">30 يومًا</span>
              <span className="px-3 py-1 text-text-muted">90 يومًا</span>
            </div>
          </div>
          <div className="mt-5 h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.dailySales}
                margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3e745d" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#3e745d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ded5c3" strokeDasharray="2 5" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#91a099", fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#91a099", fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => [`${formatSar(Number(value))} ر.س`, "المبيعات"]}
                  contentStyle={{
                    border: "1px solid #ded5c3",
                    borderRadius: 8,
                    background: "#fffdf8",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#245c4b"
                  strokeWidth={2.5}
                  fill="url(#salesFill)"
                  activeDot={{ r: 4, fill: "#d3a73f", stroke: "#123e32" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg bg-ink p-6 text-ink-foreground">
          <h2 className="text-h2 font-semibold">المبيعات حسب الدفع</h2>
          <p className="mt-1 text-caption text-[#91aa9e]">منذ بداية اليوم</p>
          <div className="mt-8 flex h-36 items-end justify-around gap-5 border-b border-white/10 px-2">
            {paymentEntries.map(([method, value], index) => (
              <div key={method} className="flex h-full flex-1 items-end justify-center">
                <div
                  className={
                    index === 0
                      ? "w-full max-w-10 rounded-t-sm bg-[#d3a73f]"
                      : "w-full max-w-10 rounded-t-sm bg-[#7ca08c]"
                  }
                  style={{ height: `${Math.max(22, (value / maxPayment) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {paymentEntries.map(([method, value], index) => (
              <li key={method} className="flex items-center justify-between gap-3 text-body-sm">
                <span className="flex items-center gap-2 text-[#c5d3cc]">
                  <span
                    className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#d3a73f]" : "bg-[#7ca08c]"}`}
                  />
                  {paymentLabel[method]}
                </span>
                <span className="num font-semibold">{formatSar(value)} ر.س</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border-subtle bg-bg-base p-5">
          <h2 className="flex items-center gap-2 text-h3 font-semibold text-text-primary">
            <TrendingUp className="h-4 w-4 text-accent-600" />
            الأصناف الأكثر طلبًا
          </h2>
          <ul className="mt-4 divide-y divide-border-subtle">
            {stats.topProducts.map((product, index) => (
              <li key={product.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3 text-body-sm">
                  <span className="flex items-center gap-2.5 font-medium text-text-primary">
                    <span className="num text-caption text-text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {product.name}
                  </span>
                  <span className="text-text-secondary">
                    <span className="num font-semibold text-text-primary">
                      {formatInt(product.qty)}
                    </span>{" "}
                    قطعة
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-bg-subtle">
                  <div
                    className="h-full rounded-full bg-hero"
                    style={{ width: `${(product.qty / stats.maxQty) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border-subtle bg-bg-base p-5">
          <h2 className="text-h3 font-semibold text-text-primary">مقارنة الفروع — آخر 7 أيام</h2>
          <ul className="mt-5 space-y-5">
            {stats.branchRows.map((row) => (
              <li key={row.branch.id}>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-medium text-text-primary">
                    {row.branch.city} — {row.branch.name}
                  </span>
                  <span className="num font-semibold text-text-primary">
                    {formatSar(row.total)} ر.س
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-bg-subtle">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${(row.total / stats.maxBranch) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-border-subtle bg-bg-base">
        <div className="border-b border-border-subtle px-5 py-4">
          <h2 className="text-h3 font-semibold text-text-primary">أداء الفريق — آخر 7 أيام</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] tracking-[0.12em] text-text-muted">
                <th className="px-5 py-3 text-start font-semibold">الموظف</th>
                <th className="px-4 py-3 text-start font-semibold">الدور</th>
                <th className="px-4 py-3 text-start font-semibold">الفرع</th>
                <th className="px-4 py-3 text-end font-semibold">الفواتير</th>
                <th className="px-5 py-3 text-end font-semibold">المبيعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stats.employeeRows
                .sort((a, b) => b.total - a.total)
                .map((row) => (
                  <tr key={row.employee.id} className="hover:bg-bg-subtle/70">
                    <td className="px-5 py-3 font-medium text-text-primary">{row.employee.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.employee.role}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {row.employee.branchId ? branchById(row.employee.branchId).city : "—"}
                    </td>
                    <td className="num px-4 py-3 text-end text-text-secondary">
                      {formatInt(row.count)}
                    </td>
                    <td className="num px-5 py-3 text-end font-medium text-text-primary">
                      {formatSar(row.total)} ر.س
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
