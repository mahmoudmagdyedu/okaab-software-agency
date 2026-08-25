import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { OkaabStyles } from "@/components/okaab/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "دخول إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "تسجيل الدخول الآمن إلى لوحة إدارة عُقاب." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/admin");
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setStatus("sending");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        shouldCreateUser: normalized === "okaab@okaab.org",
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(
        error.message.toLowerCase().includes("signups")
          ? "هذا البريد غير مدعو إلى لوحة الإدارة. اطلب دعوة من المسؤول."
          : "تعذّر إرسال رابط الدخول الآن. حاول مرة أخرى بعد قليل.",
      );
      return;
    }
    setStatus("sent");
  }

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

        <main className="relative w-full max-w-md rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 shadow-[10px_10px_0_var(--ok-ink)] sm:p-9">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              aria-label="العودة للرئيسية"
              className="grid size-10 place-items-center rounded-full border-2 border-[var(--ok-ink)]"
            >
              <ArrowLeft size={18} />
            </Link>
            <img src="/logo-96.webp" alt="عُقاب" className="size-14 object-contain" />
          </div>

          {status === "sent" ? (
            <div className="py-8 text-center" role="status">
              <CheckCircle2 className="mx-auto text-[var(--ok-success-text)]" size={52} />
              <h1 className="mt-5 font-display text-3xl font-bold">راجع بريدك</h1>
              <p className="mt-3 leading-7 opacity-70">أرسلنا رابط دخول آمن إلى</p>
              <p dir="ltr" className="mt-1 font-bold">
                {email.trim().toLowerCase()}
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-7 text-sm font-bold underline underline-offset-4"
              >
                استخدام بريد آخر
              </button>
            </div>
          ) : (
            <>
              <p className="mt-7 text-sm font-bold text-[var(--ok-accent-text)]">
                لوحة إدارة Okaab
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
                دخول بدون كلمة مرور
              </h1>
              <p className="mt-4 leading-7 opacity-70">
                أدخل البريد المدعو وسنرسل لك رابطًا صالحًا لمرة واحدة.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">البريد الإلكتروني</span>
                  <span className="flex items-center gap-3 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4">
                    <Mail size={18} className="opacity-55" />
                    <input
                      dir="ltr"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@okaab.org"
                      className="h-13 min-w-0 flex-1 bg-transparent text-left outline-none"
                    />
                  </span>
                </label>
                {status === "error" && (
                  <p className="text-sm font-semibold text-[var(--ok-error-text)]" role="alert">
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <ShieldCheck size={19} />
                  {status === "sending" ? "جاري الإرسال…" : "أرسل رابط الدخول"}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
