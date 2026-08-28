import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/okaab/LegalDocumentPage";
import { PRIVACY_COPY } from "@/content/legal";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/en/privacy")({
  head: () => legalHead("en", "privacy", "Privacy Policy — OKAAB and Mawid", PRIVACY_COPY.en.intro),
  component: () => <LegalDocumentPage lang="en" slug="privacy" copy={PRIVACY_COPY.en} />,
});
