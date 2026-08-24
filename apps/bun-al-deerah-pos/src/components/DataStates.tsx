import { CloudOff, Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

/* حالة التحميل — هيكل عظمي بسيط */
export function LoadingBlock({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 animate-pulse rounded-md border border-border-subtle bg-bg-subtle"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

/* حالة الفراغ */
export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border-subtle bg-bg-base px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-bg-subtle text-text-muted">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h3 className="mt-4 text-h3 font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-body-sm text-text-secondary">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* حالة الخطأ */
export function ErrorState({
  title = "تعذّر تحميل البيانات",
  body = "حدث خلل مؤقت. أعد المحاولة، وإن تكرر الخطأ تواصل مع الدعم.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border-subtle bg-bg-base px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-error-bg text-error">
        <TriangleAlert className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-h3 font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-body-sm text-text-secondary">{body}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className={`mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}

/* لافتة عدم الاتصال — تُستخدم في الكاشير والأسطح التشغيلية */
export function OfflineBanner({ pendingCount = 0 }: { pendingCount?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-warning-bg px-4 py-2.5">
      <p className="flex items-center gap-2 text-body-sm font-medium text-warning">
        <CloudOff className="h-4 w-4 shrink-0" />
        وضع عدم الاتصال — البيع مستمر وتُحفظ الفواتير محليًا
      </p>
      <p className="text-caption text-warning">
        <span className="num font-semibold">{pendingCount}</span> فاتورة تنتظر المزامنة
      </p>
    </div>
  );
}
