import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";

function slugify(value: string, suffix: string) {
  const base = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "course"}-${suffix}`;
}

export const Route = createFileRoute("/api/admin/courses/bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const profile = await requireAdminProfile(["super_admin", "admin"]);
          const input = (await request.json()) as {
            roadmapTitle?: string;
            courseTitle?: string;
            lessonTitle?: string;
            published?: boolean;
          };
          const roadmapTitle = input.roadmapTitle?.trim();
          const courseTitle = input.courseTitle?.trim();
          const lessonTitle = input.lessonTitle?.trim();
          if (!roadmapTitle || !courseTitle || !lessonTitle)
            return Response.json({ error: "اكتب اسم الـRoadmap والكورس والدرس" }, { status: 400 });

          const roadmapId = crypto.randomUUID();
          const courseId = crypto.randomUUID();
          const lessonId = crypto.randomUUID();
          const suffix = crypto.randomUUID().slice(0, 8);
          const pool = await getDb();
          const transaction = new sql.Transaction(pool);
          await transaction.begin();
          try {
            await new sql.Request(transaction)
              .input("roadmap_id", sql.NVarChar(64), roadmapId)
              .input("roadmap_slug", sql.NVarChar(180), slugify(roadmapTitle, suffix))
              .input("roadmap_title", sql.NVarChar(220), roadmapTitle)
              .input("course_id", sql.NVarChar(64), courseId)
              .input("course_slug", sql.NVarChar(180), slugify(courseTitle, suffix))
              .input("course_title", sql.NVarChar(220), courseTitle)
              .input("lesson_id", sql.NVarChar(64), lessonId)
              .input("lesson_slug", sql.NVarChar(180), slugify(lessonTitle, suffix))
              .input("lesson_title", sql.NVarChar(300), lessonTitle)
              .input("published", sql.Bit, Boolean(input.published))
              .input("created_by", sql.NVarChar(64), profile.id).query(`
                insert into okaab.roadmaps (id,slug,title,is_published,created_by)
                values (@roadmap_id,@roadmap_slug,@roadmap_title,@published,@created_by);
                insert into okaab.courses (id,slug,title,is_published,created_by)
                values (@course_id,@course_slug,@course_title,@published,@created_by);
                insert into okaab.roadmap_courses (roadmap_id,course_id,sort_order)
                values (@roadmap_id,@course_id,0);
                insert into okaab.lessons (id,course_id,slug,title,is_published)
                values (@lesson_id,@course_id,@lesson_slug,@lesson_title,@published);
                insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar)
                values (@created_by,'course.bootstrap','lesson',@lesson_id,N'إنشاء Roadmap وكورس ودرس من نموذج رفع Slides');
              `);
            await transaction.commit();
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
          return Response.json({ roadmapId, courseId, lessonId });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Course hierarchy bootstrap failed", error);
          return Response.json({ error: "تعذّر إنشاء هيكل الكورس" }, { status: 500 });
        }
      },
    },
  },
});
