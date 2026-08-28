import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/okaab/LegalDocumentPage";
import { PRIVACY_COPY } from "@/content/legal";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/privacy")({
  head: () => legalHead("ar", "privacy", "سياسة الخصوصية — عُقاب ومَوعِد", PRIVACY_COPY.ar.intro),
  component: () => <LegalDocumentPage lang="ar" slug="privacy" copy={PRIVACY_COPY.ar} />,
});
