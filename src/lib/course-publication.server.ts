import { sql } from "@/lib/db.server";

export type PublishedCourseHierarchy = {
  lessonId: string;
  courseId: string;
  roadmapIds: string[];
};

export async function publishLessonHierarchy(
  transaction: InstanceType<typeof sql.Transaction>,
  lessonId: string,
): Promise<PublishedCourseHierarchy> {
  const hierarchyResult = await new sql.Request(transaction)
    .input("lesson_id", sql.NVarChar(64), lessonId)
    .query<{ lesson_id: string; course_id: string }>(
      "select top (1) l.id as lesson_id,l.course_id from okaab.lessons l where l.id=@lesson_id",
    );
  const hierarchy = hierarchyResult.recordset[0];
  if (!hierarchy) throw new Error("الدرس المحدد غير موجود");

  const roadmapsResult = await new sql.Request(transaction)
    .input("course_id", sql.NVarChar(64), hierarchy.course_id)
    .query<{ id: string }>(
      "select r.id from okaab.roadmaps r join okaab.roadmap_courses rc on rc.roadmap_id=r.id where rc.course_id=@course_id",
    );

  await new sql.Request(transaction)
    .input("lesson_id", sql.NVarChar(64), hierarchy.lesson_id)
    .input("course_id", sql.NVarChar(64), hierarchy.course_id).query(`
      update okaab.lessons
      set is_published=1,updated_at=sysutcdatetime()
      where id=@lesson_id and is_published=0;

      update okaab.courses
      set is_published=1,updated_at=sysutcdatetime()
      where id=@course_id and is_published=0;

      update r
      set is_published=1,updated_at=sysutcdatetime()
      from okaab.roadmaps r
      join okaab.roadmap_courses rc on rc.roadmap_id=r.id
      where rc.course_id=@course_id and r.is_published=0;
    `);

  return {
    lessonId: hierarchy.lesson_id,
    courseId: hierarchy.course_id,
    roadmapIds: roadmapsResult.recordset.map((roadmap) => roadmap.id),
  };
}
