import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { withBasePath } from "../lib/base-path";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display font-bold text-foreground">٤٠٤</h1>
        <h2 className="mt-4 text-h2 font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-accent-700"
          >
            العودة للرئيسية
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
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">تعذّر تحميل الصفحة</h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          حدث خطأ من جهتنا. يمكنك إعادة المحاولة أو العودة للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-accent-700"
          >
            إعادة المحاولة
          </button>
          <a
            href={withBasePath("/")}
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "بُنّ الديرة — نظام نقاط البيع" },
      {
        name: "description",
        content:
          "نظام بُنّ الديرة لإدارة المبيعات والفواتير والمخزون والفروع — مصمم للمقاهي السعودية.",
      },
      { property: "og:title", content: "بُنّ الديرة — نظام نقاط البيع" },
      {
        property: "og:description",
        content: "نظام بُنّ الديرة لإدارة المبيعات والفواتير والمخزون والفروع.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: withBasePath("/og.png") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "بُنّ الديرة — نظام نقاط البيع" },
      {
        name: "twitter:description",
        content: "نظام بُنّ الديرة لإدارة المبيعات والفواتير والمخزون والفروع.",
      },
      { name: "twitter:image", content: withBasePath("/og.png") },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: withBasePath("/brand/bun-al-deerah-mark.png"),
        type: "image/png",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
