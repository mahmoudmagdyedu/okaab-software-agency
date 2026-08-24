import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** إطار موحّد لشاشات المصادقة الأربع — عمود واحد بعرض 420px على أرضية bg/subtle. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-subtle)] px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[var(--accent-600)] text-base font-bold text-white">
            مَ
          </span>
          <span className="text-h2 font-semibold text-[var(--text-primary)]">مَوعِد</span>
        </Link>

        <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8">
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">{title}</h1>
          <p className="mt-2 text-body-sm text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-body-sm text-[var(--text-secondary)]">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
