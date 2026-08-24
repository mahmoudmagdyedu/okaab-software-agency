import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/mawid/auth-layout";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withBasePath } from "@/lib/base-path";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "استعادة كلمة المرور — مَوعِد" },
      { name: "description", content: "أرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني." },
      { property: "og:title", content: "استعادة كلمة المرور — مَوعِد" },
      {
        property: "og:description",
        content: "أرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${withBasePath("/login")}`,
      });
      if (resetError) {
        setError("تعذّر إرسال الرابط الآن. حاول مرة أخرى.");
        return;
      }
      setSent(true);
    } catch {
      setError("تعذّر الاتصال بالخدمة. تحقّق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين."
      footer={
        <Link to="/login" className="font-medium text-[var(--accent-600)] hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <InlineAlert tone="success">
            أرسلنا رابط إعادة التعيين إلى <span className="mono-ltr">{email}</span>. تفقّد بريدك
            خلال دقائق.
          </InlineAlert>
          <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
            إرسال الرابط مرة أخرى
          </Button>
        </div>
      ) : (
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
          <Button type="submit" className="w-full" loading={pending}>
            إرسال رابط الاستعادة
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
