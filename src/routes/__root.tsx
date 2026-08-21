import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { THEME_INIT_SCRIPT } from "../lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Okaab" },
      {
        name: "google-site-verification",
        content: "ii7jj81W5XiVbg3YkvH67fOQkMZNN5-Ly4YX7P3QClc",
      },

      { property: "og:site_name", content: "عُقاب OKAAB" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://okaab.org/#organization",
          name: "عُقاب OKAAB",
          alternateName: "Okaab",
          url: "https://okaab.org",
          logo: "https://okaab.org/favicon.png",
          image: "https://okaab.org/favicon.png",
          slogan: "الأداء. الرؤية. السرعة.",
          email: "hello@okaab.org",
          telephone: "+201555317977",
          description:
            "شركة تطوير مواقع وتطوير تطبيقات في مصر والخليج، مع رفع وإدارة السيرفرات وتحسين محركات البحث ودعم فني 24/7.",
          areaServed: ["EG", "SA", "AE", "KW", "QA", "EU"],
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "support@okaab.org",
              telephone: "+201555317977",
              availableLanguage: ["ar", "en", "fr", "es"],
            },
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "خدمات عُقاب",
            itemListElement: [
              "تطوير مواقع ويب متكاملة",
              "تطوير تطبيقات Android و iOS",
              "دعم فني 24/7",
              "رفع وإدارة السيرفرات",
              "تحسين محركات البحث SEO",
            ].map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s },
            })),
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://okaab.org/#website",
          name: "عُقاب OKAAB",
          url: "https://okaab.org",
          inLanguage: "ar-EG",
          publisher: { "@id": "https://okaab.org/#organization" },
        }),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preload",
        href: "/fonts/plex-dda02519.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/plex-5ab42dd5.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },

      { rel: "icon", href: "/favicon-32.png?v=3", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-48.png?v=3", type: "image/png", sizes: "48x48" },
      { rel: "icon", href: "/favicon.png?v=3", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=3", sizes: "180x180" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar-EG" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
