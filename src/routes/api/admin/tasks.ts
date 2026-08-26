import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";
import type { TaskStatus } from "@/integrations/supabase/types";

const statuses = new Set<TaskStatus>([
  "scheduled",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
]);

type TaskInput = {
  id?: string;
  teamId?: string;
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
};

class InputError extends Error {}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseTaskInput(input: TaskInput) {
  const teamId = input.teamId?.trim();
  const title = input.title?.trim();
  const description = input.description?.trim() ?? "";
  const startsAt = new Date(input.startsAt ?? "");
  const endsAt = new Date(input.endsAt ?? "");
  const status = input.status ?? "scheduled";
  const assigneeIds = [...new Set(input.assigneeIds ?? [])].filter(Boolean);

  if (!teamId) throw new InputError("اختر الفريق أولًا");
  if (!title || title.length < 2 || title.length > 180)
    throw new InputError("عنوان المهمة يجب أن يكون بين حرفين و180 حرفًا");
  if (description.length > 5000) throw new InputError("وصف المهمة طويل جدًا");
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()))
    throw new InputError("تاريخ المهمة أو وقتها غير صحيح");
  if (endsAt <= startsAt) throw new InputError("وقت النهاية يجب أن يكون بعد البداية");
  if (!statuses.has(status)) throw new InputError("حالة المهمة غير صحيحة");
  if (assigneeIds.length > 100) throw new InputError("عدد المسند إليهم أكبر من المسموح");

  return { teamId, title, description, startsAt, endsAt, status, assigneeIds };
}

async function validateRelations(
  transaction: sql.Transaction,
  teamId: string,
  assigneeIds: string[],
) {
  const team = await new sql.Request(transaction)
    .input("team_id", sql.NVarChar(64), teamId)
    .query("select top (1) id from okaab.teams where id=@team_id and is_active=1");
  if (!team.recordset.length) throw new InputError("الفريق غير موجود أو غير نشط");
  if (!assigneeIds.length) return;

  const request = new sql.Request(transaction).input("team_id", sql.NVarChar(64), teamId);
  const parameters = assigneeIds.map((id, index) => {
    request.input(`member_${index}`, sql.NVarChar(64), id);
    return `@member_${index}`;
  });
  const members = await request.query<{ id: string }>(`
    select id from okaab.profiles
    where id in (${parameters.join(",")})
      and team_id=@team_id
      and is_active=1
      and role in ('team_leader','employee')
  `);
  if (members.recordset.length !== assigneeIds.length)
    throw new InputError("بعض الأعضاء غير موجودين في الفريق المختار");
}

async function replaceAssignees(
  transaction: sql.Transaction,
  taskId: string,
  assigneeIds: string[],
  actorId: string,
) {
  const cleanup = new sql.Request(transaction).input("task_id", sql.NVarChar(64), taskId);
  if (assigneeIds.length) {
    const parameters = assigneeIds.map((profileId, index) => {
      cleanup.input(`keep_${index}`, sql.NVarChar(64), profileId);
      return `@keep_${index}`;
    });
    await cleanup.query(
      `delete from okaab.task_assignees where task_id=@task_id and profile_id not in (${parameters.join(",")})`,
    );
  } else {
    await cleanup.query("delete from okaab.task_assignees where task_id=@task_id");
  }

  for (const profileId of assigneeIds) {
    await new sql.Request(transaction)
      .input("task_id", sql.NVarChar(64), taskId)
      .input("profile_id", sql.NVarChar(64), profileId)
      .input("actor_id", sql.NVarChar(64), actorId).query(`
        if not exists (
          select 1 from okaab.task_assignees where task_id=@task_id and profile_id=@profile_id
        )
          insert into okaab.task_assignees (task_id, profile_id, status, assigned_by)
          values (@task_id, @profile_id, 'scheduled', @actor_id)
      `);
  }
}

async function writeAudit(
  transaction: sql.Transaction,
  actorId: string,
  action: "task.created" | "task.updated" | "task.deleted",
  taskId: string,
  summary: string,
  metadata: Record<string, unknown>,
) {
  await new sql.Request(transaction)
    .input("actor_id", sql.NVarChar(64), actorId)
    .input("action", sql.NVarChar(120), action)
    .input("task_id", sql.NVarChar(64), taskId)
    .input("summary", sql.NVarChar(1000), summary)
    .input("metadata", sql.NVarChar(sql.MAX), JSON.stringify(metadata)).query(`
      insert into okaab.audit_log (actor_id, action, entity_type, entity_id, summary_ar, metadata)
      values (@actor_id, @action, 'task', @task_id, @summary, @metadata)
    `);
}

