import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { requestAccessFn } from "../lib/auth.functions";

export const Route = createFileRoute("/request-access")({
  head: () => ({
    meta: [
      { title: "طلب صلاحية — بُنّ الديرة" },
      { name: "description", content: "طلب حساب جديد على منصة بُنّ الديرة." },
    ],
  }),
  component: RequestAccessPage,
});

const inputClass =
  "h-11 w-full rounded-lg border border-border-subtle bg-bg-base px-3 text-body text-text-primary placeholder:text-text-muted focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function RequestAccessPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-base p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-h1 font-semibold text-text-primary">تم استلام طلبك</h1>
          <p className="mt-2 text-body-sm leading-6 text-text-secondary">
            سيراجع السوبر أدمن البيانات. بعد الموافقة ستحصل على حساب وكلمة مرور مؤقتة.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-body-sm font-semibold text-primary-foreground"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-subtle px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-7 flex flex-col items-center text-center">
          <Link to="/">
            <BrandLogo />
          </Link>
          <h1 className="mt-5 text-h1 font-semibold text-text-primary">طلب صلاحية دخول</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            أرسل بياناتك للمراجعة، ولن يتم تفعيل الحساب قبل موافقة السوبر أدمن.
          </p>
        </div>

        <form
          className="space-y-4 rounded-xl border border-border-subtle bg-bg-base p-6 sm:p-8"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            const form = new FormData(event.currentTarget);
            try {
              await requestAccessFn({
                data: {
                  fullName: String(form.get("fullName") ?? ""),
                  email: String(form.get("email") ?? ""),
                  organizationName: String(form.get("organizationName") ?? ""),
                  requestedRole: String(form.get("requestedRole")) as "admin" | "employee",
                  reason: String(form.get("reason") ?? ""),
                },
              });
              setSent(true);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "تعذر إرسال الطلب");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-body-sm font-medium text-text-primary">
              الاسم الكامل
              <input name="fullName" required minLength={2} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-body-sm font-medium text-text-primary">
              البريد الإلكتروني
              <input
                name="email"
                type="email"
                required
                dir="ltr"
                className={`${inputClass} mt-1.5 text-left`}
              />
            </label>
          </div>
          <label className="text-body-sm font-medium text-text-primary">
            اسم المنشأة
            <span className="relative mt-1.5 block">
              <Building2 className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input name="organizationName" className={`${inputClass} ps-10`} />
            </span>
          </label>
          <label className="text-body-sm font-medium text-text-primary">
            الصلاحية المطلوبة
            <select name="requestedRole" className={`${inputClass} mt-1.5`} defaultValue="employee">
              <option value="employee">موظف</option>
              <option value="admin">أدمن منشأة</option>
            </select>
          </label>
          <label className="text-body-sm font-medium text-text-primary">
            سبب الطلب
            <textarea
              name="reason"
              rows={4}
              maxLength={1000}
              className="mt-1.5 w-full resize-none rounded-lg border border-border-subtle bg-bg-base px-3 py-2 text-body text-text-primary focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-error-bg px-3 py-2 text-body-sm text-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>
          <p className="text-center text-caption text-text-secondary">
            لديك حساب؟{" "}
            <Link to="/login" className="font-semibold text-accent-700 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
