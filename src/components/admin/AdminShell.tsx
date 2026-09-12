import { Link, useRouterState } from "@tanstack/react-router";
import { useClerk, useUser } from "@clerk/tanstack-react-start";
import {
  Activity,
  BookOpen,
  CircleHelp,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings2,
  Sun,
  Users,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toaster } from "sonner";

import { OkaabStyles } from "@/components/okaab/SiteChrome";
import { getDocumentNonce } from "@/lib/csp-client";
import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import type { AppRole, Profile } from "@/integrations/supabase/types";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { hasMinimumRole } from "@/lib/roles";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "سوبر أدمن",
  admin: "أدمن",
  team_leader: "تيم ليدر",
  employee: "موظف",
  student: "طالب",
};

type AdminAuthValue = {
  loading: boolean;
  signedIn: boolean;
  error: string | null;
  profile: Profile | null;
  reload: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isLoaded || !isSignedIn) {
      setProfile(null);
      setLoading(!isLoaded);
      return;
    }
    try {
      const response = await fetch("/api/admin/me", {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      const result = await response.json().catch(() => ({ profile: null }));
      setProfile(response.ok && result.profile?.is_active ? result.profile : null);
      if (response.status >= 500) setError("تعذّر التحقق من صلاحيات الإدارة حاليًا.");
    } catch {
      setProfile(null);
      setError("تعذّر الاتصال بخدمة تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void reload();
  }, [reload, user?.id]);

  const value = useMemo(
    () => ({ loading, signedIn: Boolean(isSignedIn), error, profile, reload }),
    [loading, isSignedIn, error, profile, reload],
  );
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminLayout");
  return value;
}

const navItems = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/admin/tasks", label: "الجدول والمهام", icon: CalendarDays },
  { to: "/admin/team", label: "الفرق والصلاحيات", icon: Users },
  { to: "/admin/courses", label: "الكورسات", icon: BookOpen },
  { to: "/admin/questions", label: "بنك الأسئلة", icon: CircleHelp },
  { to: "/admin/learning", label: "منصة التعلّم", icon: Settings2 },
  { to: "/admin/health", label: "حالة النظام", icon: Activity },
] as const;

