import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import {
  publishLessonHierarchy,
  type PublishedCourseHierarchy,
} from "@/lib/course-publication.server";
import { getDb, sql } from "@/lib/db.server";

export const Route = createFileRoute("/api/admin/slides/$deckId/publication")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const profile = await requireAdminProfile(["super_admin", "admin"]);
          const input = (await request.json()) as { isPublished?: unknown };
          if (typeof input.isPublished !== "boolean")
            return Response.json({ error: "حالة النشر غير صحيحة" }, { status: 400 });

          const pool = await getDb();
          const transaction = new sql.Transaction(pool);
          await transaction.begin();
          try {
            const deckResult = await new sql.Request(transaction)
              .input("deck_id", sql.NVarChar(64), params.deckId)
              .query<{ id: string; lesson_id: string }>(
                "select top (1) id,lesson_id from okaab.slide_decks where id=@deck_id",
              );
            const deck = deckResult.recordset[0];
            if (!deck) {
              await transaction.rollback();
              return Response.json({ error: "ملف الـSlides غير موجود" }, { status: 404 });
            }

            let publishedHierarchy: PublishedCourseHierarchy | null = null;
            if (input.isPublished)
              publishedHierarchy = await publishLessonHierarchy(transaction, deck.lesson_id);

            await new sql.Request(transaction)
              .input("deck_id", sql.NVarChar(64), deck.id)
              .input("is_published", sql.Bit, input.isPublished)
              .query(
                "update okaab.slide_decks set is_published=@is_published,updated_at=sysutcdatetime() where id=@deck_id",
              );
            await new sql.Request(transaction)
              .input("actor_id", sql.NVarChar(64), profile.id)
              .input("deck_id", sql.NVarChar(64), deck.id)
              .input(
                "summary",
                sql.NVarChar(1000),
                input.isPublished
                  ? "نشر Slides مع الدرس والكورس والمسارات المرتبطة"
                  : "إلغاء نشر Slides مع إبقاء المحتوى الأب منشورًا",
              )
              .query(`insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar)
                values (@actor_id,'slides.publication','slide_deck',@deck_id,@summary)`);

            await transaction.commit();
            return Response.json({
              deckId: deck.id,
              isPublished: input.isPublished,
              publishedHierarchy,
            });
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Slide publication failed", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "تعذّر تغيير حالة النشر" },
            { status: 500 },
          );
        }
      },
    },
  },
});
