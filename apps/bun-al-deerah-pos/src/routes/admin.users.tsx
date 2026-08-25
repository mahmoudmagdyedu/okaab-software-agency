import { createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  Check,
  Copy,
  LoaderCircle,
  ShieldCheck,
  UserPlus,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeUserStatusFn,
  createStaffFn,
  listAccessRequestsFn,
  listUsersFn,
  reviewAccessFn,
} from "../lib/auth.functions";
import {
  roleLabels,
  type AccessRequestRow,
  type ManagedUser,
  type SessionUser,
  type SystemRole,
} from "../lib/auth-types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "المستخدمون والصلاحيات — بُنّ الديرة" }] }),
  component: UsersPage,
});

const staffRoles: SystemRole[] = [
  "admin",
  "manager",
  "accountant",
  "inventory",
  "cashier",
  "kitchen",
  "employee",
];

const demoActor: SessionUser = {
  id: "demo-actor",
  organizationId: "demo-org",
  fullName: "نورة العتيبي",
  email: "demo@bunaldirah.example",
  role: "super_admin",
  status: "active",
  passwordResetRequired: false,
};

const demoUsers: ManagedUser[] = [
  { ...demoActor, createdAt: "2026-08-01T08:00:00Z", lastLoginAt: "2026-08-23T19:20:00Z" },
  {
    id: "demo-admin",
    organizationId: "demo-org",
    fullName: "سارة القحطاني",
    email: "sara@bunaldirah.example",
    role: "admin",
    status: "active",
    passwordResetRequired: false,
    createdAt: "2026-08-05T08:00:00Z",
    lastLoginAt: "2026-08-23T17:10:00Z",
  },
  {
    id: "demo-cashier",
    organizationId: "demo-org",
    fullName: "سالم الدوسري",
    email: "salem@bunaldirah.example",
    role: "cashier",
    status: "active",
    passwordResetRequired: false,
    createdAt: "2026-08-09T08:00:00Z",
    lastLoginAt: "2026-08-23T14:05:00Z",
  },
  {
    id: "demo-kitchen",
    organizationId: "demo-org",
    fullName: "مريم الحربي",
    email: "maryam@bunaldirah.example",
    role: "kitchen",
    status: "suspended",
    passwordResetRequired: false,
    createdAt: "2026-08-12T08:00:00Z",
    lastLoginAt: null,
  },
];

const demoRequests: AccessRequestRow[] = [
  {
    id: "demo-request-1",
    fullName: "أحمد العتيبي",
    email: "ahmed@example.com",
    organizationName: "مقهى الساحة",
    requestedRole: "admin",
    reason: "إدارة فرع جديد وتجهيز فريق العمل",
    status: "pending",
    createdAt: "2026-08-23T12:00:00Z",
  },
  {
    id: "demo-request-2",
    fullName: "ليان محمد",
    email: "layan@example.com",
    organizationName: "بُنّ الديرة",
    requestedRole: "employee",
    reason: "الانضمام لفريق الكاشير",
    status: "pending",
    createdAt: "2026-08-22T09:00:00Z",
  },
];

const inputClass =
  "h-10 w-full rounded-lg border border-border-subtle bg-bg-base px-3 text-body-sm text-text-primary focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "تعذر إتمام العملية";
}

