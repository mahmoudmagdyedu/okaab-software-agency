import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { publishLessonHierarchy } from "@/lib/course-publication.server";
import { getDb, sql } from "@/lib/db.server";

const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const MAX_FILES = 750;

type Metadata = {
  lessonId: string;
  videoId: string | null;
  title: string;
  archiveName: string | null;
  archiveSizeBytes: number | null;
  fileCount: number;
  allowDownload: boolean;
  isPublished: boolean;
  sortOrder: number;
};

function safePath(value: string) {
  const normalized = value.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.includes("\0"))
    throw new Error("مسار ملف غير آمن");
  return normalized;
}

export const Route = createFileRoute("/api/admin/slides/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const profile = await requireAdminProfile(["super_admin", "admin"]);
          const form = await request.formData();
          const rawMetadata = form.get("metadata");
          if (typeof rawMetadata !== "string")
            return Response.json({ error: "بيانات الرفع ناقصة" }, { status: 400 });
          const metadata = JSON.parse(rawMetadata) as Metadata;
          if (!metadata.lessonId || !metadata.title)
            return Response.json({ error: "اختر الدرس واكتب العنوان" }, { status: 400 });

          const assets: { path: string; file: File }[] = [];
          for (const [name, value] of form.entries()) {
            if (!name.startsWith("asset:") || !(value instanceof File)) continue;
            assets.push({ path: safePath(decodeURIComponent(name.slice(6))), file: value });
          }
          if (!assets.some((item) => item.path === "index.html"))
            return Response.json({ error: "ملف index.html غير موجود" }, { status: 400 });
          if (assets.length > MAX_FILES)
            return Response.json({ error: "عدد الملفات أكبر من الحد المسموح" }, { status: 413 });
          const total = assets.reduce((sum, item) => sum + item.file.size, 0);
          if (total > MAX_TOTAL_BYTES)
            return Response.json({ error: "الحزمة أكبر من 40MB بعد التجهيز" }, { status: 413 });

          const pool = await getDb();
          const transaction = new sql.Transaction(pool);
          const deckId = crypto.randomUUID();
          const storageRoot = `${metadata.lessonId}/${deckId}`;
          await transaction.begin();
          try {
            await new sql.Request(transaction)
              .input("id", sql.NVarChar(64), deckId)
              .input("lesson_id", sql.NVarChar(64), metadata.lessonId)
              .input("video_id", sql.NVarChar(64), metadata.videoId)
              .input("title", sql.NVarChar(300), metadata.title)
              .input("storage_root", sql.NVarChar(200), storageRoot)
              .input("archive_name", sql.NVarChar(300), metadata.archiveName)
              .input("archive_size", sql.BigInt, metadata.archiveSizeBytes)
              .input("file_count", sql.Int, metadata.fileCount)
              .input("allow_download", sql.Bit, metadata.allowDownload)
              .input("is_published", sql.Bit, metadata.isPublished)
              .input("sort_order", sql.Int, metadata.sortOrder)
              .input("uploaded_by", sql.NVarChar(64), profile.id)
              .query(`insert into okaab.slide_decks (id, lesson_id, video_id, title, storage_root, entry_path, archive_name, archive_size_bytes, file_count, allow_download, is_published, sort_order, uploaded_by)
                values (@id,@lesson_id,@video_id,@title,@storage_root,'index.html',@archive_name,@archive_size,@file_count,@allow_download,@is_published,@sort_order,@uploaded_by)`);
            const publishedHierarchy = metadata.isPublished
              ? await publishLessonHierarchy(transaction, metadata.lessonId)
              : null;
            for (const asset of assets) {
              const bytes = Buffer.from(await asset.file.arrayBuffer());
              await new sql.Request(transaction)
                .input("deck_id", sql.NVarChar(64), deckId)
                .input("path", sql.NVarChar(600), asset.path)
                .input(
                  "content_type",
                  sql.NVarChar(160),
                  asset.file.type || "application/octet-stream",
                )
                .input("content", sql.VarBinary(sql.MAX), bytes)
                .input("size", sql.BigInt, bytes.length)
                .input(
                  "is_source",
                  sql.Bit,
                  asset.path === "source.zip" || asset.path === "source.html",
                )
                .query(
                  "insert into okaab.slide_assets (deck_id,path,content_type,content,size_bytes,is_source) values (@deck_id,@path,@content_type,@content,@size,@is_source)",
                );
            }
            await transaction.commit();
            return Response.json({
              id: deckId,
              fileCount: assets.length,
              publishedHierarchy,
            });
          } catch (error) {
            await transaction.rollback();
            throw error;
          }
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Slide upload failed", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "تعذّر رفع الملف" },
            { status: 400 },
          );
        }
      },
    },
  },
});
