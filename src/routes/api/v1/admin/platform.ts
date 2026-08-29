import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";

const configSchema = z.object({
  kind: z.literal("config"),
  key: z.enum(["mobile", "features", "points_rules"]),
  value: z.record(z.string(), z.unknown()),
});
const announcementSchema = z.object({
  title: z.string().trim().min(3).max(240),
  body: z.string().trim().min(3).max(4000),
  audience: z.enum(["all", "active", "inactive_7d"]).default("all"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  published: z.boolean().default(false),
});

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
  metadata: unknown,
) {
  await (
    await getDb()
  )
    .request()
    .input("actor", sql.NVarChar(64), actorId)
    .input("action", sql.NVarChar(120), action)
    .input("type", sql.NVarChar(100), entityType)
    .input("id", sql.NVarChar(64), entityId)
    .input("summary", sql.NVarChar(1000), summary)
    .input("metadata", sql.NVarChar(sql.MAX), JSON.stringify(metadata))
    .query(
      "insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar,metadata) values (@actor,@action,@type,@id,@summary,@metadata)",
    );
}

export const Route = createFileRoute("/api/v1/admin/platform")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          const pool = await getDb();
          const result = await pool.request().query(`
          select [key],value_json,is_public,updated_at from okaab.remote_config order by [key];
          select id,title,body,audience,starts_at,ends_at,is_published,created_at from okaab.announcements order by created_at desc;
          select
            (select count(*) from okaab.learner_profiles where status='active') total_learners,
            (select count(distinct user_id) from okaab.lesson_events where created_at>=dateadd(day,-7,sysutcdatetime())) active_7d,
            (select count(*) from okaab.lesson_progress where status='completed') completed_lessons,
            (select count(*) from okaab.quiz_attempts) quiz_attempts,
            (select count(*) from okaab.lesson_progress where task_passed=1) successful_tasks;
          select top (8) l.id,l.title,c.title course_title,
            count(distinct p.user_id) started,
            count(distinct case when p.status='completed' then p.user_id end) completed
          from okaab.lessons l
          join okaab.courses c on c.id=l.course_id
          left join okaab.lesson_progress p on p.lesson_id=l.id
          where l.is_published=1
          group by l.id,l.title,c.title
          order by started desc,l.title;
          select
            count(distinct case when e.created_at>=dateadd(day,-1,sysutcdatetime()) then e.user_id end) dau,
            count(distinct case when e.created_at>=dateadd(day,-7,sysutcdatetime()) then e.user_id end) wau,
            count(distinct case when e.created_at>=dateadd(day,-30,sysutcdatetime()) then e.user_id end) mau
          from okaab.lesson_events e;
          with retention as (
            select 1 day_number,
              count(distinct case when p.created_at<=dateadd(day,-1,sysutcdatetime()) then p.id end) eligible,
              count(distinct case when convert(date,e.created_at)=dateadd(day,1,convert(date,p.created_at)) then p.id end) returned
            from okaab.learner_profiles p left join okaab.lesson_events e on e.user_id=p.id
            union all
            select 7,
              count(distinct case when p.created_at<=dateadd(day,-7,sysutcdatetime()) then p.id end),
              count(distinct case when convert(date,e.created_at)=dateadd(day,7,convert(date,p.created_at)) then p.id end)
            from okaab.learner_profiles p left join okaab.lesson_events e on e.user_id=p.id
            union all
            select 30,
              count(distinct case when p.created_at<=dateadd(day,-30,sysutcdatetime()) then p.id end),
              count(distinct case when convert(date,e.created_at)=dateadd(day,30,convert(date,p.created_at)) then p.id end)
            from okaab.learner_profiles p left join okaab.lesson_events e on e.user_id=p.id
          ) select day_number,eligible,returned,
            cast(case when eligible=0 then 0 else returned*100.0/eligible end as decimal(5,1)) retention_percent
          from retention order by day_number;
          select
            (select count(*) from okaab.learner_profiles where status='active') registered,
            (select count(distinct user_id) from okaab.lesson_progress where status in ('in_progress','completed')) started_lesson,
            (select count(distinct user_id) from okaab.quiz_attempts) attempted_quiz,
            (select count(distinct user_id) from okaab.lesson_progress where task_passed=1) passed_task,
            (select count(distinct user_id) from okaab.lesson_progress where status='completed') completed_lesson;
          with balances as (
            select p.id,coalesce(sum(l.amount),0) points
            from okaab.learner_profiles p left join okaab.points_ledger l on l.user_id=p.id
            where p.status='active' group by p.id
          )
          select
            case when points=0 then '0' when points<300 then '1-299' when points<800 then '300-799'
              when points<2000 then '800-1999' when points<5000 then '2000-4999' else '5000+' end band,
            count(*) learners
          from balances
          group by case when points=0 then '0' when points<300 then '1-299' when points<800 then '300-799'
              when points<2000 then '800-1999' when points<5000 then '2000-4999' else '5000+' end;
        `);
          const sets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>;
          const config = Object.fromEntries(
            (sets[0] ?? []).map((row) => {
              try {
                return [String(row["key"]), JSON.parse(String(row["value_json"]))];
              } catch {
                return [String(row["key"]), null];
              }
            }),
          );
          return apiData({
            config,
            announcements: sets[1] ?? [],
            analytics: {
              summary: sets[2]?.[0] ?? {},
              lessons: sets[3] ?? [],
              engagement: sets[4]?.[0] ?? { dau: 0, wau: 0, mau: 0 },
              retention: sets[5] ?? [],
              funnel: sets[6]?.[0] ?? {},
              pointsDistribution: sets[7] ?? [],
            },
          });
        } catch (error) {
          return apiError(error, "تعذّر تحميل إعدادات المنصة");
        }
      },
      PATCH: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = configSchema.parse(await request.json());
          await (
            await getDb()
          )
            .request()
            .input("key", sql.NVarChar(100), input.key)
            .input("value", sql.NVarChar(sql.MAX), JSON.stringify(input.value))
            .input("actor", sql.NVarChar(64), actor.id)
            .query(
              "update okaab.remote_config set value_json=@value,updated_by=@actor,updated_at=sysutcdatetime() where [key]=@key",
            );
          await audit(
            actor.id,
            "learning.config.update",
            "remote_config",
            input.key,
            `تم تحديث إعداد ${input.key}`,
            input.value,
          );
          return apiData({ updated: true });
        } catch (error) {
          return apiError(error, "تعذّر حفظ إعدادات المنصة");
        }
      },
      POST: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = announcementSchema.parse(await request.json());
          const id = crypto.randomUUID();
          await (
            await getDb()
          )
            .request()
            .input("id", sql.NVarChar(64), id)
            .input("title", sql.NVarChar(240), input.title)
            .input("body", sql.NVarChar(sql.MAX), input.body)
            .input("audience", sql.NVarChar(30), input.audience)
            .input("starts", sql.DateTimeOffset, new Date(input.startsAt))
            .input("ends", sql.DateTimeOffset, input.endsAt ? new Date(input.endsAt) : null)
            .input("published", sql.Bit, input.published)
            .input("actor", sql.NVarChar(64), actor.id)
            .query(
              "insert into okaab.announcements (id,title,body,audience,starts_at,ends_at,is_published,created_by) values (@id,@title,@body,@audience,@starts,@ends,@published,@actor)",
            );
          await audit(
            actor.id,
            "learning.announcement.create",
            "announcement",
            id,
            `تم إنشاء إعلان: ${input.title}`,
            { audience: input.audience, published: input.published },
          );
          return apiData({ id }, { status: 201 });
        } catch (error) {
          return apiError(error, "تعذّر إنشاء الإعلان");
        }
      },
      DELETE: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const id = new URL(request.url).searchParams.get("id");
          if (!id || id.length > 64) throw new Response("Invalid ID", { status: 400 });
          const deleted = await (
            await getDb()
          )
            .request()
            .input("id", sql.NVarChar(64), id)
            .query<{ title: string }>(
              "delete from okaab.announcements output deleted.title where id=@id",
            );
          if (!deleted.recordset[0]) throw new Response("Not found", { status: 404 });
          await audit(
            actor.id,
            "learning.announcement.delete",
            "announcement",
            id,
            `تم حذف إعلان: ${deleted.recordset[0].title}`,
            {},
          );
          return apiData({ deleted: true });
        } catch (error) {
          return apiError(error, "تعذّر حذف الإعلان");
        }
      },
    },
  },
});
