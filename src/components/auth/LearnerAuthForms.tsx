import { useSignIn, useSignUp } from "@clerk/tanstack-react-start";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { useAuthLocale } from "@/components/auth/AuthExperience";

const COPY = {
  ar: {
    signIn: "أهلًا برجوعك",
    signInSub: "سجّل دخولك وكمل تقدّمك من آخر نقطة.",
    signUp: "ابدأ رحلتك مع عُقاب",
    signUpSub: "أنشئ حساب الطالب وابدأ التعلّم فورًا.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    continue: "تسجيل الدخول",
    create: "إنشاء الحساب",
    google: "المتابعة باستخدام Google",
    or: "أو باستخدام البريد",
    noAccount: "لسه معندكش حساب؟",
    hasAccount: "عندك حساب بالفعل؟",
    makeAccount: "أنشئ حسابًا",
    useAccount: "سجّل دخولك",
    verification: "تأكيد البريد الإلكتروني",
    sentTo: "أرسلنا كود التأكيد إلى",
    code: "كود التأكيد",
    verify: "تأكيد ومتابعة",
    anotherEmail: "استخدام بريد آخر",
    mfa: "تأكيد تسجيل الدخول",
    genericError: "تعذّر إكمال العملية. راجع البيانات وحاول مرة أخرى.",
  },
  en: {
    signIn: "Welcome back",
    signInSub: "Sign in and continue exactly where you left off.",
    signUp: "Start with Okaab",
    signUpSub: "Create your learner account and start learning.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    continue: "Sign in",
    create: "Create account",
    google: "Continue with Google",
    or: "or use your email",
    noAccount: "New to Okaab?",
    hasAccount: "Already have an account?",
    makeAccount: "Create an account",
    useAccount: "Sign in",
    verification: "Verify your email",
    sentTo: "We sent a verification code to",
    code: "Verification code",
    verify: "Verify and continue",
    anotherEmail: "Use another email",
    mfa: "Verify your sign-in",
    genericError: "We couldn't complete that request. Check your details and try again.",
  },
} as const;

function useCopy() {
  const { locale } = useAuthLocale();
  return { t: locale.startsWith("ar") ? COPY.ar : COPY.en, rtl: locale.startsWith("ar") };
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

function messageFrom(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const value = error as { longMessage?: string; message?: string };
    return value.longMessage || value.message || fallback;
  }
  return fallback;
}

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--ok-ink)]/40">
        {icon}
      </span>
      <input
        {...props}
        className="h-13 w-full rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper-2)] px-12 outline-none placeholder:text-[var(--ok-ink)]/35 focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/10"
      />
    </div>
  );
}

function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="text-center">
      <img src="/logo-96.webp" alt="عُقاب" className="mx-auto size-16 object-contain" />
      <h1 className="mt-3 text-3xl font-black">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ok-ink)]/60">{subtitle}</p>
    </header>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-[var(--ok-ink)]/40">
      <span className="h-px flex-1 bg-[var(--ok-ink)]/12" />
      {children}
      <span className="h-px flex-1 bg-[var(--ok-ink)]/12" />
    </div>
  );
}

export function LearnerSignInForm() {
  const { t, rtl } = useCopy();
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const busy = fetchStatus === "fetching";

  const finalize = async () => {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        window.location.href = decorateUrl("/courses");
      },
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      signIn.reset();
      const { error } = await signIn.password({ identifier: email.trim(), password });
      if (error) return setErrorMessage(messageFrom(error, t.genericError));
      if (signIn.status === "complete") return void finalize();
      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        const { error: mfaError } = await signIn.mfa.sendEmailCode();
        if (mfaError) return setErrorMessage(messageFrom(mfaError, t.genericError));
        setStep("mfa");
      }
    } catch (error) {
      setErrorMessage(messageFrom(error, t.genericError));
    }
  };

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) return setErrorMessage(messageFrom(error, t.genericError));
      if (signIn.status === "complete") await finalize();
    } catch (error) {
      setErrorMessage(messageFrom(error, t.genericError));
    }
  };

  const google = async () => {
    setErrorMessage("");
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: "/courses",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) setErrorMessage(messageFrom(error, t.genericError));
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <AuthHeading
        title={step === "mfa" ? t.mfa : t.signIn}
        subtitle={step === "mfa" ? `${t.sentTo} ${email}` : t.signInSub}
      />
      {errorMessage ? (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-500"
        >
          {errorMessage}
        </p>
      ) : null}
      {step === "credentials" ? (
        <>
          <button
            type="button"
            onClick={() => void google()}
            disabled={busy}
            className="mt-6 flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper-2)] font-bold hover:border-[#E8A33D] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleMark />} {t.google}
          </button>
          <Divider>{t.or}</Divider>
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="learner-email" className="block text-sm font-bold">
              {t.email}
            </label>
            <Field
              id="learner-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              icon={<Mail size={18} />}
            />
            <label htmlFor="learner-password" className="block pt-1 text-sm font-bold">
              {t.password}
            </label>
            <Field
              id="learner-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              dir="ltr"
              icon={<LockKeyhole size={18} />}
            />
            <button
              disabled={busy || !email.trim() || !password}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E8A33D] font-black text-[#181511] hover:bg-[#F0B14D] disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-5 animate-spin" /> : <KeyRound size={18} />}{" "}
              {t.continue} {rtl ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--ok-ink)]/60">
            {t.noAccount}{" "}
            <a
              href="/sign-up/"
              className="font-black text-[var(--ok-accent-text)] underline decoration-[#E8A33D] underline-offset-4"
            >
              {t.makeAccount}
            </a>
          </p>
        </>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          <label htmlFor="learner-mfa" className="block text-sm font-bold">
            {t.code}
          </label>
          <Field
            id="learner-mfa"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="000000"
            dir="ltr"
            icon={<CheckCircle2 size={18} />}
          />
          <button
            disabled={busy || !code.trim()}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E8A33D] font-black text-[#181511] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <CheckCircle2 size={18} />}{" "}
            {t.verify}
          </button>
          <button
            type="button"
            onClick={() => {
              signIn.reset();
              setStep("credentials");
              setCode("");
              setErrorMessage("");
            }}
            className="mx-auto flex items-center gap-2 py-2 text-xs font-bold text-[var(--ok-ink)]/55"
          >
            {rtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.anotherEmail}
          </button>
        </form>
      )}
    </div>
  );
}

