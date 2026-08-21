import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { dict } from "../content";

export default defineTool({
  name: "list_services",
  title: "List Okaab services",
  description:
    "List the software services Okaab offers (web development, mobile apps, 24/7 support, server deployment, SEO, pricing philosophy), with a short description of each.",
  inputSchema: {
    locale: z
      .enum(["en", "ar"])
      .optional()
      .describe("Language of the returned copy. 'en' English, 'ar' Egyptian Arabic. Defaults to 'en'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locale }) => {
    const d = dict(locale ?? "en");
    const services = d.services.map((s) => ({ title: s.title, description: s.copy }));
    return {
      content: [
        {
          type: "text" as const,
          text: services.map((s) => `- ${s.title}: ${s.description}`).join("\n"),
        },
      ],
      structuredContent: { services },
    };
  },
});
