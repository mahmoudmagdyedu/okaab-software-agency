import type { LegalLanguage } from "@/content/legal";

export function legalHead(
  lang: LegalLanguage,
  slug: "terms" | "privacy",
  title: string,
  description: string,
) {
  const path = lang === "ar" ? `/${slug}` : `/en/${slug}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://okaab.org${path}` },
    ],
    links: [
      { rel: "canonical", href: `https://okaab.org${path}` },
      { rel: "alternate", hrefLang: "ar", href: `https://okaab.org/${slug}` },
      { rel: "alternate", hrefLang: "en", href: `https://okaab.org/en/${slug}` },
      { rel: "alternate", hrefLang: "x-default", href: `https://okaab.org/${slug}` },
    ],
  };
}

export function aboutHead(lang: LegalLanguage, title: string, description: string) {
  const path = lang === "ar" ? "/about" : "/en/about";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://okaab.org${path}` },
    ],
    links: [
      { rel: "canonical", href: `https://okaab.org${path}` },
      { rel: "alternate", hrefLang: "ar", href: "https://okaab.org/about" },
      { rel: "alternate", hrefLang: "en", href: "https://okaab.org/en/about" },
      { rel: "alternate", hrefLang: "x-default", href: "https://okaab.org/about" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `https://okaab.org${path}`,
          name: title,
          description,
          inLanguage: lang,
          about: { "@id": "https://okaab.org/#organization" },
        }),
      },
    ],
  };
}
