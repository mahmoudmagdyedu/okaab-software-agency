import { Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import type { AppRole } from "@/components/mawid/can";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { supabase } from "@/integrations/supabase/client";
import { withBasePath } from "@/lib/base-path";
import { ROLE_LABELS } from "@/lib/session";

type AppPath =
  | "/app"
  | "/app/calendar"
  | "/app/appointments"
  | "/app/customers"
  | "/app/settings/whatsapp"
  | "/app/settings/roles"
  | "/app/settings/branches"
  | "/app/settings/availability"
  | "/app/settings/services";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: AppPath;
  allow: AppRole[];
}

const NAV: NavItem[] = [
  {
    label: "لوحة اليوم",
    icon: LayoutGrid,
    to: "/app",
    allow: ["receptionist", "provider", "branch_manager", "owner", "super_admin"],
  },
  {
    label: "التقويم الأسبوعي",
    icon: CalendarRange,
    to: "/app/calendar",
    allow: ["receptionist", "provider", "branch_manager", "owner", "super_admin"],
  },
  {
    label: "المواعيد",
    icon: ClipboardList,
    to: "/app/appointments",
    allow: ["receptionist", "branch_manager", "owner", "super_admin"],
  },
  {
    label: "العملاء",
    icon: Users,
    to: "/app/customers",
    allow: ["receptionist", "branch_manager", "owner", "super_admin"],
  },
  {
    label: "الخدمات",
    icon: Stethoscope,
    to: "/app/settings/services",
    allow: ["branch_manager", "owner", "super_admin"],
  },
  {
    label: "التوفر",
    icon: CalendarDays,
    to: "/app/settings/availability",
    allow: ["branch_manager", "owner", "super_admin"],
  },
  {
    label: "إشعارات واتساب",
    icon: MessageSquare,
    to: "/app/settings/whatsapp",
    allow: ["branch_manager", "owner", "super_admin"],
  },
  {
    label: "الأدوار والصلاحيات",
    icon: ShieldCheck,
    to: "/app/settings/roles",
    allow: ["branch_manager", "owner", "super_admin"],
  },
  {
    label: "إعدادات الفروع",
    icon: Building2,
    to: "/app/settings/branches",
    allow: ["branch_manager", "owner", "super_admin"],
  },
];

export interface AppShellProps {
  title: string;
  role: AppRole | null;
  userName: string;
  tenantName: string;
  children: ReactNode;
}

export function AppShell({ title, role, userName, tenantName, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign(withBasePath("/login"));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        className="hidden w-[248px] shrink-0 md:flex"
        role={role}
        userName={userName}
        tenantName={tenantName}
        onNavigate={() => undefined}
        onSignOut={signOut}
      />

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuOpen(false)}
          />
          <Sidebar
            className="absolute inset-y-0 right-0 flex w-[min(86vw,320px)] shadow-modal"
            role={role}
            userName={userName}
            tenantName={tenantName}
            onNavigate={() => setMenuOpen(false)}
            onSignOut={signOut}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center gap-3 bg-surface-dark px-4 md:px-6">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-sm text-on-dark transition-colors hover:bg-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 md:hidden"
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
          <p className="truncate text-caption font-semibold text-on-dark">
            {tenantName} <span className="text-on-dark-soft">×</span> مَوعِد
          </p>
        </header>

        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-6 md:px-8">
          <h1 className="text-h1 font-bold text-ink">{title}</h1>
        </div>

        <main className="min-w-0 flex-1 p-4 md:p-8 md:pt-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  className,
  role,
  userName,
  tenantName,
  onNavigate,
  onSignOut,
  onClose,
}: {
  className: string;
  role: AppRole | null;
  userName: string;
  tenantName: string;
  onNavigate: () => void;
  onSignOut: () => Promise<void>;
  onClose?: () => void;
}) {
  return (
    <aside
      aria-label="التنقل الرئيسي"
      className={`${className} flex-col border-s-0 bg-surface-dark`}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="text-h2 font-bold text-on-dark">مَوعِد</span>
        {onClose ? (
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="mr-auto flex size-9 items-center justify-center rounded-sm text-on-dark-soft hover:bg-accent-700 hover:text-on-dark"
            onClick={onClose}
            autoFocus
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="truncate px-5 pb-4 text-caption text-on-dark-soft">{tenantName}</p>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {NAV.filter((item) => !role || item.allow.includes(role)).map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            activeProps={{ className: "bg-accent-600 text-on-dark font-semibold" }}
            className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-body-sm text-on-dark-soft transition-colors hover:bg-accent-700 hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <LetterAvatar name={userName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-on-dark">{userName}</p>
            <p className="truncate text-caption text-on-dark-soft">
              {role ? ROLE_LABELS[role] : "بلا دور"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="mt-1 flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-sm px-3 text-body-sm text-on-dark-soft transition-colors hover:bg-accent-700 hover:text-on-dark"
        >
          <LogOut className="size-[18px]" strokeWidth={1.5} aria-hidden />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
