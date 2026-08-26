import { SignIn, useSignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useState } from "react";

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
          <GoogleSignInButton />
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/admin"
            signUpUrl="/sign-up"
            appearance={{
              options: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
              variables: {
                colorPrimary: "#E8A33D",
                colorBackground: "#fffdf8",
                borderRadius: "0.75rem",
              },
            }}
          />
        </main>
      </div>
    </ThemeProvider>
  );
}

function GoogleSignInButton() {
  const { signIn, fetchStatus } = useSignIn();
  const [errorMessage, setErrorMessage] = useState("");
  const isLoading = fetchStatus === "fetching";

  const startGoogleSignIn = async () => {
    setErrorMessage("");
    try {
      const result = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/admin",
        redirectCallbackUrl: "/sso-callback",
      });
      if (result.error) {
        setErrorMessage(result.error.longMessage || result.error.message || "تعذر بدء تسجيل الدخول.");
      }
    } catch {
      setErrorMessage("تعذر الاتصال بخدمة تسجيل الدخول. حاول مرة أخرى.");
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-black/15 bg-white/85 p-3 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={startGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-[var(--ok-ink)] bg-white px-4 py-3 text-sm font-bold text-[var(--ok-ink)] transition hover:-translate-y-0.5 hover:bg-[#fff8ea] disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden />
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="size-5">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.13 1.04 4.48l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
          </svg>
        )}
        <span>{isLoading ? "جارٍ التحويل إلى Google…" : "تسجيل الدخول باستخدام Google"}</span>
      </button>
      {errorMessage ? (
        <p role="alert" className="mt-2 text-center text-xs font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
