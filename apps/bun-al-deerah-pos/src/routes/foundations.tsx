import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/foundations")({
  head: () => ({
    meta: [
      { title: "الأسس — التوكنز والخطوط | فوترة" },
      {
        name: "description",
        content: "توكنز نظام «فوترة» بنمطي Light وDark: الألوان، مقياس الخط، المسافات، والحواف.",
      },
      { property: "og:title", content: "الأسس — التوكنز والخطوط | فوترة" },
      {
        property: "og:description",
        content: "توكنز نظام «فوترة» بنمطي Light وDark: الألوان، مقياس الخط، المسافات، والحواف.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoundationsPage,
});

const surfaceTokens = [
  { name: "bg/base", light: "#FFFFFF", dark: "#101010", var: "--bg-base" },
  { name: "bg/subtle", light: "#F4F1EA", dark: "#161513", var: "--bg-subtle" },
  { name: "bg/overlay", light: "#FFFFFF", dark: "#1C1B19", var: "--bg-overlay" },
  {
    name: "border/subtle",
    light: "#E5E1D8",
    dark: "#2C2A26",
    var: "--border-subtle",
  },
  {
    name: "text/primary",
    light: "#141414",
    dark: "#F5F2EC",
    var: "--text-primary",
  },
  {
    name: "text/secondary",
    light: "#57534A",
    dark: "#B3AEA2",
    var: "--text-secondary",
  },
  { name: "text/muted", light: "#8A857A", dark: "#7D786D", var: "--text-muted" },
];

const heroInkTokens = [
  { name: "hero", light: "#F04E23", dark: "#FF5A2C", var: "--hero" },
  {
    name: "hero-foreground",
    light: "#FFFFFF",
    dark: "#1A0B04",
    var: "--hero-foreground",
  },
  { name: "ink", light: "#141414", dark: "#000000", var: "--ink" },
  {
    name: "ink-foreground",
    light: "#F7F5F0",
    dark: "#F7F5F0",
    var: "--ink-foreground",
  },
];

const accentTokens = [
  { name: "accent/50", hex: "#FDEEE7", note: "خلفية تمييز فاتحة" },
  { name: "accent/100", hex: "#FADBCB", note: "خلفية تمييز أعمق" },
  {
    name: "accent/400",
    hex: "#F9703F",
    note: "درجة وسيطة من عائلة البرتقالي",
  },
  { name: "accent/600", hex: "#F04E23", note: "برتقالي البطل الأساسي" },
  {
    name: "accent/700",
    hex: "#C43D12",
    note: "hover ونص accent على الخلفيات الفاتحة",
  },
];

const semanticTokens = [
  {
    name: "نجاح",
    light: "#0E7C4A",
    lightBg: "#E4F1EA",
    dark: "#34C77B",
    var: "--success",
  },
  {
    name: "تحذير",
    light: "#C2620B",
    lightBg: "#FDF0E0",
    dark: "#F5A524",
    var: "--warning",
  },
  {
    name: "خطأ",
    light: "#C4320A",
    lightBg: "#FBE8E3",
    dark: "#FF6A5A",
    var: "--error",
  },
  {
    name: "معلومات",
    light: "#3D6B9E",
    lightBg: "#E9F0F7",
    dark: "#6BA3D8",
    var: "--info",
  },
];

const badgeLabel: Record<string, string> = {
  "--success": "مقبولة",
  "--warning": "بانتظار الإرسال",
  "--error": "مرفوضة",
  "--info": "مُرسلة بانتظار الرد",
};

const typeScale = [
  { name: "display", spec: "32/40", cls: "text-display", sample: "مبيعات اليوم" },
  { name: "h1", spec: "24/32", cls: "text-h1", sample: "تقرير ضريبة القيمة المضافة" },
  { name: "h2", spec: "20/28", cls: "text-h2", sample: "فواتير فرع الرياض" },
  { name: "h3", spec: "16/24", cls: "text-h3", sample: "شاي كرك بالزعفران" },
  {
    name: "body",
    spec: "15 × 1.7",
    cls: "text-body",
    sample: "يعمل النظام بدون إنترنت وتُزامَن الفواتير تلقائيًا عند عودة الاتصال.",
  },
  {
    name: "body-sm",
    spec: "13/20",
    cls: "text-body-sm",
    sample: "آخر مزامنة ناجحة قبل دقيقتين",
  },
  { name: "caption", spec: "12/18", cls: "text-caption", sample: "شارة حالة الفوترة" },
];

const spacingSteps = [4, 8, 12, 16, 24, 32, 48, 64];

function Swatch({ hex, className }: { hex?: string; className?: string }) {
  return (
    <span
      className={`block h-10 w-full rounded-md border border-border-subtle ${className ?? ""}`}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  );
}

function TokenTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-border-subtle bg-bg-base">
      <h2 className="border-b border-border-subtle px-5 py-3 text-h3 font-semibold text-text-primary">
        {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FoundationsPage() {
  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="border-b border-border-subtle bg-bg-base">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6">
          <Link
            to="/"
            className="flex h-10 items-center gap-2 rounded-md px-2 text-body-sm text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="h-4 w-4" />
            الموجز
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-body-sm font-medium text-text-primary">foundations</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">الأسس</h1>
          <p className="mt-2 max-w-2xl text-body-sm text-text-secondary">
            مجموعة توكنز واحدة بنمطين: نمط Light يخدم لوحة الإدارة (كريمي/أبيض + برتقالي بطل +
            حبري)، ونمط Dark يخدم شاشة الكاشير وشاشة المطبخ (فحمي + برتقالي بطل). لون بطل واحد
            ولوحات حبرية للتمييز، ودلالية رباعية فقط — لا لون سادس، ولا تدرجات، وحدود 1px دائمًا.
          </p>
        </div>

        <TokenTable title="الأسطح والنصوص — النمطان جنبًا إلى جنب">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-start">
              <thead>
                <tr className="text-caption text-text-muted">
                  <th className="pb-3 text-start font-medium">التوكن</th>
                  <th className="pb-3 text-start font-medium">نمط Light — الإدارة</th>
                  <th className="pb-3 text-start font-medium">نمط Dark — الكاشير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {surfaceTokens.map((t) => (
                  <tr key={t.name}>
                    <td className="py-2 pe-4">
                      <span className="num text-body-sm font-medium text-text-primary">
                        {t.name}
                      </span>
                    </td>
                    <td className="py-2 pe-4">
                      <div className="flex items-center gap-3">
                        <span className="w-24">
                          <Swatch hex={t.light} />
                        </span>
                        <span className="num text-caption text-text-secondary">{t.light}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-24">
                          <Swatch hex={t.dark} />
                        </span>
                        <span className="num text-caption text-text-secondary">{t.dark}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TokenTable>

        <TokenTable title="البطل والحبر — hero / ink">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-start">
              <thead>
                <tr className="text-caption text-text-muted">
                  <th className="pb-3 text-start font-medium">التوكن</th>
                  <th className="pb-3 text-start font-medium">نمط Light — الإدارة</th>
                  <th className="pb-3 text-start font-medium">نمط Dark — الكاشير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {heroInkTokens.map((t) => (
                  <tr key={t.name}>
                    <td className="py-2 pe-4">
                      <span className="num text-body-sm font-medium text-text-primary">
                        {t.name}
                      </span>
                    </td>
                    <td className="py-2 pe-4">
                      <div className="flex items-center gap-3">
                        <span className="w-24">
                          <Swatch hex={t.light} />
                        </span>
                        <span className="num text-caption text-text-secondary">{t.light}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-24">
                          <Swatch hex={t.dark} />
                        </span>
                        <span className="num text-caption text-text-secondary">{t.dark}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-11 items-center rounded-md bg-hero px-4 text-body-sm font-medium text-hero-foreground">
              زر بطل — bg-hero
            </span>
            <span className="inline-flex h-11 items-center rounded-md bg-ink px-4 text-body-sm font-medium text-ink-foreground">
              فلتر نشط — bg-ink
            </span>
          </div>
        </TokenTable>

        <TokenTable title="لون التمييز الوحيد — عائلة البرتقالي">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accentTokens.map((t) => (
              <div key={t.name} className="space-y-2">
                <Swatch hex={t.hex} className="h-14" />
                <p className="num text-body-sm font-medium text-text-primary">{t.name}</p>
                <p className="num text-caption text-text-muted">{t.hex}</p>
                <p className="text-caption text-text-secondary">{t.note}</p>
              </div>
            ))}
            <div className="space-y-2">
              <div className="flex h-14 items-center justify-center gap-2 rounded-md border border-border-subtle bg-bg-subtle px-3">
                <span className="rounded-md bg-primary px-3 py-1.5 text-caption font-medium text-primary-foreground">
                  أساسي — فاتح
                </span>
                <span className="dark rounded-md bg-bg-base px-2 py-1.5">
                  <span className="rounded-md bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground">
                    أساسي — داكن
                  </span>
                </span>
              </div>
              <p className="text-caption text-text-secondary">
                الزر الأساسي في الفاتح حبري (bg-ink)، وفي الداكن برتقالي بطل (bg-hero) — الاثنان عبر
                توكن bg-primary نفسه.
              </p>
            </div>
          </div>
        </TokenTable>

        <TokenTable title="الدلالية — نص وخلفية على النمطين">
          <div className="grid gap-4 sm:grid-cols-2">
            {semanticTokens.map((t) => (
              <div key={t.name} className="rounded-md border border-border-subtle p-3">
                <p className="text-body-sm font-semibold text-text-primary">{t.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="rounded-md px-3 py-1.5 text-caption font-medium"
                    style={{ backgroundColor: t.lightBg, color: t.light }}
                  >
                    {badgeLabel[t.var]}
                  </span>
                  <span className="num text-caption text-text-muted">
                    {t.light} / {t.lightBg}
                  </span>
                </div>
                <div className="dark mt-2 flex items-center gap-2 rounded-md bg-bg-base p-2">
                  <span
                    className="rounded-md px-3 py-1.5 text-caption font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${t.dark} 12%, transparent)`,
                      color: t.dark,
                    }}
                  >
                    {badgeLabel[t.var]}
                  </span>
                  <span className="num text-caption text-text-muted">
                    {t.dark} على خلفية شفافة من اللون نفسه
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TokenTable>

        <TokenTable title="مقياس الخط — IBM Plex Sans Arabic وJetBrains Mono للأرقام">
          <div className="divide-y divide-border-subtle">
            {typeScale.map((t) => (
              <div key={t.name} className="flex items-baseline gap-6 py-3">
                <div className="w-28 shrink-0">
                  <p className="num text-body-sm font-medium text-text-primary">{t.name}</p>
                  <p className="num text-caption text-text-muted">{t.spec}</p>
                </div>
                <p className={`${t.cls} text-text-primary`}>{t.sample}</p>
              </div>
            ))}
            <div className="flex items-baseline gap-6 py-3">
              <div className="w-28 shrink-0">
                <p className="num text-body-sm font-medium text-text-primary">price-total</p>
                <p className="num text-caption text-text-muted">28/36 Mono</p>
              </div>
              <p className="text-price-total font-bold text-text-primary">100.05</p>
            </div>
            <div className="flex items-baseline gap-6 py-3">
              <div className="w-28 shrink-0">
                <p className="num text-body-sm font-medium text-text-primary">num-display</p>
                <p className="num text-caption text-text-muted">رقم عرض عملاق</p>
              </div>
              <p className="num-display text-4xl text-text-primary">12,480.00</p>
            </div>
            <div className="flex items-baseline gap-6 py-3">
              <div className="w-28 shrink-0">
                <p className="text-micro text-text-muted">MICRO LABEL</p>
                <p className="num text-caption text-text-muted">text-micro</p>
              </div>
              <p className="text-micro text-text-secondary">
                تسمية ميكرو · حالة الوردية · رقم الفرع
              </p>
            </div>
            <div className="flex items-baseline gap-6 py-3">
              <div className="w-28 shrink-0">
                <p className="text-body-sm font-medium text-text-primary">الأرقام LTR</p>
                <p className="num text-caption text-text-muted">JetBrains Mono</p>
              </div>
              <p className="text-body text-text-secondary">
                فاتورة <span className="num font-semibold">INV-2026-00418</span> بإجمالي{" "}
                <span className="num font-semibold">4,820.50</span> ر.س وباركود{" "}
                <span className="num">6281001234567</span>
              </p>
            </div>
          </div>
        </TokenTable>

        <div className="grid gap-6 md:grid-cols-2">
          <TokenTable title="المسافات — مضاعفات 8 صارمة (4 للتفاصيل الدقيقة)">
            <div className="space-y-2">
              {spacingSteps.map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="num w-8 text-caption text-text-muted">{s}</span>
                  <span
                    className="block h-4 rounded-sm bg-accent-600/80"
                    style={{ width: s * 4 }}
                  />
                </div>
              ))}
            </div>
          </TokenTable>

          <TokenTable title="الحواف وأهداف اللمس">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-20 items-center justify-center rounded-md border border-border-subtle bg-bg-subtle text-caption text-text-secondary">
                  2 — بطاقات وحقول
                </span>
                <span
                  className="flex h-12 w-20 items-center justify-center border border-border-subtle bg-bg-subtle text-caption text-text-secondary"
                  style={{ borderRadius: 6 }}
                >
                  6 — مودال
                </span>
                <span className="flex h-12 w-20 items-center justify-center rounded-full border border-border-subtle bg-bg-subtle text-caption text-text-secondary">
                  نقطة حالة
                </span>
              </div>
              <p className="text-body-sm text-text-secondary">
                أهداف اللمس: لا تقل عن <span className="num font-semibold">44px</span> في شاشة
                الكاشير وشاشة المطبخ، و<span className="num font-semibold">40px</span> في لوحة
                الإدارة. التباين لا يقل عن <span className="num font-semibold">4.5:1</span> على
                النمطين.
              </p>
              <p className="border-t border-border-subtle pt-3 text-caption text-text-secondary">
                قاعدة التباين: توكن <span className="num">text/muted</span> دون عتبة 4.5:1، لذلك
                يُقتصر استخدامه على النصوص الثانوية غير الحرجة (التلميحات والنصوص المؤقتة داخل
                الحقول) ولا يحمل معلومة إلزامية وحده.
              </p>
            </div>
          </TokenTable>
        </div>
      </main>
    </div>
  );
}
