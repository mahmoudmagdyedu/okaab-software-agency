import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    userId: z.string().min(1).max(64),
    status: z.enum(["active", "banned"]),
  }),
  z.object({
    action: z.literal("visibility"),
    userId: z.string().min(1).max(64),
    visible: z.boolean(),
  }),
  z.object({
    action: z.literal("points"),
    userId: z.string().min(1).max(64),
    amount: z
      .number()
      .int()
      .min(-10000)
      .max(10000)
      .refine((value) => value !== 0),
    reason: z.string().trim().min(5).max(500),
  }),
]);

async function logAction(
  actorId: string,
  action: string,
  userId: string,
  summary: string,
  metadata: unknown,
) {
  await (
    await getDb()
  )
    .request()
    .input("actor", sql.NVarChar(64), actorId)
    .input("action", sql.NVarChar(120), action)
    .input("id", sql.NVarChar(64), userId)
    .input("summary", sql.NVarChar(1000), summary)
    .input("metadata", sql.NVarChar(sql.MAX), JSON.stringify(metadata))
    .query(
      "insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar,metadata) values (@actor,@action,'learner',@id,@summary,@metadata)",
    );
}

export const Route = createFileRoute("/api/v1/admin/learners")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          const search = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) || "";
          // Security: Escape '[' first to prevent wildcard injection and double-escaping of subsequent '[%]' and '[_]' replacements
          const result = await (
            await getDb()
          )
            .request()
            .input(
              "search",
              sql.NVarChar(110),
              `%${search.replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")}%`,
            ).query(`
        select top (100) p.id,p.email,p.display_name,p.avatar_url,p.status,p.leaderboard_visible,p.created_at,p.updated_at,
          coalesce((select sum(amount) from okaab.points_ledger where user_id=p.id),0) points,
          (select count(*) from okaab.lesson_progress where user_id=p.id and status='completed') completed_lessons,
          (select count(*) from okaab.user_badges where user_id=p.id) badge_count,
          (select max(created_at) from okaab.lesson_events where user_id=p.id) last_activity_at
        from okaab.learner_profiles p
        where @search='%%' or p.email like @search or p.display_name like @search
        order by coalesce((select max(created_at) from okaab.lesson_events where user_id=p.id),p.created_at) desc
      `);
          return apiData({ learners: result.recordset });
        } catch (error) {
          return apiError(error, "تعذّر تحميل المتعلمين");
        }
      },
      PATCH: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = actionSchema.parse(await request.json());
          const pool = await getDb();
          const target = await pool.request().input("id", sql.NVarChar(64), input.userId).query<{
            display_name: string;
            email: string;
          }>("select top (1) display_name,email from okaab.learner_profiles where id=@id");
          if (!target.recordset[0]) throw new Response("Not found", { status: 404 });
          const label = target.recordset[0].display_name || target.recordset[0].email;
          if (input.action === "status") {
            await pool
              .request()
              .input("id", sql.NVarChar(64), input.userId)
              .input("status", sql.NVarChar(20), input.status)
              .query(
                "update okaab.learner_profiles set status=@status,updated_at=sysutcdatetime() where id=@id",
              );
            await logAction(
              actor.id,
              "learning.learner.status",
              input.userId,
              `تم تغيير حالة ${label} إلى ${input.status}`,
              { status: input.status },
            );
          } else if (input.action === "visibility") {
            await pool
              .request()
              .input("id", sql.NVarChar(64), input.userId)
              .input("visible", sql.Bit, input.visible)
              .query(
                "update okaab.learner_profiles set leaderboard_visible=@visible,updated_at=sysutcdatetime() where id=@id",
              );
            await logAction(
              actor.id,
              "learning.learner.visibility",
              input.userId,
              `تم تغيير ظهور ${label} في المتصدرين`,
              { visible: input.visible },
            );
          } else {
            const key = `admin:${actor.id}:${crypto.randomUUID()}`;
            await pool
              .request()
              .input("id", sql.NVarChar(64), input.userId)
              .input("amount", sql.Int, input.amount)
              .input("key", sql.NVarChar(160), key)
              .query(
                "insert into okaab.points_ledger (user_id,amount,reason,idempotency_key) values (@id,@amount,'admin_adjustment',@key)",
              );
            await logAction(
              actor.id,
              "learning.points.adjust",
              input.userId,
              `تم تعديل نقاط ${label} بمقدار ${input.amount}`,
              { amount: input.amount, reason: input.reason },
            );
          }
          return apiData({ updated: true });
        } catch (error) {
          return apiError(error, "تعذّر تحديث حساب المتعلّم");
        }
      },
    },
  },
});
