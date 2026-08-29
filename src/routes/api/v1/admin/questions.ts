import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { apiData, apiError } from "@/lib/api-response.server";
import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";

const optionSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  explanation: z.string().trim().min(1).max(2000),
  correct: z.boolean(),
});
const saveSchema = z
  .object({
    questionId: z.string().min(1).max(64).optional(),
    lessonId: z.string().min(1).max(64),
    text: z.string().trim().min(3).max(4000),
    level: z.enum(["easy", "medium", "apply"]),
    sortOrder: z.number().int().min(0).max(10_000),
    published: z.boolean(),
    options: z.array(optionSchema).min(2).max(8),
  })
  .refine((value) => value.options.filter((option) => option.correct).length === 1, {
    message: "يجب تحديد إجابة صحيحة واحدة فقط",
    path: ["options"],
  });

const lessonTaskSchema = z.object({
  lessonId: z.string().min(1).max(64),
  enabled: z.boolean(),
  prompt: z.string().trim().max(12_000),
  requiredSlideIndex: z.number().int().min(0).max(10_000).nullable(),
});

async function audit(
  actorId: string,
  action: string,
  entityId: string,
  summary: string,
  metadata: unknown,
) {
  await (
    await getDb()
  )
    .request()
    .input("actor", sql.NVarChar(64), actorId)
    .input("action", sql.NVarChar(120), action)
    .input("id", sql.NVarChar(64), entityId)
    .input("summary", sql.NVarChar(1000), summary)
    .input("metadata", sql.NVarChar(sql.MAX), JSON.stringify(metadata))
    .query(
      "insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar,metadata) values (@actor,@action,'quiz_question',@id,@summary,@metadata)",
    );
}