function AdminGate({ children }: { children: ReactNode }) {
  const { loading, signedIn, error, profile, reload } = useAdminAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <div className="text-center">
          <img
            src="/logo-96.webp"
            alt="عُقاب"
            className="mx-auto size-14 animate-pulse object-contain"
          />
          <p className="mt-4 text-sm opacity-70">جاري التحقق من صلاحية الدخول…</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ok-paper)] px-4 text-[var(--ok-ink)]">
        <div className="max-w-md rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center">
          <h1 className="font-display text-3xl font-bold">تعذّر فتح لوحة الإدارة</h1>
          <p className="mt-3 leading-7 opacity-70">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-6 rounded-full bg-[#E8A33D] px-6 py-3 font-bold text-[#181511]"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ok-paper)] px-4 text-[var(--ok-ink)]">
        <div className="max-w-md rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center shadow-[8px_8px_0_var(--ok-ink)]">
          <img src="/logo-96.webp" alt="عُقاب" className="mx-auto size-16 object-contain" />
          <h1 className="mt-5 font-display text-3xl font-bold">
            {signedIn ? "الحساب الحالي ليس إداريًا" : "دخول الإدارة مطلوب"}
          </h1>
          <p className="mt-3 leading-7 opacity-70">
            {signedIn
              ? "أنت مسجّل كمتعلم، ولا يملك هذا الحساب صلاحية فتح لوحة الإدارة."
              : "سجّل الدخول بالبريد المدعو للوصول إلى لوحة عُقاب."}
          </p>
          {!signedIn && (
            <Link
              to="/admin/login"
              className="mt-6 inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-6 py-3 font-bold text-[var(--ok-paper)]"
            >
              فتح صفحة الدخول
            </Link>
          )}
          <Link
            to="/dashboard"
            className={`${signedIn ? "mt-6" : "mt-3"} block font-bold text-[var(--ok-accent-text)] underline`}
          >
            الذهاب إلى لوحة الطالب
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

function AdminFrame({ title, children }: { title: string; children: ReactNode }) {
  const { profile } = useAdminAuth();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-white/15 px-5 py-5">
        <img src="/logo-96.webp" alt="عُقاب" className="size-11 object-contain" />
        <div>
          <p className="font-display text-xl font-bold">عُقاب</p>
          <p className="text-xs text-white/55">مركز إدارة العمل</p>
        </div>
      </div>
      <nav aria-label="أقسام الإدارة" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/admin" ? pathname === to : pathname.startsWith(to);
          if (to === "/admin/health" && !hasMinimumRole(profile!.role, "admin")) return null;
          if (to === "/admin/team" && profile!.role === "employee") return null;
          if (to === "/admin/courses" && !hasMinimumRole(profile!.role, "admin")) return null;
          if (to === "/admin/questions" && !hasMinimumRole(profile!.role, "admin")) return null;
          if (to === "/admin/learning" && !hasMinimumRole(profile!.role, "admin")) return null;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#E8A33D] text-[#181511]"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 border-t border-white/15 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/7 p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E8A33D] font-bold text-[#181511]">
            {(profile?.display_name || profile?.email || "ع").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{profile?.display_name || profile?.email}</p>
            <p className="text-xs text-white/55">{profile ? ROLE_LABELS[profile.role] : ""}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: "/admin/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm text-white/70 hover:bg-white/8"
        >
          <LogOut size={16} /> تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
      <OkaabStyles />
      <style nonce={getDocumentNonce()}>{`
        @media (min-width: 1024px) {
          .okaab-admin-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 18rem;
          }

          .okaab-admin-sidebar {
            grid-column: 2;
            grid-row: 1;
            height: 100dvh;
          }

          .okaab-admin-content {
            grid-column: 1;
            grid-row: 1;
          }
        }
      `}</style>
      <AdminToaster />
      <div dir="ltr" className="okaab-admin-grid min-h-screen">
        <aside
          dir="rtl"
          className="okaab-admin-sidebar sticky top-0 z-40 hidden h-dvh min-h-0 self-start flex-col overflow-hidden bg-[#181511] text-white lg:flex"
        >
          {sidebar}
        </aside>
        {mobileOpen && (
          <div
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة الإدارة"
            className="fixed inset-0 z-50 h-dvh overflow-hidden overscroll-contain lg:hidden"
          >
            <button
              aria-label="إغلاق القائمة"
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 right-0 flex h-dvh w-[min(84vw,19rem)] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden border-l border-white/15 bg-[#181511] text-white shadow-2xl">
              <button
                aria-label="إغلاق القائمة"
                className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-white/20 bg-black/25 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div dir="rtl" className="okaab-admin-content min-w-0 overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-[var(--ok-ink)] bg-[var(--ok-paper)]/92 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="فتح القائمة"
                onClick={() => setMobileOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[var(--ok-ink)] lg:hidden"
              >
                <Menu size={19} />
              </button>
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{title}</h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تبديل الوضع"
              className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[var(--ok-ink)]"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
          <main className="min-w-0 p-3 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-left"
      dir="rtl"
      closeButton
      visibleToasts={3}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "!rounded-2xl !border-2 !border-[var(--ok-ink)] !bg-[var(--ok-card)] !text-[var(--ok-ink)] !shadow-[5px_5px_0_var(--ok-ink)]",
          title: "!font-display !font-bold",
          description: "!leading-6 !text-[var(--ok-ink)]/70",
          closeButton:
            "!border-2 !border-[var(--ok-ink)] !bg-[var(--ok-card)] !text-[var(--ok-ink)]",
        },
      }}
    />
  );
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ClerkBoundary>
      <ThemeProvider>
        <AdminAuthProvider>
          <AdminGate>
            <AdminFrame title={title}>{children}</AdminFrame>
          </AdminGate>
        </AdminAuthProvider>
      </ThemeProvider>
    </ClerkBoundary>
  );
}

export { ROLE_LABELS };
