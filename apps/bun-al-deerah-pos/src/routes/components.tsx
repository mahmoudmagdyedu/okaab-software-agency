import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingBlock } from "../components/DataStates";
import { products } from "../lib/data";
import { formatSar } from "../lib/format";

export const Route = createFileRoute("/components")({
  head: () => ({
    meta: [
      { title: "مكتبة المكونات بحالاتها — فوترة" },
      {
        name: "description",
        content:
          "مكونات نظام تصميم فوترة بكل حالاتها: أزرار، حقول، شارات، جداول، وحالات البيانات الأربع.",
      },
      { property: "og:title", content: "مكتبة المكونات بحالاتها — فوترة" },
      {
        property: "og:description",
        content: "مكونات نظام تصميم فوترة بكل حالاتها.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComponentsPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border-subtle bg-bg-base p-5">
      <h2 className="text-h3 font-semibold text-text-primary">{title}</h2>
      {note ? <p className="mt-1 text-body-sm text-text-secondary">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ComponentsPage() {
  const [qty, setQty] = useState(2);
  const sample = products[0]!;

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="border-b border-border-subtle bg-bg-base">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <h1 className="text-h3 font-semibold text-text-primary">
            components — مكتبة المكونات بحالاتها
          </h1>
          <p className="text-caption text-text-muted">النمط الفاتح — الإدارة</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <Section title="الأزرار" note="default / hover / disabled — حلقة تركيز بتوكن ring">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`h-11 bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
            >
              رئيسي
            </button>
            <button
              className={`h-11 border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle ${focusRing}`}
            >
              ثانوي
            </button>
            <button
              className={`h-11 bg-destructive px-4 text-body-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 ${focusRing}`}
            >
              هدام
            </button>
            <button
              className={`h-11 px-4 text-body-sm font-medium text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary ${focusRing}`}
            >
              شبح
            </button>
            <button
              disabled
              className="h-11 cursor-not-allowed bg-primary px-4 text-body-sm font-medium text-primary-foreground opacity-50"
            >
              معطّل
            </button>
          </div>
        </Section>

        <Section title="الحقول" note="تركيز واضح، خطأ برسالة، ومعطّل">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="f1"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                اسم الصنف
              </label>
              <input
                id="f1"
                defaultValue="لاتيه"
                className="h-11 w-full border border-border-subtle bg-bg-base px-3 text-body text-text-primary focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="f2"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                السعر
              </label>
              <input
                id="f2"
                defaultValue="16.50"
                aria-invalid="true"
                className="num h-11 w-full border border-error bg-bg-base px-3 text-body text-text-primary focus:outline-none"
              />
              <p className="mt-1.5 text-caption text-error">السعر يجب أن يكون أكبر من صفر</p>
            </div>
            <div>
              <label htmlFor="f3" className="mb-1.5 block text-body-sm font-medium text-text-muted">
                الباركود — معطّل
              </label>
              <input
                id="f3"
                disabled
                value="62810000001"
                className="num h-11 w-full cursor-not-allowed border border-border-subtle bg-bg-subtle px-3 text-body text-text-muted"
              />
            </div>
          </div>
        </Section>

        <Section title="الحالات النقطية" note="حالة = نقطة ملونة + نص — لا شارات سمينة">
          <div className="flex flex-wrap gap-4">
            {[
              { label: "مُرسلة", cls: "bg-success" },
              { label: "معلّقة", cls: "bg-info" },
              { label: "تحت حد الطلب", cls: "bg-warning" },
              { label: "مرفوضة", cls: "bg-error" },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary"
              >
                <span className={`h-2 w-2 rounded-full ${b.cls}`} />
                {b.label}
              </span>
            ))}
          </div>
        </Section>

        <Section
          title="فلتر مقطعي (Segmented)"
          note="النشط bg-ink — للاستخدام في التبويبات القصيرة"
        >
          <div className="inline-flex w-fit gap-1 border border-border-subtle bg-bg-base p-1">
            {["اليوم", "الأسبوع", "الشهر"].map((label, i) => (
              <button
                key={label}
                className={`h-9 px-4 text-body-sm font-medium transition-colors ${focusRing} ${
                  i === 0 ? "bg-ink text-ink-foreground" : "text-text-secondary hover:bg-bg-subtle"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="لوحة رقم بارزة" note="bg-ink مع num-display للأرقام الكبيرة">
          <div className="w-56 bg-ink p-5 text-ink-foreground">
            <p className="text-caption text-ink-foreground/70">إجمالي اليوم</p>
            <p className="num-display mt-2 text-[40px] text-ink-foreground">{formatSar(4260)}</p>
          </div>
        </Section>

        <Section title="الستيببر وبطاقة الصنف" note="أهداف لمس 44px كحد أدنى">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex items-center gap-1">
              <button
                aria-label="إنقاص"
                onClick={() => setQty((q) => Math.max(0, q - 1))}
                className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-base text-text-primary transition-colors hover:bg-bg-subtle ${focusRing}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="num w-10 text-center text-body font-semibold text-text-primary">
                {qty}
              </span>
              <button
                aria-label="زيادة"
                onClick={() => setQty((q) => q + 1)}
                className={`flex h-11 w-11 items-center justify-center border border-border-subtle bg-bg-base text-text-primary transition-colors hover:bg-bg-subtle ${focusRing}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="w-44 border border-border-subtle bg-bg-base p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm font-medium text-text-primary">{sample.name}</p>
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-400" />
              </div>
              <p className="mt-4 text-body-sm text-text-secondary">
                <span className="num font-semibold text-text-primary">
                  {formatSar(sample.price)}
                </span>{" "}
                ر.س
              </p>
            </div>

            <div className="w-44 border border-border-subtle bg-bg-subtle p-3 opacity-60">
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm font-medium text-text-primary">فرابتشينو كراميل</p>
                <span className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-error" />
                  نفد
                </span>
              </div>
              <p className="mt-4 text-body-sm text-text-secondary">
                <span className="num font-semibold">{formatSar(19.5)}</span> ر.س
              </p>
            </div>
          </div>
        </Section>

        <Section title="الجدول" note="كثيف بإحساس Stripe — صفوف 44px وحدود خفيفة">
          <div className="overflow-hidden border border-border-subtle">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle text-start text-micro font-semibold text-text-muted">
                  <th className="px-4 py-2.5 text-start font-semibold">الصنف</th>
                  <th className="px-4 py-2.5 text-start font-semibold">الكمية</th>
                  <th className="px-4 py-2.5 text-end font-semibold">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {products.slice(0, 3).map((p, i) => (
                  <tr key={p.id} className="transition-colors hover:bg-bg-subtle">
                    <td className="px-4 py-2.5 font-medium text-text-primary">{p.name}</td>
                    <td className="num px-4 py-2.5 text-text-secondary">{i + 1}</td>
                    <td className="num px-4 py-2.5 text-end text-text-primary">
                      {formatSar(p.price * (i + 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="المودال" note="ظل بمستوى واحد — حواف مربعة">
          <div className="mx-auto max-w-md border border-border-subtle bg-bg-overlay p-5 shadow-lg">
            <h3 className="text-h3 font-semibold text-text-primary">حذف الصنف من السلة؟</h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              سيُزال «كيكة تمر» من الطلب الحالي ولا يمكن التراجع.
            </p>
            <div className="mt-5 flex justify-start gap-2">
              <button
                className={`h-11 bg-destructive px-4 text-body-sm font-medium text-destructive-foreground ${focusRing}`}
              >
                حذف الصنف
              </button>
              <button
                className={`h-11 border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </Section>

        <Section
          title="حالات البيانات الأربع — إلزامية لكل سطح"
          note="محمّلة (الجداول أعلاه) + فارغة + تحميل + خطأ"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <LoadingBlock rows={4} />
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="لا فواتير بعد"
              body="ستظهر هنا فواتير الفرع فور بدء البيع من شاشة الكاشير."
            />
            <ErrorState onRetry={() => {}} />
          </div>
        </Section>
      </main>
    </div>
  );
}
