import { defineMcp } from "@lovable.dev/mcp-js";
import listServices from "./tools/list-services";
import getPricingCatalog from "./tools/get-pricing-catalog";
import getProcess from "./tools/get-process";
import getContactInfo from "./tools/get-contact-info";
import draftQuoteRequest from "./tools/draft-quote-request";

export default defineMcp({
  name: "okaab-software-agency",
  title: "Okaab Software Agency",
  version: "0.1.0",
  instructions:
    "Tools for Okaab (عُقاب), a software agency that builds large, complex websites and mobile apps. Use `list_services` for what Okaab does, `get_pricing_catalog` for indicative timelines and tech stacks, `get_process` for how the team works, `get_contact_info` for WhatsApp and email channels, and `draft_quote_request` to turn a project brief into a ready-to-send quote request. All content is public marketing information; final scope and timeline are confirmed after a discovery call.",
  tools: [
    listServices,
    getPricingCatalog,
    getProcess,
    getContactInfo,
    draftQuoteRequest,
  ] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
