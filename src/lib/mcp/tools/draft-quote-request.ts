import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { EMAIL_SALES, whatsappLink } from "../content";

export default defineTool({
  name: "draft_quote_request",
  title: "Draft a quote request",
  description:
    "Build a ready-to-send quote request for Okaab from the caller's project details. Returns a formatted message plus a prefilled WhatsApp link and mailto link — it does not send anything itself.",
  inputSchema: {
    name: z.string().describe("Name of the person or company requesting the quote."),
    email: z.string().describe("Contact email address."),
    phone: z.string().optional().describe("Contact mobile number, including country code."),
    service: z
      .string()
      .describe("Type of service needed, e.g. website, e-commerce store, dashboard, mobile app, servers, SEO."),
    details: z.string().describe("Description of the project: goals, scope, budget and timeline if known."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ name, email, phone, service, details }) => {
    const message = [
      "Quote request — Okaab",
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Service: ${service}`,
      `Details: ${details}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = {
      message,
      whatsapp_link: whatsappLink(message),
      mailto_link: `mailto:${EMAIL_SALES}?subject=${encodeURIComponent(
        `Quote request — ${service}`,
      )}&body=${encodeURIComponent(message)}`,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${message}\n\nSend on WhatsApp: ${result.whatsapp_link}\nSend by email: ${result.mailto_link}`,
        },
      ],
      structuredContent: result,
    };
  },
});
