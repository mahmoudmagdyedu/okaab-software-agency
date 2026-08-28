import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://okaab.org";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/bun-al-deerah", changefreq: "weekly", priority: "0.8" },
          { path: "/privacy", changefreq: "yearly", priority: "0.4" },
          { path: "/terms", changefreq: "yearly", priority: "0.4" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/en/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/en/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/en/about", changefreq: "monthly", priority: "0.6" },
          { path: "/courses", changefreq: "daily", priority: "0.9" },
          { path: "/ecommerce-development-egypt", changefreq: "monthly", priority: "0.8" },
          { path: "/software-development-egypt", changefreq: "monthly", priority: "0.8" },
          { path: "/en/ecommerce-development-egypt", changefreq: "monthly", priority: "0.7" },
          { path: "/fr/ecommerce-development-egypt", changefreq: "monthly", priority: "0.7" },
          { path: "/es/ecommerce-development-egypt", changefreq: "monthly", priority: "0.7" },
          { path: "/en/software-development-egypt", changefreq: "monthly", priority: "0.7" },
          { path: "/fr/software-development-egypt", changefreq: "monthly", priority: "0.7" },
          { path: "/es/software-development-egypt", changefreq: "monthly", priority: "0.7" },
        ];

        try {
          const { getDb } = await import("@/lib/db.server");
          const database = await getDb();
          const courses = await database
            .request()
            .query<{ id: string; slug: string }>(
              "select id,slug from okaab.courses where is_published=1",
            );
          for (const course of courses.recordset) {
            entries.push({
              path: `/courses/${course.slug}`,
              changefreq: "weekly",
              priority: "0.8",
            });
            const { sql } = await import("@/lib/db.server");
            const lessons = await database
              .request()
              .input("course_id", sql.NVarChar(64), course.id)
              .query<{ slug: string }>(
                "select slug from okaab.lessons where course_id=@course_id and is_published=1",
              );
            for (const lesson of lessons.recordset)
              entries.push({
                path: `/courses/${course.slug}/${lesson.slug}`,
                changefreq: "weekly",
                priority: "0.7",
              });
          }
        } catch (error) {
          console.error("Dynamic course sitemap entries unavailable", error);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
