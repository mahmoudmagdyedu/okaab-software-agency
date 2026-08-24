import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { changePasswordFn, getCurrentUserFn } from "../lib/auth.functions";

export const Route = createFileRoute("/change-password")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    return { user };
  },
  head: () => ({ meta: [{ title: "تغيير كلمة المرور — بُنّ الديرة" }] }),
  component: ChangePasswordPage,
});

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-border-subtle bg-bg-base px-3 text-left text-body text-text-primary focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandLogo />
          <span className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-3 text-h1 font-semibold text-text-primary">أنشئ كلمة مرور خاصة بك</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            كلمة المرور المؤقتة صالحة لأول دخول فقط.
          </p>
        </div>
        <form
          className="space-y-4 rounded-xl border border-border-subtle bg-bg-base p-6 sm:p-8"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const newPassword = String(form.get("newPassword") ?? "");
            if (newPassword !== String(form.get("confirmPassword") ?? "")) {
              setError("تأكيد كلمة المرور غير مطابق");
              return;
            }
            setLoading(true);
            setError("");
            try {
              await changePasswordFn({
                data: {
                  currentPassword: String(form.get("currentPassword") ?? ""),
                  newPassword,
                },
              });
              await navigate({ to: "/admin/reports" });
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "تعذر تغيير كلمة المرور");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block text-body-sm font-medium">
            كلمة المرور المؤقتة
            <input
              name="currentPassword"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block text-body-sm font-medium">
            كلمة المرور الجديدة
            <input
              name="newPassword"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block text-body-sm font-medium">
            تأكيد كلمة المرور
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              dir="ltr"
              className={inputClass}
            />
          </label>
          <p className="text-caption leading-5 text-text-muted">
            12 حرفًا على الأقل، وتضم حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا.
          </p>
          {error && (
            <p role="alert" className="rounded-lg bg-error-bg px-3 py-2 text-body-sm text-error">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {loading ? "جارٍ الحفظ..." : "حفظ والمتابعة"}
          </button>
        </form>
      </div>
    </div>
  );
}
