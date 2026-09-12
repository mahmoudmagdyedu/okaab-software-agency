import { useAuth, useClerk, useSignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthExperience, useAuthLocale } from "@/components/auth/AuthExperience";
import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "دخول إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "تسجيل الدخول الآمن إلى لوحة إدارة عُقاب." },
    ],
  }),
  component: AdminLoginRoute,
});

function AdminLoginRoute() {
  return (
    <ThemeProvider>
      <ClerkBoundary>
        <AuthExperience audience="admin">
          <AdminLoginPage />
        </AuthExperience>
      </ClerkBoundary>
    </ThemeProvider>
  );
}

const ADMIN_COPY = {
  ar: {
    error: "تعذّر إكمال تسجيل الدخول. حاول مرة أخرى.",
    unauthorized: "هذا البريد غير مضاف إلى فريق عُقاب. اطلب دعوة من المسؤول.",
    invalidCode: "الكود غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا.",
    eyebrow: "ADMIN DASHBOARD",
    title: "أهلًا بك في عُقاب",
    subtitle: "دخول آمن لأعضاء الفريق المعتمدين فقط",
    google: "المتابعة باستخدام Google",
    divider: "أو بكود على البريد",
    email: "البريد الإلكتروني",
    sendCode: "إرسال كود الدخول",
    sentTo: "أرسلنا كودًا إلى",
    code: "كود الدخول",
    confirm: "تأكيد والدخول",
    otherEmail: "استخدام بريد آخر",
    security: "لن نطلب منك كلمة مرور. استخدم Google أو الكود الذي يصلك على بريدك.",
  },
  en: {
    error: "We couldn't complete sign-in. Please try again.",
    unauthorized: "This email is not on the Okaab team. Ask an administrator for an invite.",
    invalidCode: "That code is invalid or expired. Request a new code.",
    eyebrow: "ADMIN DASHBOARD",
    title: "Welcome back to Okaab",
    subtitle: "Secure access for approved team members only",
    google: "Continue with Google",
    divider: "or use an email code",
    email: "Email address",
    sendCode: "Send sign-in code",
    sentTo: "We sent a code to",
    code: "Sign-in code",
    confirm: "Verify and continue",
    otherEmail: "Use another email",
    security: "No password needed. Use Google or the one-time code sent to your email.",
  },
  fr: {
    error: "La connexion n’a pas abouti. Réessayez.",
    unauthorized: "Cet e-mail ne fait pas partie de l’équipe Okaab. Demandez une invitation.",
    invalidCode: "Ce code est incorrect ou expiré. Demandez-en un nouveau.",
    eyebrow: "TABLEAU DE BORD ADMIN",
    title: "Bienvenue sur Okaab",
    subtitle: "Accès sécurisé réservé aux membres autorisés",
    google: "Continuer avec Google",
    divider: "ou utiliser un code par e-mail",
    email: "Adresse e-mail",
    sendCode: "Envoyer le code",
    sentTo: "Nous avons envoyé un code à",
    code: "Code de connexion",
    confirm: "Vérifier et continuer",
    otherEmail: "Utiliser un autre e-mail",
    security: "Aucun mot de passe requis. Utilisez Google ou le code reçu par e-mail.",
  },
  es: {
    error: "No pudimos completar el acceso. Inténtalo de nuevo.",
    unauthorized: "Este correo no pertenece al equipo de Okaab. Solicita una invitación.",
    invalidCode: "El código no es válido o ha caducado. Solicita uno nuevo.",
    eyebrow: "PANEL DE ADMINISTRACIÓN",
    title: "Te damos la bienvenida a Okaab",
    subtitle: "Acceso seguro solo para miembros autorizados",
    google: "Continuar con Google",
    divider: "o usar un código por correo",
    email: "Correo electrónico",
    sendCode: "Enviar código de acceso",
    sentTo: "Enviamos un código a",
    code: "Código de acceso",
    confirm: "Verificar y continuar",
    otherEmail: "Usar otro correo",
    security: "No necesitas contraseña. Usa Google o el código enviado a tu correo.",
  },
} as const;

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const clerkError = error as { longMessage?: string; message?: string };
    return clerkError.longMessage || clerkError.message || fallback;
  }
  return fallback;
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.8.51 3.84 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

