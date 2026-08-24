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

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — مَوعِد" },
      { name: "description", content: "ادخل إلى لوحة إدارة مواعيد منشأتك على منصة مَوعِد." },
      { property: "og:title", content: "تسجيل الدخول — مَوعِد" },
      {
        property: "og:description",
        content: "ادخل إلى لوحة إدارة مواعيد منشأتك على منصة مَوعِد.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            : "تعذّر تسجيل الدخول الآن. حاول مرة أخرى.",
        );
        return;
      }
      await navigate({ to: "/app" });
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
    setError("تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى.");
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="ادخل ببيانات حسابك لإدارة مواعيد منشأتك."
      footer={
        <span>
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-medium text-[var(--accent-600)] hover:underline">
            أنشئ حسابًا جديدًا
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">كلمة المرور</Label>
            <Link
              to="/forgot-password"
              className="text-body-sm text-[var(--accent-600)] hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" loading={pending}>
          دخول
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
