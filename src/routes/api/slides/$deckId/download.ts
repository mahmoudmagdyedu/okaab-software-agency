import { createFileRoute } from "@tanstack/react-router";

import { getDb, sql } from "@/lib/db.server";

export const Route = createFileRoute("/api/slides/$deckId/download")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const pool = await getDb();
        const result = await pool
          .request()
          .input("deck_id", sql.NVarChar(64), params.deckId)
          .query<{ content: Buffer; content_type: string; archive_name: string | null }>(
            `select top (1) a.content,a.content_type,d.archive_name
             from okaab.slide_assets a
             join okaab.slide_decks d on d.id=a.deck_id
             join okaab.lessons l on l.id=d.lesson_id
             join okaab.courses c on c.id=l.course_id
             where a.deck_id=@deck_id and a.is_source=1 and d.is_published=1
               and l.is_published=1 and c.is_published=1 and d.allow_download=1`,
          );
        const asset = result.recordset[0];
        if (!asset) return new Response("Not found", { status: 404 });
        const name = (asset.archive_name || "slides.zip").replace(/[^a-zA-Z0-9._-]/g, "_");
        return new Response(new Uint8Array(asset.content), {
          headers: {
            "content-type": asset.content_type,
            "content-disposition": `attachment; filename="${name}"`,
            "cache-control": "private, no-store",
          },
        });
      },
    },
  },
});
