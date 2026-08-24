import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/mawid/auth-layout";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "تأكيد البريد الإلكتروني — مَوعِد" },
      { name: "description", content: "فعّل حسابك عبر رابط التأكيد المرسل إلى بريدك الإلكتروني." },
      { property: "og:title", content: "تأكيد البريد الإلكتروني — مَوعِد" },
      {
        property: "og:description",
        content: "فعّل حسابك عبر رابط التأكيد المرسل إلى بريدك الإلكتروني.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [pending, setPending] = useState(false);

  const resend = async () => {
    if (!email) return;
    setPending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setPending(false);
    setState(error ? "error" : "sent");
  };

  return (
    <AuthLayout
      title="أكّد بريدك الإلكتروني"
      subtitle="أرسلنا رابط التفعيل. افتحه من بريدك لتتمكن من الدخول."
      footer={
        <Link to="/login" className="font-medium text-[var(--accent-600)] hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
          <MailCheck className="size-5 shrink-0 text-[var(--accent-600)]" strokeWidth={1.5} />
          <p className="text-body-sm text-[var(--text-secondary)]">
            {email ? (
              <>
                أرسلنا الرابط إلى <span className="mono-ltr">{email}</span>
              </>
            ) : (
              "افتح رابط التفعيل من بريدك الإلكتروني لإكمال إنشاء الحساب."
            )}
          </p>
        </div>

        {state === "sent" ? <InlineAlert tone="success">أعدنا إرسال الرابط.</InlineAlert> : null}
        {state === "error" ? (
          <InlineAlert tone="danger">تعذّر إعادة الإرسال الآن. حاول بعد قليل.</InlineAlert>
        ) : null}

        {email ? (
          <Button variant="secondary" className="w-full" loading={pending} onClick={resend}>
            إعادة إرسال رابط التفعيل
          </Button>
        ) : null}
      </div>
    </AuthLayout>
  );
}
