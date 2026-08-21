import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { dict } from "../content";

export default defineTool({
  name: "get_pricing_catalog",
  title: "Get pricing catalog",
  description:
    "Get Okaab's service catalog: project type, typical tech stack and typical timeline. Final scope and timeline are confirmed after a short discovery call.",
  inputSchema: {
    locale: z
      .enum(["en", "ar"])
      .optional()
      .describe("Language of the returned copy. Defaults to 'en'."),
    query: z
      .string()
      .optional()
      .describe("Optional free-text filter matched against the project type and stack, e.g. 'mobile', 'store', 'server'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locale, query }) => {
    const d = dict(locale ?? "en");
    const needle = query?.trim().toLowerCase();
    const rows = d.catalog.rows
      .filter((r) =>
        needle ? `${r.title} ${r.stack}`.toLowerCase().includes(needle) : true,
      )
      .map((r) => ({ item: r.title, stack: r.stack, timeline: r.time }));

    return {
      content: [
        {
          type: "text" as const,
          text:
            (rows.length
              ? rows.map((r) => `- ${r.item} — ${r.stack} — ${r.timeline}`).join("\n")
              : "No catalog item matched that query.") +
            `\n\n${d.catalog.note}`,
        },
      ],
      structuredContent: { rows, note: d.catalog.note },
    };
  },
});
