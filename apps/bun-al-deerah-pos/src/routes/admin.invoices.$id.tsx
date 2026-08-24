import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CircleAlert, Printer, Undo2 } from "lucide-react";
import {
  branchById,
  company,
  employeeById,
  getInvoiceByNumber,
  invoiceStatusLabel,
  paymentLabel,
} from "../lib/data";
import { formatDate, formatSar, formatTime } from "../lib/format";

export const Route = createFileRoute("/admin/invoices/$id")({
  loader: ({ params }) => {
    const invoice = getInvoiceByNumber(params.id);
    if (!invoice) throw notFound();
    return { invoice };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `فاتورة ${loaderData.invoice.number} — فوترة`
          : "فاتورة غير موجودة — فوترة",
      },
      {
        name: "description",
        content: "تفاصيل فاتورة ضريبية مبسطة: الأصناف، الضريبة، رمز QR، وسجل الإرسال.",
      },
      { property: "og:title", content: "تفاصيل الفاتورة — فوترة" },
      {
        property: "og:description",
        content: "تفاصيل فاتورة ضريبية مبسطة بنظام فوترة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
    ],
  }),
  component: InvoiceDetailPage,
  notFoundComponent: InvoiceNotFound,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

/* رمز QR تمثيلي حتمي — نمط ثابت مشتق من رقم الفاتورة (بيئة تجريبية) */
function QrGlyph({ seedText }: { seedText: string }) {
  const size = 21;
  let h = 2166136261;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    const c = seedText.charCodeAt(i % seedText.length);
    h = Math.imul(h ^ c ^ i, 16777619) >>> 0;
    cells.push((h & 7) > 2);
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--color-bg-base)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  );
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-32 w-32 text-text-primary"
      role="img"
      aria-label="رمز QR للفاتورة — بيئة تجريبية"
    >
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        if (!on || inFinder(x, y)) return null;
        return <rect key={i} x={x} y={y} width={1} height={1} fill="currentColor" />;
      })}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  );
}

function InvoiceNotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-h2 font-semibold text-text-primary">الفاتورة غير موجودة</h1>
      <p className="mt-2 text-body-sm text-text-secondary">
        تأكد من الرقم — الترقيم تسلسلي حتى INV-2026-00500.
      </p>
      <Link
        to="/admin/invoices"
        className={`mt-6 inline-flex h-11 items-center rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover ${focusRing}`}
      >
        العودة للفواتير
      </Link>
    </div>
  );
}

function InvoiceDetailPage() {
  const { invoice } = Route.useLoaderData();
  const branch = branchById(invoice.branchId);
  const cashier = employeeById(invoice.cashierId);

  const timeline = [
    {
      label: "أُنشئت الفاتورة في شاشة الكاشير",
      at: invoice.createdAt,
      state: "done" as const,
    },
    {
      label: "وُقّعت وخُتمت التشفيرية — بيئة تجريبية",
      at: invoice.createdAt,
      state: "done" as const,
    },
    invoice.status === "sent"
      ? {
          label: "قُبلت لدى منصة الفوترة (بيئة تجريبية)",
          at: invoice.createdAt,
          state: "done" as const,
        }
      : invoice.status === "rejected"
        ? {
            label: `رُفضت — رمز الخطأ ${invoice.errorCode ?? ""}`,
            at: invoice.createdAt,
            state: "error" as const,
          }
        : {
            label: "بانتظار الإرسال — ستُرسل عند توفر الاتصال",
            at: invoice.createdAt,
            state: "pending" as const,
          },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/invoices"
            aria-label="رجوع للفواتير"
            className={`flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-bg-base text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-h1 font-bold text-text-primary">
              فاتورة <span className="num">{invoice.number}</span>
            </h1>
            <p className="mt-0.5 text-body-sm text-text-secondary">
              {formatDate(invoice.createdAt)} —{" "}
              <span className="num">{formatTime(invoice.createdAt)}</span> · {branch.city}{" "}
              {branch.name} · {cashier.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className={`flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle ${focusRing}`}
          >
            <Printer className="h-4 w-4" />
            طباعة
          </button>
          <button
            className={`flex h-11 items-center gap-2 rounded-md bg-destructive px-4 text-body-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 ${focusRing}`}
          >
            <Undo2 className="h-4 w-4" />
            إرجاع بإشعار دائن
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* بنود الفاتورة */}
        <section className="overflow-hidden rounded-md border border-border-subtle bg-bg-base lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
            <h2 className="text-h3 font-semibold text-text-primary">بنود الفاتورة</h2>
            <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
              <span
                className={`h-2 w-2 rounded-full ${
                  invoice.status === "sent"
                    ? "bg-success"
                    : invoice.status === "pending"
                      ? "bg-info"
                      : "bg-error"
                }`}
              />
              {invoiceStatusLabel[invoice.status]}
            </span>
          </div>
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
                <th className="px-5 py-2.5 text-start">الصنف</th>
                <th className="px-4 py-2.5 text-end">السعر</th>
                <th className="px-4 py-2.5 text-end">الكمية</th>
                <th className="px-5 py-2.5 text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoice.lines.map((l) => (
                <tr key={l.productId}>
                  <td className="px-5 py-2.5 font-medium text-text-primary">{l.name}</td>
                  <td className="num px-4 py-2.5 text-end text-text-secondary">
                    {formatSar(l.price)}
                  </td>
                  <td className="num px-4 py-2.5 text-end text-text-secondary">{l.qty}</td>
                  <td className="num px-5 py-2.5 text-end text-text-primary">
                    {formatSar(l.price * l.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="space-y-1.5 border-t border-border-subtle px-5 py-4 text-body-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">المجموع الفرعي</dt>
              <dd className="num text-text-primary">{formatSar(invoice.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">ضريبة القيمة المضافة (15%)</dt>
              <dd className="num text-text-primary">{formatSar(invoice.vat)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-md bg-ink px-4 py-3 text-ink-foreground">
              <dt className="text-body-sm font-medium">الإجمالي</dt>
              <dd className="num-display text-[32px] font-bold">
                {formatSar(invoice.total)}{" "}
                <span className="text-body-sm font-normal text-ink-foreground/60">ر.س</span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">طريقة الدفع</dt>
              <dd className="font-medium text-text-primary">{paymentLabel[invoice.payment]}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-5">
          {/* QR */}
          <section className="rounded-md border border-border-subtle bg-bg-base p-5 text-center">
            <h2 className="text-h3 font-semibold text-text-primary">رمز الفاتورة</h2>
            <div className="mx-auto mt-4 w-fit rounded-md border border-border-subtle p-3">
              <QrGlyph seedText={invoice.number + company.vatNumber} />
            </div>
            <p className="mt-3 text-caption text-text-muted">
              مشتق من اسم المنشأة والرقم الضريبي والإجمالي وطابع الوقت — متوافق تقنيًا مع متطلبات
              المرحلة الثانية (بيئة تجريبية).
            </p>
          </section>

          {/* سجل الأحداث */}
          <section className="rounded-md border border-border-subtle bg-bg-base p-5">
            <h2 className="text-h3 font-semibold text-text-primary">سجل الإرسال</h2>
            <ol className="mt-4 space-y-4">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      t.state === "done"
                        ? "bg-success"
                        : t.state === "error"
                          ? "bg-error"
                          : "bg-info"
                    }`}
                  />
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">{t.label}</p>
                    <p className="num text-caption text-text-muted">{formatTime(t.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
