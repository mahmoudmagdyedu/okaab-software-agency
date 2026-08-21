import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  EMAIL_GENERAL,
  EMAIL_SALES,
  EMAIL_SUPPORT,
  SITE_URL,
  WHATSAPP,
  whatsappLink,
} from "../content";

export default defineTool({
  name: "get_contact_info",
  title: "Get Okaab contact details",
  description:
    "Get Okaab's public contact channels: WhatsApp number and link, general/sales/support email addresses, and the website URL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const contact = {
      website: SITE_URL,
      whatsapp: WHATSAPP,
      whatsapp_link: whatsappLink(),
      email_general: EMAIL_GENERAL,
      email_sales: EMAIL_SALES,
      email_support: EMAIL_SUPPORT,
      response_time: "First reply in under 15 minutes, support available 24/7.",
    };
    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Website: ${contact.website}`,
            `WhatsApp: ${contact.whatsapp} (${contact.whatsapp_link})`,
            `General: ${contact.email_general}`,
            `Sales: ${contact.email_sales}`,
            `Support: ${contact.email_support}`,
            contact.response_time,
          ].join("\n"),
        },
      ],
      structuredContent: contact,
    };
  },
});