function AdminLoginPage() {
  const { locale } = useAuthLocale();
  const language = locale.startsWith("ar") ? "ar" : locale;
  const t = ADMIN_COPY[language as keyof typeof ADMIN_COPY] || ADMIN_COPY.en;
  const dir = language === "ar" ? "rtl" : "ltr";
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = fetchStatus === "fetching";

  useEffect(() => {
    if (isLoaded && isSignedIn) window.location.replace("/admin");
  }, [isLoaded, isSignedIn]);

  const continueToAdmin = async () => {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        window.location.href = decorateUrl("/admin");
      },
    });
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/admin",
        continueSignIn: false,
        continueSignUp: false,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t.error));
    }
  };

  const handleEmailCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      signIn.reset();
      const { error } = await signIn.emailCode.sendCode({ emailAddress: email.trim() });
      if (error) {
        setErrorMessage(t.unauthorized);
        return;
      }
      setStep("code");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t.error));
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      const { error } = await signIn.emailCode.verifyCode({ code: code.trim() });
      if (error) {
        setErrorMessage(t.invalidCode);
        return;
      }
      if (signIn.status === "complete") await continueToAdmin();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t.error));
    }
  };

  return (
    <div dir={dir}>
      <header className="text-center">
        <div className="mx-auto grid size-18 place-items-center rounded-3xl bg-[#E8A33D]/10 ring-1 ring-[#E8A33D]/25">
          <img src="/logo-96.webp" alt="عُقاب" className="size-14 object-contain" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-[0.18em] text-[#D88C20]">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black">{t.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ok-ink)]/60">{t.subtitle}</p>
      </header>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-center text-sm leading-6 text-red-500"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-7">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper-2)] px-4 font-bold transition hover:-translate-y-0.5 hover:border-[#E8A33D] hover:bg-[#E8A33D]/10 disabled:cursor-wait disabled:opacity-60"
        >
          {isBusy ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleMark />}
          {t.google}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-[var(--ok-ink)]/40">
          <span className="h-px flex-1 bg-[var(--ok-ink)]/12" />
          {t.divider}
          <span className="h-px flex-1 bg-[var(--ok-ink)]/12" />
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailCode} className="space-y-3">
            <label htmlFor="admin-email" className="block text-sm font-bold">
              {t.email}
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-[var(--ok-ink)]/40"
              />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@okaab.org"
                className="h-13 w-full rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper)] px-12 text-left outline-none transition placeholder:text-[var(--ok-ink)]/35 focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/10"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={isBusy || !email.trim()}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#E8A33D] px-4 font-black text-[#181511] transition hover:bg-[#F0B14D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? <LoaderCircle className="size-5 animate-spin" /> : <KeyRound size={18} />}
              {t.sendCode}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div className="rounded-2xl bg-[#E8A33D]/10 px-4 py-3 text-center text-sm leading-6">
              {t.sentTo} <bdi dir="ltr">{email}</bdi>
            </div>
            <label htmlFor="admin-code" className="block text-sm font-bold">
              {t.code}
            </label>
            <input
              id="admin-code"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
              className="h-14 w-full rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper)] px-4 text-center text-xl font-black tracking-[0.4em] outline-none transition focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/10"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={isBusy || !code.trim()}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#E8A33D] px-4 font-black text-[#181511] transition hover:bg-[#F0B14D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {t.confirm}
            </button>
            <button
              type="button"
              onClick={() => {
                signIn.reset();
                setCode("");
                setErrorMessage("");
                setStep("email");
              }}
              className="mx-auto flex items-center gap-2 py-2 text-xs font-bold text-[var(--ok-ink)]/55 hover:text-[#D88C20]"
            >
              <ArrowRight size={15} />
              {t.otherEmail}
            </button>
          </form>
        )}
      </div>

      <div className="mt-7 flex items-start gap-3 border-t border-[var(--ok-ink)]/10 pt-5 text-xs leading-5 text-[var(--ok-ink)]/55">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#D88C20]" aria-hidden />
        <p>{t.security}</p>
      </div>
    </div>
  );
}
