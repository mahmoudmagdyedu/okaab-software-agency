import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pos/loading")({
  head: () => ({
    meta: [
      { title: "تحميل شاشة الكاشير — فوترة" },
      {
        name: "description",
        content: "هيكل تحميل شاشة الكاشير أثناء تجهيز الكتالوج المحلي.",
      },
      { property: "og:title", content: "تحميل شاشة الكاشير — فوترة" },
      {
        property: "og:description",
        content: "هيكل تحميل شاشة الكاشير أثناء تجهيز الكتالوج المحلي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PosLoading,
});

function PosLoading() {
  return (
    <div
      className="dark flex h-screen flex-col overflow-hidden bg-bg-base text-text-primary"
      aria-busy="true"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-subtle px-4">
        <div className="h-5 w-44 animate-pulse rounded-md bg-bg-overlay" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-bg-overlay" />
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 p-4 pb-0">
            <div className="h-12 animate-pulse rounded-md bg-bg-overlay" />
            <div className="flex gap-2 pb-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-11 w-28 shrink-0 animate-pulse rounded-md bg-bg-overlay"
                />
              ))}
            </div>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-5 content-start gap-3 p-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[104px] animate-pulse rounded-md border border-border-subtle bg-bg-overlay"
                style={{ opacity: 1 - (i % 5) * 0.1 }}
              />
            ))}
          </div>
        </main>

        <aside className="flex w-[420px] shrink-0 flex-col border-s border-border-subtle bg-bg-subtle">
          <div className="border-b border-border-subtle px-4 py-3">
            <div className="h-6 w-32 animate-pulse rounded-md bg-bg-overlay" />
          </div>
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-bg-overlay" />
            ))}
          </div>
          <div className="border-t border-border-subtle p-4">
            <div className="h-4 w-full animate-pulse rounded-md bg-bg-overlay" />
            <div className="mt-3 h-14 w-full animate-pulse rounded-md bg-bg-overlay" />
          </div>
        </aside>
      </div>

      <p className="sr-only" role="status">
        جارٍ تجهيز كتالوج الأصناف المحلي…
      </p>
    </div>
  );
}
