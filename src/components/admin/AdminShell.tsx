import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { OkaabStyles } from "@/components/okaab/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/integrations/supabase/types";
import { ThemeProvider, useTheme } from "@/lib/theme";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "سوبر أدمن",
  admin: "أدمن",
  team_leader: "تيم ليدر",
  employee: "موظف",
};

type AdminAuthValue = {
  loading: boolean;
  profile: Profile | null;
  reload: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function reload() {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const result = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(result.data?.is_active ? result.data : null);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
    const { data } = supabase.auth.onAuthStateChange(() => void reload());
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ loading, profile, reload }), [loading, profile]);
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
  { to: "/admin/health", label: "حالة النظام", icon: Activity },
] as const;

function AdminGate({ children }: { children: ReactNode }) {
  const { loading, profile } = useAdminAuth();
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
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ok-paper)] px-4 text-[var(--ok-ink)]">
        <div className="max-w-md rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center shadow-[8px_8px_0_var(--ok-ink)]">
          <img src="/logo-96.webp" alt="عُقاب" className="mx-auto size-16 object-contain" />
          <h1 className="mt-5 font-display text-3xl font-bold">دخول الإدارة مطلوب</h1>
          <p className="mt-3 leading-7 opacity-70">
            سجّل الدخول بالبريد المدعو للوصول إلى لوحة عُقاب.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-6 py-3 font-bold text-[var(--ok-paper)]"
          >
            فتح صفحة الدخول
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

function AdminFrame({ title, children }: { title: string; children: ReactNode }) {
  const { profile } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

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
          if (to === "/admin/health" && !["super_admin", "admin"].includes(profile!.role))
            return null;
          if (to === "/admin/team" && profile!.role === "employee") return null;
          if (to === "/admin/courses" && !["super_admin", "admin"].includes(profile!.role))
            return null;
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
          onClick={() => void supabase.auth.signOut()}
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
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 flex-col bg-[#181511] text-white lg:flex">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 h-dvh overflow-hidden overscroll-contain lg:hidden">
          <button
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/55"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex h-dvh w-[min(84vw,19rem)] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden bg-[#181511] text-white shadow-2xl">
            <button
              aria-label="إغلاق القائمة"
              className="absolute left-3 top-3 rounded-full p-2 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 overflow-x-hidden lg:mr-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-[var(--ok-ink)] bg-[var(--ok-paper)]/92 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="فتح القائمة"
              onClick={() => setMobileOpen(true)}
              className="grid size-10 place-items-center rounded-full border-2 border-[var(--ok-ink)] lg:hidden"
            >
              <Menu size={19} />
            </button>
            <h1 className="font-display text-xl font-bold sm:text-2xl">{title}</h1>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="تبديل الوضع"
            className="grid size-10 place-items-center rounded-full border-2 border-[var(--ok-ink)]"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="min-w-0 p-3 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AdminGate>
          <AdminFrame title={title}>{children}</AdminFrame>
        </AdminGate>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export { ROLE_LABELS };
