import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import OkaabLanding from "@/components/okaab/OkaabLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تطوير مواقع وتطبيقات في مصر والخليج — عُقاب OKAAB" },
      {
        name: "description",
        content:
          "عُقاب: وكالة تطوير مواقع وتطبيقات في مصر والخليج — مواقع ويب متكاملة، متاجر ومنصات، تطبيقات Android و iOS، رفع وإدارة سيرفرات، توافق SEO، ودعم فني 24/7.",
      },
      { property: "og:title", content: "تطوير مواقع وتطبيقات في مصر والخليج — عُقاب OKAAB" },
      {
        property: "og:description",
        content:
          "عُقاب: وكالة تطوير مواقع وتطبيقات في مصر والخليج — مواقع ويب متكاملة، تطبيقات Android و iOS، رفع وإدارة سيرفرات، ودعم فني 24/7.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://okaab.org/" },
      { property: "og:image", content: "https://okaab.org/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://okaab.org/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://okaab.org/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": "https://okaab.org/#service",
          name: "عُقاب OKAAB",
          alternateName: "Okaab",
          founder: { "@type": "Person", name: "محمود مجدي", alternateName: "Mahmoud Magdy" },
          url: "https://okaab.org/",
          image: "https://okaab.org/og-image.jpg",
          logo: "https://okaab.org/favicon.png",
          email: "hello@okaab.org",
          telephone: "+201228086441",
          priceRange: "$$",
          address: { "@type": "PostalAddress", addressCountry: "EG" },
          areaServed: ["EG", "SA", "AE", "KW", "QA", "EU"],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "00:00",
              closes: "23:59",
            },
          ],
          description:
            "وكالة تطوير مواقع وتطبيقات في مصر والخليج، مع رفع وإدارة السيرفرات وتحسين محركات البحث ودعم فني 24/7.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              q: "هل تعملون مع عملاء خارج مصر؟",
              a: "نعم. نعمل مع شركات في مصر والخليج (السعودية والإمارات والكويت وقطر) وأوروبا، والتواصل أونلاين بالعربية أو الإنجليزية.",
            },
            {
              q: "كم يستغرق مشروع تطوير موقع؟",
              a: "الموقع التعريفي من أسبوع إلى أسبوعين، والمتجر الإلكتروني من 3 إلى 5 أسابيع، ومنصة SaaS أو لوحة التحكم من 6 إلى 10 أسابيع.",
            },
            {
              q: "هل تطوّرون تطبيقات Android و iOS؟",
              a: "نعم، نطوّر التطبيقات بـ Flutter أو React Native مع باك إند وAPIs ولوحة تحكم، وننشرها على Google Play و App Store.",
            },
            {
              q: "هل توفّرون استضافة وإدارة سيرفرات؟",
              a: "نرفع المشروع على AWS أو VPS أو Cloudflare، ونضبط النسخ الاحتياطي وشهادات SSL والمراقبة وتوسعة الموارد.",
            },
            {
              q: "متى يعمل الدعم الفني؟",
              a: "الدعم متاح على مدار الساعة، وأول رد خلال أقل من 15 دقيقة.",
            },
          ].map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),

  component: Index,
});

function Index() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <OkaabLanding />
      </I18nProvider>
    </ThemeProvider>
  );
}
