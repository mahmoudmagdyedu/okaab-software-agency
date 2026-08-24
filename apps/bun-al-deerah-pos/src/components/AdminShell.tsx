import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChefHat,
  ChevronDown,
  FileText,
  LogOut,
  Lock,
  Menu,
  MonitorSmartphone,
  Package,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  Settings,
  Timer,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUserFn, logoutFn } from "../lib/auth.functions";
import { roleLabels, type SessionUser, type SystemRole } from "../lib/auth-types";
import { roles, type Role } from "../lib/data";
import { withBasePath } from "../lib/base-path";
import { BrandLogo } from "./BrandLogo";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  allow: Role[];
};

const navItems: NavItem[] = [
  {
    to: "/admin/reports",
    label: "نظرة عامة",
    icon: <MonitorSmartphone className="h-[18px] w-[18px]" />,
    allow: ["مالك", "محاسب", "مشرف فرع"],
  },
  {
    to: "/admin/shifts",
    label: "الشفتات",
    icon: <Timer className="h-[18px] w-[18px]" />,
    allow: ["مالك", "مشرف فرع", "كاشير"],
  },
  {
    to: "/admin/invoices",
    label: "الفواتير",
    icon: <ReceiptText className="h-[18px] w-[18px]" />,
    allow: ["مالك", "محاسب", "مشرف فرع"],
  },
  {
    to: "/admin/einvoice",
    label: "الفوترة الإلكترونية",
    icon: <FileText className="h-[18px] w-[18px]" />,
    allow: ["مالك", "محاسب"],
  },
  {
    to: "/admin/products",
    label: "الأصناف",
    icon: <Package className="h-[18px] w-[18px]" />,
    allow: ["مالك", "مدير مخزون", "مشرف فرع"],
  },
  {
    to: "/admin/inventory",
    label: "المخزون",
    icon: <Boxes className="h-[18px] w-[18px]" />,
    allow: ["مالك", "مدير مخزون"],
  },
  {
    to: "/admin/users",
    label: "المستخدمون والصلاحيات",
    icon: <UsersRound className="h-[18px] w-[18px]" />,
    allow: ["مالك", "مشرف فرع"],
  },
  {
    to: "/admin/settings",
    label: "الإعدادات",
    icon: <Settings className="h-[18px] w-[18px]" />,
    allow: ["مالك"],
  },
];

function displayRole(role: SystemRole): Role {
  if (role === "accountant") return "محاسب";
  if (role === "manager" || role === "admin") return "مشرف فرع";
  if (role === "inventory") return "مدير مخزون";
  if (role === "cashier" || role === "kitchen" || role === "employee") return "كاشير";
  return "مالك";
}

const surfaces = [
  {
    to: "/pos",
    label: "شاشة الكاشير",
    icon: <MonitorSmartphone className="h-[18px] w-[18px]" />,
  },
  { to: "/kds", label: "شاشة المطبخ", icon: <ChefHat className="h-[18px] w-[18px]" /> },
  { to: "/menu", label: "منيو الطاولات", icon: <QrCode className="h-[18px] w-[18px]" /> },
];