function UsersPage() {
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const demoRole = new URLSearchParams(searchStr).get("demo") as SystemRole | null;
  const isDemo = Boolean(demoRole);
  const [actor, setActor] = useState<SessionUser | null>(
    isDemo ? { ...demoActor, role: demoRole! } : null,
  );
  const [users, setUsers] = useState<ManagedUser[]>(isDemo ? demoUsers : []);
  const [requests, setRequests] = useState<AccessRequestRow[]>(isDemo ? demoRequests : []);
  const [loading, setLoading] = useState(!isDemo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const canManage = actor?.role === "super_admin" || actor?.role === "admin";
  const availableRoles = useMemo(
    () => (actor?.role === "admin" ? staffRoles.filter((role) => role !== "admin") : staffRoles),
    [actor?.role],
  );

  const refresh = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    setError("");
    try {
      const result = await listUsersFn();
      setActor(result.actor);
      setUsers(result.users);
      if (result.actor.role === "super_admin") setRequests(await listAccessRequestsFn());
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!canManage && !loading) {
    return (
      <section className="rounded-xl border border-border-subtle bg-bg-base p-8 text-center">
        <ShieldCheck className="mx-auto h-11 w-11 text-accent-600" />
        <h1 className="mt-4 text-h1 font-semibold">إدارة المستخدمين غير متاحة لهذا الدور</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          إنشاء الموظفين وتوزيع الصلاحيات متاحان للسوبر أدمن وأدمن المنشأة فقط.
        </p>
      </section>
    );
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "");
    const email = String(form.get("email") ?? "");
    const role = String(form.get("role")) as SystemRole;
    setSaving(true);
    setError("");
    try {
      if (isDemo) {
        setUsers((current) => [
          {
            id: `demo-${Date.now()}`,
            organizationId: "demo-org",
            fullName,
            email,
            role,
            status: "active",
            passwordResetRequired: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: null,
          },
          ...current,
        ]);
        setTemporaryPassword("Demo!Bun2026");
      } else {
        const result = await createStaffFn({
          data: {
            fullName,
            email,
            role,
            organizationName: String(form.get("organizationName") ?? ""),
          },
        });
        setTemporaryPassword(result.temporaryPassword);
        await refresh();
      }
      event.currentTarget.reset();
      setNotice(isDemo ? "تمت محاكاة إنشاء الحساب بنجاح." : "تم إنشاء الحساب بنجاح.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: ManagedUser) {
    const status = user.status === "active" ? "suspended" : "active";
    setSaving(true);
    setError("");
    try {
      if (!isDemo) await changeUserStatusFn({ data: { userId: user.id, status } });
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, status } : item)),
      );
      setNotice(isDemo ? "تم تحديث الحالة داخل المحاكاة فقط." : "تم تحديث حالة الحساب.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  async function reviewRequest(request: AccessRequestRow, decision: "approved" | "rejected") {
    setSaving(true);
    setError("");
    try {
      if (isDemo) {
        setRequests((current) =>
          current.map((item) => (item.id === request.id ? { ...item, status: decision } : item)),
        );
        if (decision === "approved") setTemporaryPassword("Demo!Approved2026");
      } else {
        const result = await reviewAccessFn({ data: { requestId: request.id, decision } });
        if (result.temporaryPassword) setTemporaryPassword(result.temporaryPassword);
        await refresh();
      }
      setNotice(decision === "approved" ? "تم قبول طلب الوصول." : "تم رفض طلب الوصول.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-micro text-text-muted">الوصول والأمان</p>
          <h1 className="mt-1 text-display font-semibold text-text-primary">
            المستخدمون والصلاحيات
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            الأدمن ينشئ موظفي منشأته، والسوبر أدمن يعتمد الأدمن وطلبات الوصول.
          </p>
        </div>
        <span className="rounded-full bg-success-bg px-3 py-1 text-caption font-semibold text-success">
          {users.filter((user) => user.status === "active").length} حساب نشط
        </span>
      </div>

      {error && <p className="rounded-lg bg-error-bg px-4 py-3 text-body-sm text-error">{error}</p>}
      {notice && (
        <p className="flex items-center gap-2 rounded-lg bg-success-bg px-4 py-3 text-body-sm text-success">
          <Check className="h-4 w-4" /> {notice}
        </p>
      )}
      {temporaryPassword && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent-400 bg-accent-50 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold text-accent-700">
              كلمة المرور المؤقتة — تظهر مرة واحدة
            </p>
            <code
              dir="ltr"
              className="mt-1 block select-all break-all text-left text-body font-bold text-text-primary"
            >
              {temporaryPassword}
            </code>
          </div>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(temporaryPassword)}
            className="flex h-9 items-center gap-2 rounded-full border border-accent-400 px-3 text-caption font-semibold text-accent-700"
          >
            <Copy className="h-4 w-4" /> نسخ
          </button>
          <button type="button" aria-label="إخفاء" onClick={() => setTemporaryPassword("")}>
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form
          onSubmit={handleCreate}
          className="h-fit space-y-4 rounded-xl border border-border-subtle bg-bg-base p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-ink-foreground">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-h3 font-semibold">إنشاء حساب</h2>
              <p className="text-caption text-text-secondary">سيتم إصدار كلمة مرور مؤقتة.</p>
            </div>
          </div>
          <label className="block text-body-sm font-medium">
            الاسم الكامل
            <input name="fullName" required minLength={2} className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-body-sm font-medium">
            البريد الإلكتروني
            <input
              name="email"
              type="email"
              required
              dir="ltr"
              className={`${inputClass} mt-1.5 text-left`}
            />
          </label>
          {actor?.role === "super_admin" && (
            <label className="block text-body-sm font-medium">
              المنشأة
              <input
                name="organizationName"
                required
                defaultValue="بُنّ الديرة"
                className={`${inputClass} mt-1.5`}
              />
            </label>
          )}
          <label className="block text-body-sm font-medium">
            الدور
            <select name="role" className={`${inputClass} mt-1.5`} defaultValue={availableRoles[0]}>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={saving || loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            إنشاء المستخدم
          </button>
        </form>

        <section className="overflow-hidden rounded-xl border border-border-subtle bg-bg-base">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <div>
              <h2 className="text-h3 font-semibold">حسابات الفريق</h2>
              <p className="text-caption text-text-secondary">الأدوار وحالة الوصول الحالية</p>
            </div>
          </div>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderCircle className="h-6 w-6 animate-spin text-accent-600" />
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-subtle text-body-sm font-bold text-text-primary">
                    {user.fullName.slice(0, 1)}
                  </span>
                  <span className="min-w-[170px] flex-1">
                    <span className="block text-body-sm font-semibold">{user.fullName}</span>
                    <span dir="ltr" className="block text-left text-caption text-text-muted">
                      {user.email}
                    </span>
                  </span>
                  <span className="rounded-full bg-accent-50 px-2.5 py-1 text-caption font-semibold text-accent-700">
                    {roleLabels[user.role]}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-caption font-semibold ${user.status === "active" ? "bg-success-bg text-success" : "bg-error-bg text-error"}`}
                  >
                    {user.status === "active" ? "نشط" : "موقوف"}
                  </span>
                  {user.id !== actor?.id &&
                    user.role !== "super_admin" &&
                    !(actor?.role === "admin" && user.role === "admin") && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void toggleStatus(user)}
                        className="flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-caption font-semibold hover:bg-bg-subtle disabled:opacity-50"
                      >
                        {user.status === "active" ? (
                          <UserRoundX className="h-4 w-4" />
                        ) : (
                          <UserRoundCheck className="h-4 w-4" />
                        )}
                        {user.status === "active" ? "إيقاف" : "تفعيل"}
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {actor?.role === "super_admin" && (
        <section className="overflow-hidden rounded-xl border border-border-subtle bg-bg-base">
          <div className="border-b border-border-subtle px-5 py-4">
            <h2 className="text-h3 font-semibold">طلبات الوصول</h2>
            <p className="text-caption text-text-secondary">
              مراجعة طلبات الأدمن والموظفين قبل التفعيل
            </p>
          </div>
          <div className="divide-y divide-border-subtle">
            {requests.length === 0 && (
              <p className="px-5 py-8 text-center text-body-sm text-text-muted">لا توجد طلبات.</p>
            )}
            {requests.map((request) => (
              <div
                key={request.id}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <p className="text-body-sm font-semibold">{request.fullName}</p>
                  <p dir="ltr" className="text-left text-caption text-text-muted">
                    {request.email}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm">
                    {request.organizationName || "بدون منشأة"} · {roleLabels[request.requestedRole]}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {request.reason || "لم يذكر سببًا"}
                  </p>
                </div>
                {request.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      disabled={saving}
                      onClick={() => void reviewRequest(request, "approved")}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-caption font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> قبول
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => void reviewRequest(request, "rejected")}
                      className="flex h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-caption font-semibold disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> رفض
                    </button>
                  </div>
                ) : (
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-caption font-semibold ${request.status === "approved" ? "bg-success-bg text-success" : "bg-error-bg text-error"}`}
                  >
                    {request.status === "approved" ? "مقبول" : "مرفوض"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