export function LearnerSignUpForm() {
  const { t, rtl } = useCopy();
  const { signUp, fetchStatus } = useSignUp();
  const [step, setStep] = useState<"details" | "verification">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const busy = fetchStatus === "fetching";

  const finalize = async () => {
    await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        window.location.href = decorateUrl("/courses");
      },
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      signUp.reset();
      const parts = name.trim().split(/\s+/);
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || undefined,
      });
      if (error) return setErrorMessage(messageFrom(error, t.genericError));
      if (signUp.status === "complete") return void finalize();
      const { error: verificationError } = await signUp.verifications.sendEmailCode();
      if (verificationError) return setErrorMessage(messageFrom(verificationError, t.genericError));
      setStep("verification");
    } catch (error) {
      setErrorMessage(messageFrom(error, t.genericError));
    }
  };

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (error) return setErrorMessage(messageFrom(error, t.genericError));
      if (signUp.status === "complete") await finalize();
    } catch (error) {
      setErrorMessage(messageFrom(error, t.genericError));
    }
  };

  const google = async () => {
    setErrorMessage("");
    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: "/courses",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) setErrorMessage(messageFrom(error, t.genericError));
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <AuthHeading
        title={step === "verification" ? t.verification : t.signUp}
        subtitle={step === "verification" ? `${t.sentTo} ${email}` : t.signUpSub}
      />
      {errorMessage ? (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-500"
        >
          {errorMessage}
        </p>
      ) : null}
      {step === "details" ? (
        <>
          <button
            type="button"
            onClick={() => void google()}
            disabled={busy}
            className="mt-6 flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--ok-ink)]/15 bg-[var(--ok-paper-2)] font-bold hover:border-[#E8A33D] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleMark />} {t.google}
          </button>
          <Divider>{t.or}</Divider>
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="signup-name" className="block text-sm font-bold">
              {t.name}
            </label>
            <Field
              id="signup-name"
              required
              autoComplete="name"
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              icon={<UserRound size={18} />}
            />
            <label htmlFor="signup-email" className="block pt-1 text-sm font-bold">
              {t.email}
            </label>
            <Field
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              icon={<Mail size={18} />}
            />
            <label htmlFor="signup-password" className="block pt-1 text-sm font-bold">
              {t.password}
            </label>
            <Field
              id="signup-password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              dir="ltr"
              icon={<LockKeyhole size={18} />}
            />
            <div id="clerk-captcha" />
            <button
              disabled={busy || !name.trim() || !email.trim() || !password}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E8A33D] font-black text-[#181511] hover:bg-[#F0B14D] disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-5 animate-spin" /> : <UserRound size={18} />}{" "}
              {t.create} {rtl ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--ok-ink)]/60">
            {t.hasAccount}{" "}
            <a
              href="/sign-in/"
              className="font-black text-[var(--ok-accent-text)] underline decoration-[#E8A33D] underline-offset-4"
            >
              {t.useAccount}
            </a>
          </p>
        </>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          <label htmlFor="signup-code" className="block text-sm font-bold">
            {t.code}
          </label>
          <Field
            id="signup-code"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="000000"
            dir="ltr"
            icon={<CheckCircle2 size={18} />}
          />
          <button
            disabled={busy || !code.trim()}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E8A33D] font-black text-[#181511] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <CheckCircle2 size={18} />}{" "}
            {t.verify}
          </button>
          <button
            type="button"
            onClick={() => {
              signUp.reset();
              setStep("details");
              setCode("");
              setErrorMessage("");
            }}
            className="mx-auto flex items-center gap-2 py-2 text-xs font-bold text-[var(--ok-ink)]/55"
          >
            {rtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.anotherEmail}
          </button>
        </form>
      )}
    </div>
  );
}
