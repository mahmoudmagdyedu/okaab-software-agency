import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { OkaabStyles } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "دخول إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "تسجيل الدخول الآمن إلى لوحة إدارة عُقاب." },
    ],
    scripts: [{ src: "/clerk-ui.js" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  return (
    <ThemeProvider>
      <div
        dir="rtl"
        lang="ar"
        className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--ok-paper)] px-4 py-10 text-[var(--ok-ink)]"
      >
        <OkaabStyles />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-80 rounded-full bg-[#E8A33D]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-28 -left-24 size-96 rounded-full bg-[#E8A33D]/15 blur-3xl"
        />
        <main className="relative w-full max-w-md">
          <div className="mb-5 flex items-center justify-between">
            <Link
              to="/"
              aria-label="العودة للرئيسية"
              className="grid size-10 place-items-center rounded-full border-2 border-[var(--ok-ink)]"
            >
              <ArrowLeft size={18} />
            </Link>
            <img src="/logo-96.webp" alt="عُقاب" className="size-14 object-contain" />
          </div>
          <SignIn routing="hash" fallbackRedirectUrl="/admin" signUpUrl="/sign-up" />
        </main>
      </div>
    </ThemeProvider>
  );
}
