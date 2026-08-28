import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/okaab/LegalDocumentPage";
import { TERMS_COPY } from "@/content/legal";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/en/terms")({
  head: () =>
    legalHead("en", "terms", "Terms and Conditions — OKAAB and Mawid", TERMS_COPY.en.intro),
  component: () => <LegalDocumentPage lang="en" slug="terms" copy={TERMS_COPY.en} />,
});
