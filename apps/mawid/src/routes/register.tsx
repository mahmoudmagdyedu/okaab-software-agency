import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/mawid/auth-layout";
import { GoogleMark } from "@/components/mawid/google-mark";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withBasePath } from "@/lib/base-path";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — مَوعِد" },
      { name: "description", content: "أنشئ حساب منشأتك على مَوعِد وابدأ استقبال الحجوزات." },
      { property: "og:title", content: "إنشاء حساب — مَوعِد" },
      {
        property: "og:description",
        content: "أنشئ حساب منشأتك على مَوعِد وابدأ استقبال الحجوزات.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن ٨ أحرف.");
      return;
    }
    setPending(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${withBasePath("/app")}`,
          data: { full_name: fullName, phone },
        },
      });
      if (signUpError) {
        setError(
          signUpError.message.includes("already registered")
            ? "هذا البريد الإلكتروني مسجّل بالفعل."
            : "تعذّر إنشاء الحساب الآن. حاول مرة أخرى.",
        );
        return;
      }
      if (data.session) {
        await navigate({ to: "/app" });
        return;
      }
      await navigate({ to: "/verify-email", search: { email } });
    } catch {
      setError("تعذّر الاتصال بالخدمة. تحقّق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setPending(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${withBasePath("/app")}` },
      });
      if (!oauthError) return;
    } catch {
      // الرسالة الموحدة أدناه أوضح من تفاصيل مزود OAuth للزائر.
    }
    setPending(false);
    setError("تعذّر إنشاء الحساب عبر Google. حاول مرة أخرى.");
  };

  return (
    <AuthLayout
      title="إنشاء حساب"
      subtitle="سجّل منشأتك وابدأ إدارة المواعيد خلال دقائق."
      footer={
        <span>
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-medium text-[var(--accent-600)] hover:underline">
            سجّل الدخول
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

        <div className="space-y-2">
          <Label htmlFor="full-name">الاسم الكامل</Label>
          <Input
            id="full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            required
            dir="ltr"
            className="mono-ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الجوال</Label>
          <Input
            id="phone"
            type="tel"
            required
            dir="ltr"
            className="mono-ltr"
            placeholder="+201001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-caption text-[var(--text-muted)]">٨ أحرف على الأقل.</p>
        </div>

        <Button type="submit" className="w-full" loading={pending}>
          إنشاء الحساب
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="text-caption text-[var(--text-muted)]">أو</span>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={pending}
          onClick={onGoogle}
        >
          <GoogleMark />
          المتابعة عبر حساب Google
        </Button>
      </form>
    </AuthLayout>
  );
}
