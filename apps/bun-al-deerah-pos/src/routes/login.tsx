import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { loginFn } from "../lib/auth.functions";
import { withBasePath } from "../lib/base-path";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — بُنّ الديرة" },
      { name: "description", content: "دخول الحسابات المصرح لها في منصة بُنّ الديرة." },
    ],
  }),
  component: LoginPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";
const inputCls =
  "h-11 w-full rounded-lg border border-border-subtle bg-bg-base px-3 text-body text-text-primary placeholder:text-text-muted focus:border-ring focus:outline-none";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <Link to="/">
            <BrandLogo />
          </Link>
          <h1 className="mt-5 text-h1 font-semibold text-text-primary">الدخول إلى المنصة</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            استخدم الحساب الذي أنشأه الأدمن لك.
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-base p-6 shadow-[0_20px_50px_-35px_rgb(18_62_50/0.6)] sm:p-8">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setLoading(true);
              const form = new FormData(event.currentTarget);
              try {
                const result = await loginFn({
                  data: {
                    email: String(form.get("email") ?? ""),
                    password: String(form.get("password") ?? ""),
                  },
                });
                await navigate({
                  to: result.passwordResetRequired ? "/change-password" : "/admin/reports",
                });
              } catch (reason) {
                setError(reason instanceof Error ? reason.message : "تعذر تسجيل الدخول");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                placeholder="name@example.com"
                className={`${inputCls} text-left`}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                dir="ltr"
                className={`${inputCls} text-left`}
              />
            </div>
            {error && (
              <p role="alert" className="rounded-lg bg-error-bg px-3 py-2 text-body-sm text-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60 ${focusRing}`}
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {loading ? "جارٍ التحقق..." : "دخول"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-caption text-text-muted">
            <span className="h-px flex-1 bg-border-subtle" />
            أو
            <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <a
            href={withBasePath("/admin/reports?demo=super_admin")}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-base text-body-sm font-medium text-text-primary hover:bg-bg-subtle ${focusRing}`}
          >
            <ShieldCheck className="h-4 w-4" /> تجربة المحاكاة بدون حساب
          </a>
          <p className="mt-5 text-center text-caption text-text-secondary">
            تحتاج حسابًا؟{" "}
            <Link to="/request-access" className="font-semibold text-accent-700 hover:underline">
              اطلب صلاحية دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
