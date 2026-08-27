import { createFileRoute } from "@tanstack/react-router";

import { getDb, sql } from "@/lib/db.server";

export const Route = createFileRoute("/slides/$deckId/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params._splat || "index.html").replace(/^\/+/, "");
        if (path.includes("..")) return new Response("Not found", { status: 404 });
        const pool = await getDb();
        const result = await pool
          .request()
          .input("deck_id", sql.NVarChar(64), params.deckId)
          .input("path", sql.NVarChar(600), path)
          .query<{ content: Buffer; content_type: string }>(
            `select top (1) a.content, a.content_type from okaab.slide_assets a join okaab.slide_decks d on d.id=a.deck_id where a.deck_id=@deck_id and a.path=@path and d.is_published=1 and a.is_source=0`,
          );
        const asset = result.recordset[0];
        if (!asset) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(asset.content), {
          headers: {
            "content-type": asset.content_type,
            "cache-control": "public, max-age=31536000, immutable",
            "content-security-policy":
              "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; media-src 'self' blob: https:; connect-src 'none'; frame-ancestors 'self'",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
