import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { OkaabStyles } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "دخول إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "تسجيل الدخول الآمن إلى لوحة إدارة عُقاب." },
    ],
    scripts: [{ src: "/clerk-ui-assets/ui.browser.js" }],
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
        <main className="relative w-full max-w-[26rem]">
          <header className="mb-7 text-center">
            <Link
              to="/"
              aria-label="العودة للرئيسية"
              className="absolute left-0 top-1 grid size-11 place-items-center rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)] transition hover:-translate-x-1"
            >
              <ArrowLeft size={18} />
            </Link>
            <img src="/logo-96.webp" alt="عُقاب" className="mx-auto size-16 object-contain" />
            <h1 className="mt-3 text-2xl font-black">مركز إدارة عُقاب</h1>
            <p className="mt-1 text-sm text-[var(--ok-ink)]/65">دخول آمن لأعضاء فريق العمل</p>
          </header>

          <section aria-label="نموذج تسجيل الدخول" className="w-full">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/admin"
              appearance={{
                options: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
                variables: {
                  colorPrimary: "#E8A33D",
                  colorBackground: "var(--ok-card)",
                  colorForeground: "var(--ok-ink)",
                  colorMutedForeground: "var(--ok-ink)",
                  colorInput: "var(--ok-paper)",
                  colorInputForeground: "var(--ok-ink)",
                  borderRadius: "1rem",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "w-full border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] shadow-[6px_6px_0_var(--ok-ink)]",
                  headerTitle: "text-xl font-black",
                  headerSubtitle: "text-sm opacity-65",
                  socialButtonsBlockButton:
                    "h-12 border-2 border-[var(--ok-ink)] bg-[var(--ok-paper-2)] font-bold text-[var(--ok-ink)] hover:bg-[#E8A33D]/15",
                  formFieldLabel: "text-sm font-bold text-[var(--ok-ink)]",
                  formFieldInput:
                    "h-12 border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] text-[var(--ok-ink)] shadow-none",
                  formButtonPrimary:
                    "h-12 border-2 border-[var(--ok-ink)] bg-[#E8A33D] font-black text-[#181511] shadow-[3px_3px_0_var(--ok-ink)] hover:bg-[#f0b24f]",
                  dividerLine: "bg-[var(--ok-ink)]/20",
                  dividerText: "text-[var(--ok-ink)]/60",
                  footerAction: "hidden",
                  footer: "bg-transparent",
                },
              }}
            />
          </section>

          <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[var(--ok-ink)]/60">
            <ShieldCheck className="size-4 text-[#E8A33D]" aria-hidden />
            الدخول مخصص للحسابات المعتمدة فقط
          </p>
        </main>
      </div>
    </ThemeProvider>
  );
}
