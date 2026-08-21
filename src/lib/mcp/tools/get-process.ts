import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { dict } from "../content";

export default defineTool({
  name: "get_process",
  title: "Get how Okaab works",
  description:
    "Get Okaab's working process (discovery, design, build & test, launch & support) plus a short description of the team.",
  inputSchema: {
    locale: z
      .enum(["en", "ar"])
      .optional()
      .describe("Language of the returned copy. Defaults to 'en'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locale }) => {
    const d = dict(locale ?? "en");
    const steps = d.about.steps.map((s) => ({ title: s.title, description: s.copy }));
    return {
      content: [
        {
          type: "text" as const,
          text: `${d.about.paragraph}\n\n${steps
            .map((s, i) => `${i + 1}. ${s.title}: ${s.description}`)
            .join("\n")}`,
        },
      ],
      structuredContent: { about: d.about.paragraph, steps },
    };
  },
});
