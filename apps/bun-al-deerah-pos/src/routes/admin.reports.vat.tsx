import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Landmark } from "lucide-react";
import { useMemo } from "react";
import { branchById, company, getInvoices } from "../lib/data";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/admin/reports/vat")({
  head: () => ({
    meta: [
      { title: "تقرير ضريبة القيمة المضافة — فوترة" },
      {
        name: "description",
        content:
          "تقرير ضريبة القيمة المضافة ١٥٪ للفترة: مبيعات خاضعة ومعفاة وضريبة مستحقة، مع تصدير CSV.",
      },
      { property: "og:title", content: "تقرير ضريبة القيمة المضافة — فوترة" },
      { property: "og:description", content: "تقرير الضريبة للفترة — فوترة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VatReport,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function VatReport() {
  const data = useMemo(() => {
    const invoices = getInvoices();
    const anchor = Date.parse("2026-08-23T21:00:00Z");
    const month = 30 * 24 * 60 * 60 * 1000;
    const period = invoices.filter((i) => anchor - Date.parse(i.createdAt) < month);

    const taxable = period.reduce((s, i) => s + i.subtotal, 0);
    const vat = period.reduce((s, i) => s + i.vat, 0);

    const byBranch = new Map<string, { taxable: number; vat: number; count: number }>();
    for (const inv of period) {
      const row = byBranch.get(inv.branchId) ?? { taxable: 0, vat: 0, count: 0 };
      row.taxable += inv.subtotal;
      row.vat += inv.vat;
      row.count += 1;
      byBranch.set(inv.branchId, row);
    }

    return {
      taxable,
      vat,
      count: period.length,
      branches: [...byBranch.entries()].map(([id, v]) => ({
        branch: branchById(id),
        ...v,
      })),
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            aria-label="رجوع للتقارير"
            className={`flex h-10 w-10 items-center justify-center border border-border-subtle bg-bg-base text-text-secondary hover:text-text-primary ${focusRing}`}
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-h1 font-bold text-text-primary">تقرير ضريبة القيمة المضافة</h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              الفترة: ٢٥ يوليو — ٢٣ أغسطس ٢٠٢٦ · {company.legalName} · رقم ضريبي{" "}
              <span className="num">{company.vatNumber}</span>
            </p>
          </div>
        </div>
        <button
          className={`flex h-11 items-center gap-2 border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle ${focusRing}`}
        >
          <Download className="h-4 w-4" />
          تصدير CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "مبيعات خاضعة للضريبة",
            value: formatSar(data.taxable),
            note: `${data.count} فاتورة في الفترة`,
          },
          { label: "مبيعات معفاة", value: formatSar(0), note: "لا أصناف معفاة في الكتالوج" },
          {
            label: "الضريبة المستحقة (15%)",
            value: formatSar(data.vat),
            note: "تُسدَّد مع الإقرار الدوري",
          },
        ].map((c) => (
          <div key={c.label} className="bg-ink p-5 text-ink-foreground">
            <p className="flex items-center gap-1.5 text-caption text-ink-foreground/70">
              <Landmark className="h-3.5 w-3.5" />
              {c.label}
            </p>
            <p className="num-display mt-2 text-[40px] text-ink-foreground">{c.value}</p>
            <p className="mt-1 text-caption text-ink-foreground/70">{c.note}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden border border-border-subtle bg-bg-base">
        <div className="border-b border-border-subtle px-5 py-3.5">
          <h2 className="text-h3 font-semibold text-text-primary">التوزيع على الفروع</h2>
        </div>
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
              <th className="px-5 py-2.5 text-start font-semibold">الفرع</th>
              <th className="px-4 py-2.5 text-end font-semibold">الفواتير</th>
              <th className="px-4 py-2.5 text-end font-semibold">الخاضع للضريبة</th>
              <th className="px-5 py-2.5 text-end font-semibold">الضريبة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.branches.map((b) => (
              <tr key={b.branch.id} className="transition-colors hover:bg-bg-subtle">
                <td className="px-5 py-2.5 font-medium text-text-primary">
                  {b.branch.city} — {b.branch.name}
                </td>
                <td className="num px-4 py-2.5 text-end text-text-secondary">{b.count}</td>
                <td className="num px-4 py-2.5 text-end text-text-primary">
                  {formatSar(b.taxable)}
                </td>
                <td className="num px-5 py-2.5 text-end font-medium text-text-primary">
                  {formatSar(b.vat)}
                </td>
              </tr>
            ))}
            <tr className="bg-bg-subtle font-semibold">
              <td className="px-5 py-2.5 text-text-primary">الإجمالي</td>
              <td className="num px-4 py-2.5 text-end text-text-primary">{data.count}</td>
              <td className="num px-4 py-2.5 text-end text-text-primary">
                {formatSar(data.taxable)}
              </td>
              <td className="num px-5 py-2.5 text-end text-accent-700">{formatSar(data.vat)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <p className="bg-info-bg px-4 py-3 text-body-sm text-info">
        الأرقام محسوبة من سجل الفواتير الفعلي للفترة وتُرحَّل للإقرار بصيغته الرسمية — بيئة تجريبية.
      </p>
    </div>
  );
}
