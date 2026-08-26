import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

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
        className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--ok-paper)] px-4 py-8 text-[var(--ok-ink)] sm:py-12"
      >
        <OkaabStyles />
        <div
          aria-hidden
          className="absolute -right-32 -top-32 size-96 rounded-full bg-[#E8A33D]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-[#E8A33D]/10 blur-3xl"
        />
        <main className="relative w-full max-w-[29rem]">
          <section
            aria-label="نموذج تسجيل الدخول"
            className="relative w-full rounded-[2rem] border border-[var(--ok-ink)]/15 bg-[var(--ok-card)] px-5 py-6 shadow-[0_24px_80px_rgba(31,24,15,0.14)] sm:px-9 sm:py-8"
          >
            <Link
              to="/"
              aria-label="العودة للرئيسية"
              className="absolute left-5 top-5 grid size-10 place-items-center rounded-full border border-[var(--ok-ink)]/20 bg-[var(--ok-paper-2)] transition hover:-translate-x-1 hover:border-[#E8A33D] sm:left-7 sm:top-7"
            >
              <ArrowLeft size={17} />
            </Link>

            <header className="mb-6 text-center">
              <img src="/logo-96.webp" alt="عُقاب" className="mx-auto size-16 object-contain" />
              <h1 className="mt-3 text-2xl font-black">مركز إدارة عُقاب</h1>
              <p className="mt-1 text-sm text-[var(--ok-ink)]/60">
                سجّل الدخول أو أنشئ حسابك المعتمد
              </p>
            </header>

            <SignIn
              routing="hash"
              fallbackRedirectUrl="/admin"
              signUpFallbackRedirectUrl="/admin"
              withSignUp
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
                  card: "w-full border-0 bg-transparent p-0 shadow-none",
                  header: "hidden",
                  socialButtonsBlockButton:
                    "h-12 border border-[var(--ok-ink)]/20 bg-[var(--ok-paper-2)] font-bold text-[var(--ok-ink)] shadow-none hover:border-[#E8A33D] hover:bg-[#E8A33D]/10",
                  formFieldLabel: "text-sm font-bold text-[var(--ok-ink)]",
                  formFieldInput:
                    "h-12 border border-[var(--ok-ink)]/20 bg-[var(--ok-paper)] text-[var(--ok-ink)] shadow-none focus:border-[#E8A33D]",
                  formButtonPrimary:
                    "h-12 border-0 bg-[#E8A33D] font-black text-[#181511] shadow-none hover:bg-[#f0b24f]",
                  buttonArrowIcon: "hidden",
                  dividerLine: "bg-[var(--ok-ink)]/20",
                  dividerText: "text-[var(--ok-ink)]/60",
                  footerAction: "hidden",
                  footer: "mt-5 border-0 bg-transparent p-0",
                },
              }}
            />

            <div className="mt-5 flex gap-3 rounded-2xl bg-[#E8A33D]/10 px-4 py-3 text-xs leading-6 text-[var(--ok-ink)]/75">
              <Sparkles className="mt-1 size-4 shrink-0 text-[#D68B1F]" aria-hidden />
              <p>
                في أول مرة استخدم Google بحساب <bdi dir="ltr">okaab@okaab.org</bdi>، أو أدخل البريد
                وسيبدأ إنشاء الحساب تلقائيًا.
              </p>
            </div>
          </section>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[var(--ok-ink)]/55">
            <ShieldCheck className="size-4 text-[#E8A33D]" aria-hidden />
            الدخول مخصص للحسابات المعتمدة فقط
          </p>
        </main>
      </div>
    </ThemeProvider>
  );
}