export function AdminShell({ children }: { children?: ReactNode }) {
  const [role, setRole] = useState<Role>("مالك");
  const [navOpen, setNavOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const demoRole = new URLSearchParams(searchStr).get("demo") as SystemRole | null;
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => setNavOpen(false), [pathname]);
  useEffect(() => {
    if (demoRole && roleLabels[demoRole]) {
      setRole(displayRole(demoRole));
      setUser(null);
      return;
    }
    void getCurrentUserFn().then((current) => {
      setUser(current);
      if (current) setRole(displayRole(current.role));
    });
  }, [demoRole]);

  const isActive = (to: string) => pathname.startsWith(to);

  const navigation = (
    <>
      <p className="px-5 pb-2 pt-3 text-[10px] font-semibold tracking-[0.22em] text-[#789287]">
        الإدارة
      </p>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const allowed = item.allow.includes(role);
          const active = isActive(item.to);
          if (!allowed) {
            return (
              <span
                key={item.to}
                title={`مخفية عن دور «${role}»`}
                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-md px-3 text-body-sm text-[#6e897d] opacity-60"
              >
                {item.icon}
                <span>{item.label}</span>
                <Lock className="ms-auto h-3.5 w-3.5" />
              </span>
            );
          }
          return (
            <a
              key={item.to}
              href={withBasePath(demoRole ? `${item.to}?demo=${demoRole}` : item.to)}
              className={`group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-body-sm font-medium transition-colors ${focusRing} ${
                active
                  ? "bg-[#ffffff14] text-[#f8f2e2]"
                  : "text-[#a8bbb2] hover:bg-[#ffffff0a] hover:text-[#f8f2e2]"
              }`}
            >
              <span className={active ? "text-[#d3a73f]" : "text-[#789287]"}>{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-[#d3a73f]" />
              )}
            </a>
          );
        })}
      </nav>

      <p className="px-5 pb-2 pt-7 text-[10px] font-semibold tracking-[0.22em] text-[#789287]">
        التشغيل
      </p>
      <nav className="space-y-1 px-3">
        {surfaces.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-body-sm font-medium text-[#a8bbb2] transition-colors hover:bg-[#ffffff0a] hover:text-[#f8f2e2] ${focusRing}`}
          >
            <span className="text-[#789287]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-subtle text-text-primary">
      <aside className="fixed inset-y-0 start-0 z-50 hidden w-64 flex-col bg-[#123e32] lg:flex">
        <a
          href={withBasePath(demoRole ? `/admin/reports?demo=${demoRole}` : "/admin/reports")}
          className={`flex h-[86px] items-center border-b border-white/10 px-6 ${focusRing}`}
        >
          <BrandLogo inverse />
        </a>
        <div className="min-h-0 flex-1 overflow-y-auto py-4">{navigation}</div>
        <div className="m-4 rounded-lg border border-white/10 bg-[#ffffff0a] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d3a73f] text-body-sm font-bold text-[#123e32]">
              ن
            </span>
            <span className="min-w-0">
              <span className="block truncate text-body-sm font-semibold text-[#f8f2e2]">
                {user?.fullName ?? (demoRole ? `زائر · ${roleLabels[demoRole]}` : "نورة العتيبي")}
              </span>
              <span className="block text-caption text-[#789287]">
                {demoRole
                  ? "محاكاة دون بيانات حقيقية"
                  : user
                    ? roleLabels[user.role]
                    : "مديرة العمليات"}
              </span>
            </span>
          </div>
        </div>
      </aside>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 flex min-h-[70px] items-center gap-3 border-b border-border-subtle bg-bg-base/95 px-4 backdrop-blur sm:px-7">
          <button
            aria-label="فتح القائمة"
            onClick={() => setNavOpen(true)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-secondary lg:hidden ${focusRing}`}
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo compact className="lg:hidden" />

          {demoRole && (
            <a
              href={withBasePath("/")}
              title="إنهاء المحاكاة"
              className="hidden items-center gap-2 rounded-full bg-accent-50 px-3 py-1.5 text-caption font-semibold text-accent-700 sm:flex"
            >
              وضع المحاكاة · {roleLabels[demoRole]}
              <X className="h-3.5 w-3.5" />
            </a>
          )}

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              placeholder="ابحث في الفواتير والأصناف والموظفين..."
              className={`h-10 w-full rounded-full border border-border-subtle bg-bg-base ps-11 pe-4 text-body-sm placeholder:text-text-muted focus:border-ring focus:outline-none ${focusRing}`}
            />
          </div>

          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <button
              aria-label="الإشعارات"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-base text-text-secondary transition-colors hover:bg-bg-subtle ${focusRing}`}
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-bg-base bg-hero" />
            </button>
            {!demoRole && (
              <label className="relative hidden items-center sm:flex">
                <select
                  aria-label="تبديل الدور"
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  className={`h-10 cursor-pointer appearance-none rounded-full border border-border-subtle bg-bg-base pe-9 ps-4 text-body-sm font-medium text-text-primary ${focusRing}`}
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 h-4 w-4 text-text-muted" />
              </label>
            )}
            {!demoRole && user && (
              <button
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
                onClick={async () => {
                  await logoutFn();
                  window.location.assign(withBasePath("/login"));
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-base text-text-secondary hover:bg-bg-subtle ${focusRing}`}
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            )}
            <Link
              to="/pos"
              className={`flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">طلب جديد</span>
            </Link>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-7">{children ?? <Outlet />}</main>
        <footer className="flex flex-wrap items-center justify-between gap-2 px-4 pb-6 pt-2 text-[10px] tracking-[0.15em] text-text-muted sm:px-7">
          <p>بُنّ الديرة · نظام نقاط البيع</p>
          <p className="num">POS v2.0 · 2026</p>
        </footer>
      </div>

      {navOpen && (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-72 flex-col bg-[#123e32] transition-transform duration-200 lg:hidden ${
          navOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <BrandLogo inverse />
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setNavOpen(false)}
            className="flex h-10 w-10 items-center justify-center text-[#a8bbb2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-3">{navigation}</div>
      </aside>
    </div>
  );
}