async function createTask(input: TaskInput) {
  const actor = await requireAdminProfile(["super_admin"]);
  let values;
  try {
    values = parseTaskInput(input);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "بيانات المهمة غير صحيحة");
  }

  const pool = await getDb();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await validateRelations(transaction, values.teamId, values.assigneeIds);
    const result = await new sql.Request(transaction)
      .input("team_id", sql.NVarChar(64), values.teamId)
      .input("title", sql.NVarChar(300), values.title)
      .input("description", sql.NVarChar(sql.MAX), values.description)
      .input("starts_at", sql.DateTimeOffset, values.startsAt)
      .input("ends_at", sql.DateTimeOffset, values.endsAt)
      .input("status", sql.NVarChar(32), values.status)
      .input("actor_id", sql.NVarChar(64), actor.id).query<{ id: string }>(`
        insert into okaab.tasks
          (team_id, title, description, starts_at, ends_at, status, issuer_id, issuer_role_snapshot, issuer_rank)
        output inserted.id
        values
          (@team_id, @title, @description, @starts_at, @ends_at, @status, @actor_id, 'super_admin', 1)
      `);
    const taskId = result.recordset[0]!.id;
    await replaceAssignees(transaction, taskId, values.assigneeIds, actor.id);
    await writeAudit(transaction, actor.id, "task.created", taskId, `إنشاء مهمة: ${values.title}`, {
      teamId: values.teamId,
      assigneeCount: values.assigneeIds.length,
    });
    await transaction.commit();
    return Response.json({ ok: true, id: taskId }, { status: 201 });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof InputError) return badRequest(error.message);
    console.error("Create task failed", error);
    return Response.json({ error: "تعذّر إنشاء المهمة الآن" }, { status: 500 });
  }
}

async function updateTask(input: TaskInput) {
  const actor = await requireAdminProfile(["super_admin"]);
  const taskId = input.id?.trim();
  if (!taskId) return badRequest("معرّف المهمة غير موجود");
  let values;
  try {
    values = parseTaskInput(input);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "بيانات المهمة غير صحيحة");
  }

  const pool = await getDb();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await validateRelations(transaction, values.teamId, values.assigneeIds);
    const result = await new sql.Request(transaction)
      .input("task_id", sql.NVarChar(64), taskId)
      .input("team_id", sql.NVarChar(64), values.teamId)
      .input("title", sql.NVarChar(300), values.title)
      .input("description", sql.NVarChar(sql.MAX), values.description)
      .input("starts_at", sql.DateTimeOffset, values.startsAt)
      .input("ends_at", sql.DateTimeOffset, values.endsAt)
      .input("status", sql.NVarChar(32), values.status).query(`
        update okaab.tasks
        set team_id=@team_id, title=@title, description=@description,
            starts_at=@starts_at, ends_at=@ends_at, status=@status,
            updated_at=sysutcdatetime()
        where id=@task_id
      `);
    if (!result.rowsAffected[0]) throw new InputError("المهمة غير موجودة");
    await replaceAssignees(transaction, taskId, values.assigneeIds, actor.id);
    await writeAudit(transaction, actor.id, "task.updated", taskId, `تعديل مهمة: ${values.title}`, {
      teamId: values.teamId,
      status: values.status,
      assigneeCount: values.assigneeIds.length,
    });
    await transaction.commit();
    return Response.json({ ok: true, id: taskId });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof InputError) return badRequest(error.message);
    console.error("Update task failed", error);
    return Response.json({ error: "تعذّر تعديل المهمة الآن" }, { status: 500 });
  }
}

async function deleteTask(input: TaskInput) {
  const actor = await requireAdminProfile(["super_admin"]);
  const taskId = input.id?.trim();
  if (!taskId) return badRequest("معرّف المهمة غير موجود");

  const pool = await getDb();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const task = await new sql.Request(transaction)
      .input("task_id", sql.NVarChar(64), taskId)
      .query<{ title: string }>("select top (1) title from okaab.tasks where id=@task_id");
    const current = task.recordset[0];
    if (!current) throw new InputError("المهمة غير موجودة");

    const request = new sql.Request(transaction).input("task_id", sql.NVarChar(64), taskId);
    await request.query(`
      delete from okaab.task_comments where task_id=@task_id;
      delete from okaab.task_assignees where task_id=@task_id;
      delete from okaab.tasks where id=@task_id;
    `);
    await writeAudit(transaction, actor.id, "task.deleted", taskId, `حذف مهمة: ${current.title}`, {
      title: current.title,
    });
    await transaction.commit();
    return Response.json({ ok: true });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof InputError) return badRequest(error.message);
    console.error("Delete task failed", error);
    return Response.json({ error: "تعذّر حذف المهمة الآن" }, { status: 500 });
  }
}

async function handleRequest(method: "POST" | "PATCH" | "DELETE", request: Request) {
  try {
    const input = (await request.json()) as TaskInput;
    if (method === "POST") return await createTask(input);
    if (method === "PATCH") return await updateTask(input);
    return await deleteTask(input);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Task API request failed", error);
    return Response.json({ error: "تعذّر تنفيذ العملية الآن" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/admin/tasks")({
  server: {
    handlers: {
      POST: async ({ request }) => handleRequest("POST", request),
      PATCH: async ({ request }) => handleRequest("PATCH", request),
      DELETE: async ({ request }) => handleRequest("DELETE", request),
    },
  },
});
