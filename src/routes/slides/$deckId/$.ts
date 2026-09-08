import { createFileRoute } from "@tanstack/react-router";
import { createBridgeScript } from "../../../../packages/bridge/index.js";

import { getDb, sql } from "../../../lib/db.server.ts";

export function sanitizeSlidePath(rawSplat?: string): string | null {
  if (!rawSplat) return "index.html";
  let decoded = rawSplat;
  try {
    decoded = decodeURIComponent(rawSplat);
  } catch {
    return null;
  }
  const normalized = decoded.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.includes("\0")) {
    return null;
  }
  return normalized;
}

export const Route = createFileRoute("/slides/$deckId/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Prevent path traversal by sanitizing and validating slide asset path
        const path = sanitizeSlidePath(params._splat);
        if (!path) return new Response("Not found", { status: 404 });
        const pool = await getDb();
        const result = await pool
          .request()
          .input("deck_id", sql.NVarChar(64), params.deckId)
          .input("path", sql.NVarChar(600), path)
          .query<{ content: Buffer; content_type: string }>(
            `select top (1) a.content, a.content_type
             from okaab.slide_assets a
             join okaab.slide_decks d on d.id=a.deck_id
             join okaab.lessons l on l.id=d.lesson_id
             join okaab.courses c on c.id=l.course_id
             where a.deck_id=@deck_id and a.path=@path and d.is_published=1
               and l.is_published=1 and c.is_published=1 and a.is_source=0`,
          );
        const asset = result.recordset[0];
        if (!asset) return new Response("Not found", { status: 404 });
        const isHtml = asset.content_type.toLowerCase().includes("text/html") || path.toLowerCase().endsWith(".html");
        let body: Uint8Array | string = new Uint8Array(asset.content);
        if (isHtml) {
          const source = asset.content.toString("utf8");
          const bridge = `<script data-okaab-bridge>${createBridgeScript()}</script>`;
          body = source.includes("</body>") ? source.replace("</body>", `${bridge}</body>`) : `${source}${bridge}`;
        }
        return new Response(body, {
          headers: {
            "content-type": asset.content_type,
            "cache-control": isHtml ? "public, max-age=300" : "public, max-age=31536000, immutable",
            "content-security-policy":
              "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; media-src 'self' blob: https:; connect-src 'none'; frame-ancestors 'self'",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
