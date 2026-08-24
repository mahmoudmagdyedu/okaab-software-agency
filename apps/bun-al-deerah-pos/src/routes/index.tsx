import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Eye, HeartPulse, ShieldCheck, UserCog, Users } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { withBasePath } from "../lib/base-path";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بُنّ الديرة — منصة نقاط البيع وإدارة الفريق" },
      {
        name: "description",
        content: "ادخل إلى منصة بُنّ الديرة أو جرّب محاكاة الصلاحيات لكل الأدوار.",
      },
    ],
  }),
  component: PlatformEntry,
});

const demos = [
  {
    role: "super_admin",
    href: withBasePath("/admin/reports?demo=super_admin"),
    title: "سوبر أدمن",
    copy: "إدارة المنصة، قبول طلبات الوصول، إنشاء الأدمن ومراجعة كل المنشآت.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    role: "admin",
    href: withBasePath("/admin/reports?demo=admin"),
    title: "أدمن المنشأة",
    copy: "إنشاء حسابات الموظفين، توزيع الأدوار، ومتابعة المبيعات والفروع.",
    icon: <UserCog className="h-6 w-6" />,
  },
  {
    role: "employee",
    href: withBasePath("/admin/shifts?demo=employee"),
    title: "موظف",
    copy: "تجربة مساحة الموظف والكاشير والمطبخ حسب الصلاحية الممنوحة.",
    icon: <Users className="h-6 w-6" />,
  },
] as const;

function PlatformEntry() {
  return (
    <div className="min-h-screen bg-bg-subtle px-4 py-8 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Link
              to="/request-access"
              className="hidden h-10 items-center rounded-full border border-border-subtle bg-bg-base px-4 text-body-sm font-medium text-text-primary hover:bg-bg-subtle sm:flex"
            >
              طلب صلاحية
            </Link>
            <Link
              to="/login"
              className="flex h-10 items-center rounded-full bg-primary px-5 text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              تسجيل الدخول
            </Link>
          </div>
        </header>

        <main className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-caption font-semibold text-accent-700">
              <BadgeCheck className="h-4 w-4" />
              منصة تشغيل متكاملة
            </span>
            <h1 className="mt-5 max-w-2xl text-[40px] font-semibold leading-[1.18] text-text-primary sm:text-[54px]">
              كل عمليات بُنّ الديرة في مكان واحد.
            </h1>
            <p className="mt-5 max-w-xl text-body leading-8 text-text-secondary sm:text-[17px]">
              نقاط البيع، الفواتير، المخزون، الفروع، الموظفون والصلاحيات — مع تجربة محاكاة آمنة قبل
              الدخول الحقيقي.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                دخول الحساب
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <a
                href={withBasePath("/admin/reports?demo=super_admin")}
                className="flex h-12 items-center gap-2 rounded-full border border-border-subtle bg-bg-base px-6 text-body-sm font-semibold text-text-primary hover:bg-bg-subtle"
              >
                <Eye className="h-4 w-4" />
                ابدأ المحاكاة
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-caption text-text-muted">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> صلاحيات حسب الدور
              </span>
              <span className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-success" /> Health Check مباشر
              </span>
            </div>
          </div>

          <section className="rounded-2xl border border-border-subtle bg-bg-base p-5 shadow-[0_24px_80px_-50px_rgb(18_62_50/0.7)] sm:p-7">
            <div className="mb-5">
              <p className="text-micro text-text-muted">محاكاة الأدوار</p>
              <h2 className="mt-1 text-h2 font-semibold text-text-primary">
                اختر المنظور الذي تريد تجربته
              </h2>
              <p className="mt-1 text-caption text-text-secondary">
                المحاكاة لا تغيّر البيانات الحقيقية.
              </p>
            </div>
            <div className="space-y-3">
              {demos.map((demo) => (
                <a
                  key={demo.role}
                  href={demo.href}
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle p-4 transition-colors hover:border-accent-400 hover:bg-accent-50/60"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-ink-foreground">
                    {demo.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body font-semibold text-text-primary">
                      {demo.title}
                    </span>
                    <span className="mt-0.5 block text-caption leading-5 text-text-secondary">
                      {demo.copy}
                    </span>
                  </span>
                  <ArrowLeft className="ms-auto h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:-translate-x-1" />
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