export const Route = createFileRoute("/api/v1/admin/questions")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          const result = await (await getDb()).request().query(`
            select l.id,l.title,c.title course_title,l.task_enabled,l.task_prompt,l.required_slide_index
            from okaab.lessons l join okaab.courses c on c.id=l.course_id
            order by c.title,l.sort_order,l.title;
            select q.id,q.lesson_id,q.question_text,q.level,q.sort_order,q.is_published,q.updated_at,
              (select count(*) from okaab.quiz_attempts a where a.question_id=q.id) attempt_count
            from okaab.quiz_questions q order by q.lesson_id,q.sort_order,q.created_at;
            select id,question_id,option_text,is_correct,explanation,sort_order
            from okaab.quiz_options order by question_id,sort_order,id;
          `);
          const sets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>;
          const options = sets[2] ?? [];
          const questions = (sets[1] ?? []).map((question) => ({
            ...question,
            options: options.filter((option) => option["question_id"] === question["id"]),
          }));
          return apiData({ lessons: sets[0] ?? [], questions });
        } catch (error) {
          return apiError(error, "تعذّر تحميل بنك الأسئلة");
        }
      },
      POST: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = saveSchema.parse(await request.json());
          const pool = await getDb();
          const lesson = await pool
            .request()
            .input("id", sql.NVarChar(64), input.lessonId)
            .query("select top (1) id from okaab.lessons where id=@id");
          if (!lesson.recordset[0]) throw new Response("Lesson not found", { status: 404 });

          const transaction = new sql.Transaction(pool);
          await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
          try {
            let id = input.questionId ?? crypto.randomUUID();
            let action = input.questionId ? "learning.question.update" : "learning.question.create";
            if (input.questionId) {
              const current = await new sql.Request(transaction).input(
                "id",
                sql.NVarChar(64),
                input.questionId,
              ).query<{ attempt_count: number }>(`
                  select q.id,(select count(*) from okaab.quiz_attempts a where a.question_id=q.id) attempt_count
                  from okaab.quiz_questions q where q.id=@id
                `);
              if (!current.recordset[0]) throw new Response("Question not found", { status: 404 });
              if (current.recordset[0].attempt_count > 0) {
                await new sql.Request(transaction)
                  .input("id", sql.NVarChar(64), input.questionId)
                  .query(
                    "update okaab.quiz_questions set is_published=0,updated_at=sysutcdatetime() where id=@id",
                  );
                id = crypto.randomUUID();
                action = "learning.question.revise";
              } else {
                await new sql.Request(transaction)
                  .input("id", sql.NVarChar(64), id)
                  .query("delete from okaab.quiz_options where question_id=@id");
              }
            }

            if (input.questionId && id === input.questionId) {
              await new sql.Request(transaction)
                .input("id", sql.NVarChar(64), id)
                .input("lesson", sql.NVarChar(64), input.lessonId)
                .input("text", sql.NVarChar(sql.MAX), input.text)
                .input("level", sql.NVarChar(20), input.level)
                .input("sort", sql.Int, input.sortOrder)
                .input("published", sql.Bit, input.published)
                .query(
                  "update okaab.quiz_questions set lesson_id=@lesson,question_text=@text,level=@level,sort_order=@sort,is_published=@published,updated_at=sysutcdatetime() where id=@id",
                );
            } else {
              await new sql.Request(transaction)
                .input("id", sql.NVarChar(64), id)
                .input("lesson", sql.NVarChar(64), input.lessonId)
                .input("text", sql.NVarChar(sql.MAX), input.text)
                .input("level", sql.NVarChar(20), input.level)
                .input("sort", sql.Int, input.sortOrder)
                .input("published", sql.Bit, input.published)
                .query(
                  "insert into okaab.quiz_questions (id,lesson_id,question_text,level,sort_order,is_published) values (@id,@lesson,@text,@level,@sort,@published)",
                );
            }

            for (const [index, option] of input.options.entries()) {
              await new sql.Request(transaction)
                .input("id", sql.NVarChar(64), crypto.randomUUID())
                .input("question", sql.NVarChar(64), id)
                .input("text", sql.NVarChar(sql.MAX), option.text)
                .input("correct", sql.Bit, option.correct)
                .input("explanation", sql.NVarChar(sql.MAX), option.explanation)
                .input("sort", sql.Int, index)
                .query(
                  "insert into okaab.quiz_options (id,question_id,option_text,is_correct,explanation,sort_order) values (@id,@question,@text,@correct,@explanation,@sort)",
                );
            }
            await transaction.commit();
            await audit(actor.id, action, id, `تم حفظ سؤال: ${input.text.slice(0, 120)}`, {
              lessonId: input.lessonId,
              published: input.published,
              options: input.options.length,
            });
            return apiData({ id, revised: Boolean(input.questionId && id !== input.questionId) });
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
        } catch (error) {
          return apiError(error, "تعذّر حفظ السؤال");
        }
      },
      PATCH: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = lessonTaskSchema.parse(await request.json());
          if (input.enabled && input.prompt.length < 10)
            throw new Response("Task prompt is required", { status: 400 });
          const updated = await (
            await getDb()
          )
            .request()
            .input("id", sql.NVarChar(64), input.lessonId)
            .input("enabled", sql.Bit, input.enabled)
            .input("prompt", sql.NVarChar(sql.MAX), input.prompt || null)
            .input("slide", sql.Int, input.requiredSlideIndex).query<{ title: string }>(`
              update okaab.lessons
              set task_enabled=@enabled,task_prompt=@prompt,required_slide_index=@slide,updated_at=sysutcdatetime()
              output inserted.title
              where id=@id
            `);
          const lesson = updated.recordset[0];
          if (!lesson) throw new Response("Lesson not found", { status: 404 });
          await audit(
            actor.id,
            "learning.lesson_task.update",
            input.lessonId,
            `تم تحديث المهمة العملية لدرس: ${lesson.title}`,
            { enabled: input.enabled, requiredSlideIndex: input.requiredSlideIndex },
          );
          return apiData({ updated: true });
        } catch (error) {
          return apiError(error, "تعذّر حفظ إعداد المهمة العملية");
        }
      },
      DELETE: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const id = new URL(request.url).searchParams.get("id");
          if (!id || id.length > 64) throw new Response("Invalid ID", { status: 400 });
          const pool = await getDb();
          const current = await pool.request().input("id", sql.NVarChar(64), id).query<{
            question_text: string;
            attempt_count: number;
          }>(`
              select q.question_text,(select count(*) from okaab.quiz_attempts a where a.question_id=q.id) attempt_count
              from okaab.quiz_questions q where q.id=@id
            `);
          const question = current.recordset[0];
          if (!question) throw new Response("Not found", { status: 404 });
          if (question.attempt_count > 0) {
            await pool
              .request()
              .input("id", sql.NVarChar(64), id)
              .query(
                "update okaab.quiz_questions set is_published=0,updated_at=sysutcdatetime() where id=@id",
              );
            await audit(
              actor.id,
              "learning.question.archive",
              id,
              "تم إخفاء سؤال له محاولات محفوظة",
              {},
            );
            return apiData({ deleted: false, archived: true });
          }
          const transaction = new sql.Transaction(pool);
          await transaction.begin();
          try {
            await new sql.Request(transaction)
              .input("id", sql.NVarChar(64), id)
              .query(
                "delete from okaab.quiz_options where question_id=@id; delete from okaab.quiz_questions where id=@id;",
              );
            await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          await audit(
            actor.id,
            "learning.question.delete",
            id,
            `تم حذف سؤال: ${question.question_text.slice(0, 120)}`,
            {},
          );
          return apiData({ deleted: true, archived: false });
        } catch (error) {
          return apiError(error, "تعذّر حذف السؤال");
        }
      },
    },
  },
});
