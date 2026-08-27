import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Hourglass,
  LoaderCircle,
  MailPlus,
  Plus,
  Shield,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminLayout, ROLE_LABELS, useAdminAuth } from "@/components/admin/AdminShell";
import { okaab as supabase } from "@/integrations/okaab/client";
import type { AppRole, Profile, Team } from "@/integrations/supabase/types";

type PendingInvite = {
  id: string;
  email: string;
  role: Exclude<AppRole, "super_admin">;
  teamId: string | null;
  teamName: string | null;
  createdAt: string;
  expiresAt: string;
  invitationUrl: string | null;
};

export const Route = createFileRoute("/admin/team")({
  head: () => ({
    meta: [
      { title: "الفرق والصلاحيات — إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TeamRoute,
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function TeamContent() {
  const { profile } = useAdminAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteRole, setInviteRole] = useState<AppRole>(
    profile?.role === "super_admin" ? "admin" : "team_leader",
  );
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    ok: boolean;
    message: string;
    email?: string;
    invitationUrl?: string;
  } | null>(null);
  const canAdminister = Boolean(profile && ["super_admin", "admin"].includes(profile.role));

  const load = useCallback(async () => {
    const [teamResult, peopleResult, inviteResponse] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("profiles").select("*").order("role").order("display_name"),
      canAdminister ? fetch("/api/admin/invite", { cache: "no-store" }) : Promise.resolve(null),
    ]);
    setTeams((teamResult.data ?? []) as Team[]);
    setPeople((peopleResult.data ?? []) as Profile[]);
    if (inviteResponse?.ok) {
      const payload = (await inviteResponse.json()) as { invitations?: PendingInvite[] };
      setPendingInvites(payload.invitations ?? []);
    } else if (inviteResponse) {
      setPendingInvites([]);
    }
    setLoading(false);
  }, [canAdminister]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (profile) setInviteRole(profile.role === "super_admin" ? "admin" : "team_leader");
  }, [profile]);

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const result = await supabase.from("teams").insert({
      name,
      slug: slugify(String(form.get("slug")) || name),
      description: String(form.get("description") ?? ""),
      color: String(form.get("color") ?? "#E8A33D"),
      created_by: profile.id,
      is_active: true,
    });
    if (result.error) toast.error("تعذّر إنشاء الفريق", { description: result.error.message });
    else {
      toast.success("تم إنشاء الفريق");
      event.currentTarget.reset();
      await load();
    }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteResult(null);
    setInviting(true);
    const form = new FormData(event.currentTarget);
    const role = String(form.get("role")) as AppRole;
    const teamId = String(form.get("teamId") || "") || null;
    const email = String(form.get("email")).trim().toLowerCase();
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role, teamId }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        invitationUrl?: string;
      };
      if (!response.ok) {
        const message = payload.error || "تعذّر إرسال الدعوة الآن";
        setInviteResult({ ok: false, message, email });
        toast.error("تعذّر إرسال الدعوة", { description: message });
      } else {
        const message = payload.message || "تم إرسال رابط الدعوة عبر البريد بنجاح.";
        setInviteResult({
          ok: true,
          message,
          email,
          ...(payload.invitationUrl ? { invitationUrl: payload.invitationUrl } : {}),
        });
        toast.success("تم إرسال رابط الدخول", { description: email });
        event.currentTarget.reset();
        setInviteRole(profile?.role === "super_admin" ? "admin" : "team_leader");
        await load();
      }
    } catch {
      const message = "تعذّر الاتصال بخدمة الدعوات. حاول مرة أخرى.";
      setInviteResult({ ok: false, message, email });
      toast.error("تعذّر إرسال الدعوة", { description: message });
    } finally {
      setInviting(false);
    }
  }

  async function updatePerson(person: Profile, role: AppRole, teamId: string | null) {
    const result = await supabase
      .from("profiles")
      .update({ role, team_id: role === "admin" ? null : teamId })
      .eq("id", person.id);
    if (result.error) toast.error("تعذّر تعديل الصلاحية", { description: result.error.message });
    else {
      toast.success("تم تحديث الصلاحية");
      await load();
    }
  }

  if (profile?.role === "employee") {
    return (
      <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center">
        <Shield className="mx-auto text-[var(--ok-accent-text)]" size={40} />
        <h2 className="mt-4 font-display text-2xl font-bold">هذه الصفحة للإدارة والتيم ليدر</h2>
        <p className="mt-2 opacity-65">ستجد مهامك الشخصية في صفحة الجدول.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canAdminister && (
        <section className="grid gap-5 xl:grid-cols-2">
          <form
            onSubmit={createTeam}
            className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#E8A33D] text-[#181511]">
                <UsersRound size={21} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">فريق جديد</h2>
                <p className="text-sm opacity-60">كل عضو ينتمي إلى فريق أساسي واحد.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                required
                placeholder="اسم الفريق"
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
              />
              <input
                name="slug"
                dir="ltr"
                placeholder="frontend-team"
                pattern="[a-z0-9-]+"
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-left"
              />
              <input
                name="description"
                placeholder="وصف مختصر"
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 sm:col-span-2"
              />
              <label className="flex h-11 items-center gap-3 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-sm font-bold">
                لون الفريق{" "}
                <input name="color" type="color" defaultValue="#E8A33D" className="mr-auto" />
              </label>
              <button className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]">
                <Plus size={17} />
                إنشاء الفريق
              </button>
            </div>
          </form>

          <form
            onSubmit={invite}
            className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#E8A33D] text-[#181511]">
                <MailPlus size={21} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">دعوة عضو</h2>
                <p className="text-sm opacity-60">سيصله رابط دخول آمن على البريد.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                name="email"
                type="email"
                dir="ltr"
                required
                placeholder="name@example.com"
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-left sm:col-span-2"
              />
              <select
                name="role"
                required
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as AppRole)}
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
              >
                {profile?.role === "super_admin" && <option value="admin">أدمن</option>}
                <option value="team_leader">تيم ليدر</option>
                <option value="employee">موظف</option>
              </select>
              <select
                name="teamId"
                required={inviteRole !== "admin"}
                disabled={inviteRole === "admin"}
                className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
              >
                <option value="">بدون فريق (للأدمن)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button
                disabled={inviting}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[#E8A33D] font-bold text-[#181511] disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
              >
                {inviting ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <MailPlus size={17} />
                )}
                {inviting ? "جاري إنشاء الرابط وإرساله…" : "إرسال الدعوة"}
              </button>
              {inviteResult && (
                <div
                  role={inviteResult.ok ? "status" : "alert"}
                  className={`flex items-start gap-3 rounded-2xl border p-3 text-sm leading-6 sm:col-span-2 ${
                    inviteResult.ok
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-red-500/40 bg-red-500/10"
                  }`}
                >
                  {inviteResult.ok ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={19} />
                  ) : (
                    <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={19} />
                  )}
                  <p>
                    <strong>{inviteResult.ok ? "تم الإرسال" : "لم يتم الإرسال"}</strong>
                    <br />
                    {inviteResult.message}{" "}
                    {inviteResult.email && <bdi dir="ltr">({inviteResult.email})</bdi>}
                  </p>
                  {inviteResult.ok && inviteResult.invitationUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(inviteResult.invitationUrl!);
                        toast.success("تم نسخ رابط الدعوة");
                      }}
                      className="mr-auto flex shrink-0 items-center gap-1 rounded-xl border border-current px-3 py-2 text-xs font-bold"
                    >
                      <Copy size={14} />
                      نسخ الرابط
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </section>
      )}

      {canAdminister && pendingInvites.length > 0 && (
        <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
          <div className="flex items-center justify-between border-b-2 border-[var(--ok-ink)] p-5">
            <div>
              <h2 className="font-display text-2xl font-bold">دعوات بانتظار القبول</h2>
              <p className="mt-1 text-sm opacity-60">
                يظهر العضو في القائمة الرئيسية فور قبول الدعوة وتسجيل الدخول.
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-[#E8A33D]/15 px-3 py-1.5 text-xs font-bold text-[#D88C20]">
              <Hourglass size={15} />
              {pendingInvites.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--ok-ink)]/15">
            {pendingInvites.map((invitation) => (
              <article
                key={invitation.id}
                className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-5"
              >
                <div className="min-w-0">
                  <p dir="ltr" className="truncate text-left font-bold">
                    {invitation.email}
                  </p>
                  <p className="mt-1 text-xs opacity-55">
                    {ROLE_LABELS[invitation.role]}
                    {invitation.teamName ? ` · ${invitation.teamName}` : ""} · تنتهي في{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-[#E8A33D]/45 bg-[#E8A33D]/10 px-3 py-1.5 text-xs font-bold text-[#D88C20]">
                  بانتظار القبول
                </span>
                {invitation.invitationUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(invitation.invitationUrl!);
                      toast.success("تم نسخ رابط الدعوة");
                    }}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] px-3 text-xs font-bold"
                  >
                    <Copy size={15} />
                    نسخ رابط الدعوة
                  </button>
                ) : (
                  <span className="text-xs opacity-50">أعد إرسال الدعوة لإنشاء رابط جديد</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="flex items-center justify-between border-b-2 border-[var(--ok-ink)] p-5">
          <div>
            <h2 className="font-display text-2xl font-bold">الأعضاء والصلاحيات</h2>
            <p className="mt-1 text-sm opacity-60">
              {loading ? "جاري التحميل…" : `${people.length} عضو`}
            </p>
          </div>
          <UserRound size={25} />
        </div>
        <div className="divide-y divide-[var(--ok-ink)]/15">
          {people.map((person) => {
            const immutable = person.role === "super_admin";
            const editable =
              canAdminister &&
              !immutable &&
              (profile?.role === "super_admin" || !["admin"].includes(person.role));
            return (
              <article
                key={person.id}
                className="grid gap-4 p-4 sm:grid-cols-[1fr_180px_180px] sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--ok-paper)] font-bold">
                    {(person.display_name || person.email).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{person.display_name || person.email}</h3>
                    <p dir="ltr" className="truncate text-left text-xs opacity-55">
                      {person.email}
                    </p>
                  </div>
                </div>
                <select
                  disabled={!editable}
                  value={person.role}
                  onChange={(event) =>
                    void updatePerson(person, event.target.value as AppRole, person.team_id)
                  }
                  className="h-10 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-sm disabled:opacity-60"
                >
                  {profile?.role === "super_admin" && <option value="admin">أدمن</option>}
                  <option value="team_leader">تيم ليدر</option>
                  <option value="employee">موظف</option>
                  {immutable && <option value="super_admin">سوبر أدمن</option>}
                </select>
                <select
                  disabled={!editable || person.role === "admin"}
                  value={person.team_id ?? ""}
                  onChange={(event) =>
                    void updatePerson(person, person.role, event.target.value || null)
                  }
                  className="h-10 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-sm disabled:opacity-60"
                >
                  <option value="">بدون فريق</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </article>
            );
          })}
          {!loading && people.length === 0 && (
            <p className="p-8 text-center opacity-60">لا يوجد أعضاء ظاهرون لصلاحيتك.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TeamRoute() {
  return (
    <AdminLayout title="الفرق والصلاحيات">
      <TeamContent />
    </AdminLayout>
  );
}
