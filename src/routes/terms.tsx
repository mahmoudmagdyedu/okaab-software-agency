import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/okaab/LegalDocumentPage";
import { TERMS_COPY } from "@/content/legal";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/terms")({
  head: () => legalHead("ar", "terms", "الشروط والأحكام — عُقاب ومَوعِد", TERMS_COPY.ar.intro),
  component: () => <LegalDocumentPage lang="ar" slug="terms" copy={TERMS_COPY.ar} />,
});
