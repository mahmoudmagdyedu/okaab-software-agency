import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, format, startOfDay, startOfWeek } from "date-fns";
import { arEG } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminLayout, ROLE_LABELS, useAdminAuth } from "@/components/admin/AdminShell";
import { okaab as supabase } from "@/integrations/okaab/client";
import type { Profile, Task, TaskAssignee, TaskStatus, Team } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/tasks")({
  head: () => ({
    meta: [
      { title: "الجدول والمهام — إدارة عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TasksRoute,
});

const DAY_START = 9;
const DAY_END = 21;
const GRID_HEIGHT = 840;
const STATUS_LABELS: Record<TaskStatus, string> = {
  scheduled: "مجدولة",
  in_progress: "قيد التنفيذ",
  blocked: "متوقفة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

type TaskWithPeople = Task & {
  assigneeIds: string[];
  personalStatus: TaskStatus | null;
};

function dayBounds(date: Date) {
  const start = startOfDay(date);
  return { start, end: addDays(start, 1) };
}

function minutesSinceStart(value: string) {
  const date = new Date(value);
  return (date.getHours() - DAY_START) * 60 + date.getMinutes();
}

function taskStyle(task: Task) {
  const total = (DAY_END - DAY_START) * 60;
  const topMinutes = Math.max(0, minutesSinceStart(task.starts_at));
  const duration = Math.max(
    30,
    (new Date(task.ends_at).getTime() - new Date(task.starts_at).getTime()) / 60000,
  );
  return {
    top: `${(topMinutes / total) * GRID_HEIGHT}px`,
    height: `${Math.max(76, (duration / total) * GRID_HEIGHT)}px`,
  };
}

function TaskEditor({
  teams,
  profiles,
  selectedDay,
  task,
  onClose,
  onSaved,
}: {
  teams: Team[];
  profiles: Profile[];
  selectedDay: Date;
  task?: TaskWithPeople | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [teamId, setTeamId] = useState(task?.team_id ?? teams[0]?.id ?? "");
  const [assignees, setAssignees] = useState<string[]>(task?.assigneeIds ?? []);

  const initialDate = task ? new Date(task.starts_at) : new Date(selectedDay);
  if (!task) initialDate.setHours(DAY_START, 0, 0, 0);
  const initialEnd = task
    ? new Date(task.ends_at)
    : new Date(initialDate.getTime() + 60 * 60 * 1000);

  async function request(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
    const response = await fetch("/api/admin/tasks", {
      method,
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) throw new Error(payload?.error || "تعذّر تنفيذ العملية");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    const start = new Date(`${date}T${String(form.get("start"))}:00`);
    const end = new Date(`${date}T${String(form.get("end"))}:00`);
    if (end <= start) {
      toast.error("وقت النهاية يجب أن يكون بعد البداية");
      return;
    }
    setSaving(true);
    try {
      await request(task ? "PATCH" : "POST", {
        id: task?.id,
        teamId,
        title: String(form.get("title")),
        description: String(form.get("description") ?? ""),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        status: String(form.get("status") || "scheduled"),
        assigneeIds: assignees,
      });
      toast.success(task ? "تم تعديل المهمة" : "تم إنشاء المهمة");
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(task ? "تعذّر تعديل المهمة" : "تعذّر إنشاء المهمة", {
        description: error instanceof Error ? error.message : undefined,
      });
      setSaving(false);
    }
  }

  async function remove() {
    if (!task) return;
    setSaving(true);
    try {
      await request("DELETE", { id: task.id });
      toast.success("تم حذف المهمة");
      await onSaved();
      onClose();
    } catch (error) {
      toast.error("تعذّر حذف المهمة", {
        description: error instanceof Error ? error.message : undefined,
      });
      setSaving(false);
    }
  }

  const eligible = profiles.filter(
    (member) =>
      member.team_id === teamId && member.role !== "admin" && member.role !== "super_admin",
  );

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-title"
    >
      <button aria-label="إغلاق" className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute left-4 top-4 grid size-9 place-items-center rounded-full border-2 border-[var(--ok-ink)]"
        >
          <X size={17} />
        </button>
        <h2 id="task-title" className="font-display text-3xl font-bold">
          {task ? "تعديل المهمة" : "مهمة جديدة"}
        </h2>
        <p className="mt-2 text-sm opacity-65">
          هذه العملية متاحة للسوبر أدمن فقط، وتُسجّل تلقائيًا في سجل التدقيق.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold">عنوان المهمة</span>
            <input
              name="title"
              required
              minLength={2}
              maxLength={180}
              defaultValue={task?.title ?? ""}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 outline-none"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold">الفريق</span>
            <select
              name="team"
              required
              value={teamId}
              onChange={(event) => {
                setTeamId(event.target.value);
                setAssignees([]);
              }}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold">اليوم</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={format(initialDate, "yyyy-MM-dd")}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold">البداية</span>
            <input
              name="start"
              type="time"
              required
              defaultValue={format(initialDate, "HH:mm")}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold">النهاية</span>
            <input
              name="end"
              type="time"
              required
              defaultValue={format(initialEnd, "HH:mm")}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold">الوصف</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={task?.description ?? ""}
              className="w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] p-3 outline-none"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold">الحالة</span>
            <select
              name="status"
              defaultValue={task?.status ?? "scheduled"}
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-bold">إسناد إلى</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {eligible.length ? (
              eligible.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ok-ink)]/25 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={assignees.includes(member.id)}
                    onChange={(event) =>
                      setAssignees((current) =>
                        event.target.checked
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id),
                      )
                    }
                  />
                  <span>{member.display_name || member.email}</span>
                </label>
              ))
            ) : (
              <p className="text-sm opacity-60">لا يوجد أعضاء متاحون في هذا الفريق.</p>
            )}
          </div>
        </fieldset>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={saving || !teamId}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)] disabled:opacity-50"
          >
            {task ? <Edit3 size={18} /> : <Plus size={18} />}
            {saving ? "جاري الحفظ…" : task ? "حفظ التعديلات" : "إنشاء المهمة"}
          </button>
          {task && !confirmingDelete && (
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmingDelete(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-500 px-5 font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={18} />
              حذف
            </button>
          )}
        </div>
        {task && confirmingDelete && (
          <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-red-500">
              <AlertTriangle size={18} />
              سيتم حذف المهمة وتعليقاتها وإسناداتها نهائيًا.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void remove()}
                className="h-10 flex-1 rounded-xl bg-red-500 px-4 font-bold text-white disabled:opacity-50"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmingDelete(false)}
                className="h-10 rounded-xl border border-[var(--ok-ink)] px-4 font-bold"
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function TasksContent() {
  const { profile } = useAdminAuth();
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [teams, setTeams] = useState<Team[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<TaskWithPeople[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithPeople | null>(null);
  const [teamFilter, setTeamFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const canManage = profile?.role === "super_admin";

  const load = useCallback(async () => {
    setLoading(true);
    const { start, end } = dayBounds(selectedDay);
    const [teamResult, profileResult, taskResult, assigneeResult] = await Promise.all([
      supabase.from("teams").select("*").eq("is_active", true).order("name"),
      supabase.from("profiles").select("*").eq("is_active", true).order("display_name"),
      supabase
        .from("tasks")
        .select("*")
        .gte("starts_at", start.toISOString())
        .lt("starts_at", end.toISOString())
        .order("starts_at"),
      supabase.from("task_assignees").select("*"),
    ]);
    if (teamResult.error || taskResult.error) {
      toast.error("تعذّر تحميل الجدول", {
        description: teamResult.error?.message ?? taskResult.error?.message,
      });
    }
    const assignments = (assigneeResult.data ?? []) as TaskAssignee[];
    setTeams((teamResult.data ?? []) as Team[]);
    setProfiles((profileResult.data ?? []) as Profile[]);
    setTasks(
      ((taskResult.data ?? []) as Task[]).map((task) => ({
        ...task,
        assigneeIds: assignments
          .filter((item) => item.task_id === task.id)
          .map((item) => item.profile_id),
        personalStatus:
          assignments.find((item) => item.task_id === task.id && item.profile_id === profile?.id)
            ?.status ?? null,
      })),
    );
    setLoading(false);
  }, [selectedDay, profile?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTeams = useMemo(() => {
    if (profile?.role === "team_leader" || profile?.role === "employee")
      return teams.filter((team) => team.id === profile.team_id);
    return teams;
  }, [teams, profile]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDays(startOfWeek(selectedDay, { weekStartsOn: 6 }), index),
      ),
    [selectedDay],
  );
  const displayTeams = useMemo(
    () =>
      teamFilter === "all" ? visibleTeams : visibleTeams.filter((team) => team.id === teamFilter),
    [teamFilter, visibleTeams],
  );
  const displayTasks = useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase("ar");
    return tasks.filter(
      (task) =>
        displayTeams.some((team) => team.id === task.team_id) &&
        (!normalized ||
          task.title.toLocaleLowerCase("ar").includes(normalized) ||
          task.description.toLocaleLowerCase("ar").includes(normalized) ||
          task.assigneeIds.some((id) => {
            const person = profiles.find((profile) => profile.id === id);
            return (person?.display_name || person?.email || "")
              .toLocaleLowerCase("ar")
              .includes(normalized);
          })),
    );
  }, [displayTeams, searchQuery, tasks, profiles]);

  async function updateTask(task: TaskWithPeople, changes: Partial<Task> = {}) {
    const response = await fetch("/api/admin/tasks", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: task.id,
        teamId: changes.team_id ?? task.team_id,
        title: changes.title ?? task.title,
        description: changes.description ?? task.description,
        startsAt: changes.starts_at ?? task.starts_at,
        endsAt: changes.ends_at ?? task.ends_at,
        status: changes.status ?? task.status,
        assigneeIds: task.assigneeIds,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) throw new Error(payload?.error || "تعذّر تعديل المهمة");
  }

  async function dropTask(event: DragEvent<HTMLDivElement>, teamId: string) {
    event.preventDefault();
    if (!canManage) return;
    const taskId = event.dataTransfer.getData("text/task-id");
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const minutes = Math.round((ratio * (DAY_END - DAY_START) * 60) / 15) * 15;
    const startsAt = new Date(selectedDay);
    startsAt.setHours(DAY_START, minutes, 0, 0);
    const duration = new Date(task.ends_at).getTime() - new Date(task.starts_at).getTime();
    const endsAt = new Date(startsAt.getTime() + duration);
    try {
      const teamMemberIds = new Set(
        profiles.filter((member) => member.team_id === teamId).map((member) => member.id),
      );
      await updateTask(
        { ...task, assigneeIds: task.assigneeIds.filter((id) => teamMemberIds.has(id)) },
        { team_id: teamId, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() },
      );
      toast.success("تم تحديث وقت المهمة");
      await load();
    } catch (error) {
      toast.error("لم يتم نقل المهمة", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function setTaskStatus(task: TaskWithPeople, status: TaskStatus) {
    if (!canManage) return;
    try {
      await updateTask(task, { status });
      await load();
    } catch (error) {
      toast.error("تعذّر تحديث الحالة", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const personName = (id: string) =>
    profiles.find((person) => person.id === id)?.display_name ||
    profiles.find((person) => person.id === id)?.email ||
    "عضو";

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="flex flex-col gap-3 border-b border-[var(--ok-ink)]/15 p-4 sm:p-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold text-[#D88C20]">إدارة وقت الفرق</p>
            <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">التقويم الأسبوعي</h2>
            <p className="mt-1 text-sm opacity-55">
              {format(days[0]!, "d MMM", { locale: arEG })} —{" "}
              {format(days[6]!, "d MMM yyyy", { locale: arEG })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDay((day) => addDays(day, -7))}
              aria-label="الأسبوع السابق"
              className="grid size-10 place-items-center rounded-xl border-2 border-[var(--ok-ink)]"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay(startOfDay(new Date()))}
              className="h-10 rounded-xl border-2 border-[var(--ok-ink)] px-4 text-sm font-bold"
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay((day) => addDays(day, 7))}
              aria-label="الأسبوع التالي"
              className="grid size-10 place-items-center rounded-xl border-2 border-[var(--ok-ink)]"
            >
              <ChevronLeft size={18} />
            </button>
            {canManage && visibleTeams.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setComposerOpen(true);
                }}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[#E8A33D] px-4 text-sm font-bold text-[#181511]"
              >
                <CalendarPlus size={17} />
                مهمة جديدة
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-3 p-4 xl:grid-cols-[minmax(220px,320px)_1fr] xl:items-center">
          <label className="relative block">
            <Search
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-45"
              aria-hidden
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث باسم المهمة أو العضو"
              className="h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] pr-10 pl-3 text-sm outline-none focus:border-[#E8A33D]"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 xl:justify-end">
            <button
              type="button"
              onClick={() => setTeamFilter("all")}
              className={`shrink-0 rounded-xl border-2 border-[var(--ok-ink)] px-3 py-2 text-xs font-bold ${teamFilter === "all" ? "bg-[var(--ok-ink)] text-[var(--ok-paper)]" : "bg-[var(--ok-paper)]"}`}
            >
              كل الفرق
            </button>
            {visibleTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setTeamFilter(team.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] px-3 py-2 text-xs font-bold ${teamFilter === team.id ? "bg-[#E8A33D] text-[#181511]" : "bg-[var(--ok-paper)]"}`}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: team.color }} />
                {team.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {profile && !canManage && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#E8A33D]/35 bg-[#E8A33D]/10 px-4 py-3 text-sm leading-6">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#D88C20]" aria-hidden />
          <p>يمكنك مشاهدة الجدول والمهام، بينما الإضافة والتعديل والحذف متاحة للسوبر أدمن فقط.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => {
          const active = format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`rounded-2xl border-2 border-[var(--ok-ink)] px-3 py-2.5 text-sm ${active ? "bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]" : "bg-[var(--ok-card)]"}`}
            >
              <span className="block font-bold">{format(day, "EEEE", { locale: arEG })}</span>
              <span className="text-xs opacity-65">{format(day, "d MMM")}</span>
            </button>
          );
        })}
      </div>

      <section className="hidden overflow-x-auto rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] md:block">
        {loading ? (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <Clock3 className="mx-auto mb-3 size-8 animate-pulse text-[#D88C20]" />
              <p className="font-bold">جاري تجهيز الجدول…</p>
              <p className="mt-1 text-sm opacity-55">نحمّل الفرق والمهام لهذا اليوم.</p>
            </div>
          </div>
        ) : visibleTeams.length === 0 ? (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#E8A33D]/15 text-[#D88C20]">
                <Users size={28} />
              </div>
              <h2 className="mt-5 text-xl font-black">لا توجد فرق نشطة لعرضها</h2>
              <p className="mt-2 text-sm leading-6 opacity-60">
                أضف فريقًا أولًا، وبعدها سيظهر هنا كعمود مستقل ويمكنك إضافة مهامه وتنظيمها.
              </p>
              {canManage && (
                <Link
                  to="/admin/team"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E8A33D] px-5 font-bold text-[#181511]"
                >
                  <Plus size={17} />
                  إضافة فريق
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div
            className="min-w-[820px]"
            style={{ minWidth: `${displayTeams.length * 260 + 70}px` }}
          >
            <div
              className="sticky top-0 z-30 grid border-b-2 border-[var(--ok-ink)] bg-[var(--ok-card)]"
              style={{
                gridTemplateColumns: `70px repeat(${displayTeams.length}, minmax(250px, 1fr))`,
              }}
            >
              <div className="p-3 text-center text-xs opacity-55">
                <Clock3 className="mx-auto" size={17} />
              </div>
              {displayTeams.map((team) => {
                const teamTasks = displayTasks.filter((task) => task.team_id === team.id);
                const scheduledMinutes = teamTasks.reduce(
                  (sum, task) =>
                    sum +
                    Math.max(
                      0,
                      (new Date(task.ends_at).getTime() - new Date(task.starts_at).getTime()) /
                        60000,
                    ),
                  0,
                );
                const utilization = Math.min(100, Math.round((scheduledMinutes / 480) * 100));
                const memberCount = profiles.filter((member) => member.team_id === team.id).length;
                return (
                  <div key={team.id} className="border-r border-[var(--ok-ink)]/25 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-black text-[#181511]"
                          style={{ background: team.color }}
                        >
                          {team.name.slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <strong className="block truncate text-sm">{team.name}</strong>
                          <span className="text-[10px] opacity-50">{memberCount} أعضاء</span>
                        </div>
                      </div>
                      <span className="rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/12 px-2 py-1 text-[10px] font-bold text-[#D88C20]">
                        {utilization}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `70px repeat(${displayTeams.length}, minmax(250px, 1fr))`,
              }}
            >
              <div
                className="relative border-l-2 border-[var(--ok-ink)]"
                style={{ height: GRID_HEIGHT }}
              >
                {Array.from({ length: DAY_END - DAY_START + 1 }, (_, index) => (
                  <span
                    key={index}
                    className="absolute left-0 right-0 -translate-y-1/2 text-center text-[11px] opacity-50"
                    style={{ top: `${(index / (DAY_END - DAY_START)) * 100}%` }}
                  >
                    {String(DAY_START + index).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              {displayTeams.map((team) => (
                <div
                  key={team.id}
                  onDragOver={(event) => canManage && event.preventDefault()}
                  onDrop={(event) => void dropTask(event, team.id)}
                  className="relative border-l border-[var(--ok-ink)]/30"
                  style={{
                    height: GRID_HEIGHT,
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0, transparent 34px, color-mix(in srgb, var(--ok-ink) 13%, transparent) 35px, transparent 36px, transparent 69px, color-mix(in srgb, var(--ok-ink) 32%, transparent) 70px)",
                  }}
                >
                  {displayTasks
                    .filter((task) => task.team_id === team.id)
                    .map((task) => (
                      <article
                        key={task.id}
                        draggable={canManage}
                        onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}
                        style={{ ...taskStyle(task), borderTopColor: team.color }}
                        className={`absolute inset-x-2 z-10 overflow-hidden rounded-xl border-2 border-[var(--ok-ink)] border-t-[5px] bg-[var(--ok-paper-2)] p-2.5 shadow-sm transition hover:z-20 hover:shadow-lg ${canManage ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="line-clamp-1 text-sm">{task.title}</strong>
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="rounded-full bg-[#E8A33D]/25 px-2 py-0.5 text-[10px] font-bold">
                              {ROLE_LABELS[task.issuer_role_snapshot]}
                            </span>
                            {canManage && (
                              <button
                                type="button"
                                aria-label={`تعديل ${task.title}`}
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={() => {
                                  setEditingTask(task);
                                  setComposerOpen(true);
                                }}
                                className="grid size-7 place-items-center rounded-lg border border-[var(--ok-ink)]/20 bg-[var(--ok-card)] transition hover:border-[#E8A33D]"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p dir="ltr" className="mt-1 text-right text-[11px] opacity-60">
                          {format(new Date(task.starts_at), "HH:mm")} –{" "}
                          {format(new Date(task.ends_at), "HH:mm")}
                        </p>
                        {task.assigneeIds.length > 0 && (
                          <p className="mt-1 line-clamp-1 text-[11px] opacity-65">
                            {task.assigneeIds.map(personName).join("، ")}
                          </p>
                        )}
                        {canManage ? (
                          <select
                            aria-label="حالة المهمة"
                            value={task.status}
                            onPointerDown={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              void setTaskStatus(task, event.target.value as TaskStatus)
                            }
                            className="mt-2 max-w-full rounded-lg border border-[var(--ok-ink)]/25 bg-transparent px-1.5 py-1 text-[10px] font-bold"
                          >
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="mt-2 inline-block rounded-lg bg-[var(--ok-card)] px-2 py-1 text-[10px] font-bold">
                            {STATUS_LABELS[task.status]}
                          </span>
                        )}
                      </article>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3 md:hidden">
        {loading ? (
          <p className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 text-center opacity-60">
            جاري تحميل المهام…
          </p>
        ) : visibleTeams.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 text-center">
            <Users className="mx-auto size-8 text-[#D88C20]" />
            <h2 className="mt-3 font-black">لا توجد فرق نشطة</h2>
            <p className="mt-1 text-sm leading-6 opacity-60">أضف فريقًا أولًا ليظهر جدوله هنا.</p>
            {canManage && (
              <Link
                to="/admin/team"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#E8A33D] px-4 font-bold text-[#181511]"
              >
                <Plus size={16} />
                إضافة فريق
              </Link>
            )}
          </div>
        ) : displayTasks.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--ok-ink)] p-7 text-center opacity-60">
            لا توجد مهام في هذا اليوم.
          </p>
        ) : (
          [...displayTasks]
            .sort((a, b) => a.issuer_rank - b.issuer_rank || a.starts_at.localeCompare(b.starts_at))
            .map((task) => (
              <article
                key={task.id}
                className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[var(--ok-accent-text)]">
                      {ROLE_LABELS[task.issuer_role_snapshot]}
                    </span>
                    <h3 className="mt-1 font-bold">{task.title}</h3>
                  </div>
                  <span className="rounded-full bg-[var(--ok-paper)] px-2.5 py-1 text-xs font-bold">
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm opacity-65">
                  <Clock3 size={15} />
                  {format(new Date(task.starts_at), "HH:mm")} –{" "}
                  {format(new Date(task.ends_at), "HH:mm")}
                </p>
                {task.assigneeIds.length > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-sm opacity-65">
                    <Users size={15} />
                    {task.assigneeIds.map(personName).join("، ")}
                  </p>
                )}
                {canManage && (
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <select
                      aria-label="حالة المهمة"
                      value={task.status}
                      onChange={(event) =>
                        void setTaskStatus(task, event.target.value as TaskStatus)
                      }
                      className="h-10 min-w-0 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 text-sm font-bold"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task);
                        setComposerOpen(true);
                      }}
                      className="flex h-10 items-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] px-3 font-bold"
                    >
                      <Edit3 size={16} />
                      تعديل
                    </button>
                  </div>
                )}
              </article>
            ))
        )}
      </section>

      {composerOpen && (
        <TaskEditor
          teams={visibleTeams}
          profiles={profiles}
          selectedDay={selectedDay}
          task={editingTask}
          onClose={() => {
            setComposerOpen(false);
            setEditingTask(null);
          }}
          onSaved={load}
        />
      )}
    </div>
  );
}

function TasksRoute() {
  return (
    <AdminLayout title="الجدول والمهام">
      <TasksContent />
    </AdminLayout>
  );
}
