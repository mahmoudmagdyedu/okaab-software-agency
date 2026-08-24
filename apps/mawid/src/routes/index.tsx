import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing,
  CalendarRange,
  CreditCard,
  LayoutGrid,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";

import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مَوعِد — منصة حجز المواعيد العربية" },
      {
        name: "description",
        content:
          "مَوعِد: منصة حجز مواعيد متعددة المنشآت للعيادات والصالونات ومراكز التدريب — تقويم أسبوعي، حجز عام، عربون، وتذكيرات واتساب بواجهة عربية كاملة.",
      },
      { property: "og:title", content: "مَوعِد — منصة حجز المواعيد العربية" },
      {
        property: "og:description",
        content: "تقويم أسبوعي بالسحب والإفلات، حجز عام بست خطوات، عربون، وتذكيرات واتساب.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "مَوعِد",
          applicationCategory: "BusinessApplication",
          inLanguage: "ar",
          description: "منصة حجز مواعيد متعددة المنشآت للعيادات والصالونات ومراكز التدريب.",
        }),
      },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  {
    icon: CalendarRange,
    title: "تقويم أسبوعي بالسحب والإفلات",
    body: "شبكة مبنية يدويًا لكل مقدم خدمة، مع منع التعارض في قاعدة البيانات لحظة الإفلات.",
  },
  {
    icon: LayoutGrid,
    title: "حجز عام بست خطوات",
    body: "الفرع ثم الخدمة ثم مقدم الخدمة ثم الموعد ثم بيانات العميل ثم التأكيد — بدون تسجيل.",
  },
  {
    icon: CreditCard,
    title: "عربون وسياسة إلغاء",
    body: "نسبة عربون لكل فرع وحالة «بانتظار العربون» حتى تأكيد الدفع.",
  },
  {
    icon: BellRing,
    title: "تذكيرات واتساب",
    body: "قوالب رسائل قابلة للتحرير، تكرار تذكير متعدد، وساعات هدوء تحترم وقت العميل.",
  },
  {
    icon: Users,
    title: "دليل عملاء و CRM",
    body: "ملف لكل عميل: الزيارات، عدم الحضور، الملاحظات، وسجل المواعيد كاملًا.",
  },
  {
    icon: ShieldCheck,
    title: "أدوار وصلاحيات دقيقة",
    body: "موظف استقبال، مقدم خدمة، مدير فرع، ومالك — بعزل كامل بين المنشآت.",
  },
];

const STEPS = [
  { n: 1, title: "أنشئ منشأتك", body: "فروع، مقدمو خدمة، خدمات بأسعارها ومدتها." },
  { n: 2, title: "اضبط التوفر", body: "نوافذ عمل أسبوعية، إجازات، واستثناءات لكل فرع." },
  { n: 3, title: "شارك رابط الحجز", body: "صفحة حجز عامة بهوية منشأتك تعمل على الجوال." },
  { n: 4, title: "أدِر يومك", body: "لوحة اليوم والتقويم الأسبوعي والتذكيرات التلقائية." },
];

const FACTS = [
  { label: "نمط المنتج", value: "متعدد المنشآت" },
  { label: "الشاشة البطل", value: "تقويم أسبوعي" },
  { label: "اتجاه الواجهة", value: "كامل RTL" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center justify-between gap-4 bg-surface-dark px-6">
        <p className="truncate text-caption font-semibold text-on-dark">
          مَوعِد <span className="text-on-dark-soft">—</span> منصة حجز عربية متعددة المنشآت
        </p>
        <p className="hidden text-caption text-on-dark-soft sm:block">
          <MonoText>إصدار التصميم 1.0</MonoText>
        </p>
      </header>

      <main>
        {/* فريم الغلاف: لوحة برتقالية + عنوان ضخم + ثلاث بطاقات حقائق */}
        <section className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex flex-col items-center justify-center gap-6 bg-accent-600 px-8 py-16 text-center">
            <Sun className="size-20 text-on-dark" strokeWidth={1.5} aria-hidden />
            <p className="text-hero font-bold text-accent-700">
              <MonoText>01</MonoText>
            </p>
            <div>
              <p className="text-h3 font-bold text-on-dark">نظام المواعيد</p>
              <p className="mt-1 text-caption text-on-dark-soft">مصمم للسوق العربي من البداية</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8 px-6 py-16 md:px-16">
            <p className="text-caption font-semibold text-accent-600">
              منصة SaaS للحجز • النسخة الأولى
            </p>
            <h1 className="text-display font-bold text-ink md:text-hero">
              مَوعِدك،
              <br />
              بلا انتظار.
            </h1>
            <span aria-hidden className="size-3 bg-accent-600" />
            <p className="max-w-xl border-b border-border pb-8 text-body text-ink-soft">
              حجز إنساني، منظّم بعناية، ومبني لفِرق عربية — للعيادات والصالونات ومراكز التدريب.
            </p>

            <dl className="grid gap-4 sm:grid-cols-3">
              {FACTS.map((fact) => (
                <div key={fact.label} className="border border-border bg-surface-subtle p-4">
                  <dt className="text-caption text-ink-soft">{fact.label}</dt>
                  <dd className="mt-6 text-body font-bold text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">أنشئ منشأتك الآن</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/book/$slug" params={{ slug: "smile" }}>
                  جرّب صفحة الحجز
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-subtle">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-h1 font-bold text-ink">كل ما تحتاجه لإدارة المواعيد</h2>
            <p className="mt-3 max-w-2xl text-body text-ink-soft">
              التخزين بتوقيت UTC والعرض بتوقيت الفرع، مع عزل بيانات كل منشأة على مستوى قاعدة
              البيانات.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="space-y-3 border border-border bg-background p-6"
                >
                  <span className="grid size-10 place-items-center border border-border bg-surface-subtle text-accent-600">
                    <feature.icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-bold text-ink">{feature.title}</h3>
                  <p className="text-body-sm text-ink-soft">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-h1 font-bold text-ink">أربع خطوات للانطلاق</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="space-y-3 border border-border bg-background p-6">
                <span className="grid size-8 place-items-center bg-accent-600 text-body-sm font-bold text-on-dark">
                  <MonoText>{step.n}</MonoText>
                </span>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="text-body-sm text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border bg-surface-dark">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 text-center">
            <h2 className="text-h1 font-bold text-on-dark">ابدأ باستقبال الحجوزات اليوم</h2>
            <p className="mx-auto max-w-xl text-body text-on-dark-soft">
              أنشئ منشأتك، اضبط توفر مقدمي الخدمة، وشارك رابط الحجز مع عملائك في دقائق.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/register">إنشاء حساب</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/ui-kit">دليل المكوّنات</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <p className="text-body-sm text-faint">مَوعِد — منصة حجز المواعيد العربية</p>
          <nav className="flex flex-wrap gap-4 text-body-sm text-ink-soft">
            <Link to="/login">تسجيل الدخول</Link>
            <Link to="/register">إنشاء حساب</Link>
            <Link to="/ui-kit">دليل المكوّنات</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
