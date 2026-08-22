import { createFileRoute } from "@tanstack/react-router";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — عُقاب ومَوعِد" },
      {
        name: "description",
        content: "سياسة الخصوصية لخدمات عُقاب ومنصة مَوعِد لإدارة الحجوزات والمواعيد.",
      },
      { property: "og:title", content: "سياسة الخصوصية — عُقاب ومَوعِد" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://okaab.org/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://okaab.org/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "البيانات التي نجمعها",
    body: [
      "بيانات الحساب مثل الاسم والبريد الإلكتروني ورقم الهاتف عند تقديمه.",
      "عند تسجيل الدخول عبر Google نستقبل بيانات الملف الأساسية التي توافق على مشاركتها، مثل الاسم والبريد الإلكتروني وصورة الحساب. ولا نحصل على كلمة مرور حساب Google.",
      "بيانات التشغيل التي تدخلها داخل مَوعِد، مثل معلومات العملاء والمواعيد والخدمات والفروع والموظفين.",
      "بيانات تقنية محدودة لازمة للأمان وتشخيص الأعطال، مثل وقت الطلب ونوع المتصفح وعنوان الشبكة.",
    ],
  },
  {
    title: "كيف نستخدم البيانات",
    body: [
      "إنشاء الحساب والتحقق من الهوية وإدارة جلسة تسجيل الدخول.",
      "تشغيل خدمات الحجز والتقويم والإشعارات والدعم الفني.",
      "حماية الحسابات ومنع إساءة الاستخدام وتحسين موثوقية الخدمة.",
      "التواصل معك بشأن الخدمة أو طلبات الدعم التي ترسلها إلينا.",
    ],
  },
  {
    title: "المشاركة ومقدمو الخدمة",
    body: [
      "لا نبيع بياناتك الشخصية. قد نعالج البيانات عبر مزودي البنية التحتية الضروريين لتقديم الخدمة، مثل Supabase للمصادقة وقاعدة البيانات، وHeroku للاستضافة، وResend لإرسال الرسائل البريدية.",
      "قد نفصح عن بيانات بالقدر المطلوب قانونًا أو لحماية المستخدمين والخدمة من الاحتيال أو الضرر.",
    ],
  },
  {
    title: "الحفظ والأمان وحقوقك",
    body: [
      "نحتفظ بالبيانات طوال مدة استخدام الحساب أو بالقدر اللازم لتقديم الخدمة والوفاء بالالتزامات القانونية، ثم نحذفها أو نجعلها غير قابلة للربط بك حيثما أمكن.",
      "نستخدم ضوابط وصول وتشفيرًا أثناء النقل وعزلًا لبيانات المنشآت. لا توجد وسيلة نقل أو تخزين إلكتروني تضمن أمانًا مطلقًا.",
      "يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذف حسابك وبياناته، مع مراعاة أي متطلبات قانونية للحفظ.",
    ],
  },
  {
    title: "التغييرات والتواصل",
    body: [
      "قد نحدّث هذه السياسة عند تطوير خدماتنا. سننشر النسخة الجديدة في هذه الصفحة مع تاريخ آخر تحديث.",
      "لطلبات الخصوصية أو الاستفسارات تواصل معنا عبر support@okaab.org.",
    ],
  },
];

function PrivacyPage() {
  return (
    <ThemeProvider>
      <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <OkaabStyles />
        <SiteHeader lang="ar" />

        <main className="ok-container py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-sm font-semibold text-[var(--ok-accent-text)]">
              عُقاب × مَوعِد
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              سياسة الخصوصية
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ok-ink)]/75 sm:text-lg">
              توضح هذه السياسة كيف تتعامل عُقاب ومنصة مَوعِد مع البيانات الشخصية عند استخدام مواقعنا
              وخدمات إدارة المواعيد وتسجيل الدخول.
            </p>
            <p className="mt-3 text-sm text-[var(--ok-ink)]/60">آخر تحديث: 22 أغسطس 2026</p>

            <div className="mt-10 divide-y-2 divide-[var(--ok-ink)]/15 border-y-2 border-[var(--ok-ink)]">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="grid gap-4 py-8 sm:grid-cols-[220px_1fr] sm:gap-8"
                >
                  <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                  <ul className="space-y-3 text-sm leading-7 text-[var(--ok-ink)]/80 sm:text-base">
                    {section.body.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--ok-accent-text)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <a
              href="mailto:support@okaab.org"
              className="mt-8 inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 py-3 font-semibold text-[var(--ok-paper)] transition-colors hover:bg-[var(--ok-accent-text)] hover:text-[var(--ok-ink)]"
            >
              support@okaab.org
            </a>
          </div>
        </main>

        <SiteFooter lang="ar" />
      </div>
    </ThemeProvider>
  );
}
