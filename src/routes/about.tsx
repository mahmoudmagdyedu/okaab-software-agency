import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/components/okaab/AboutPage";
import { ABOUT_COPY } from "@/content/legal";
import { aboutHead } from "@/lib/legal-head";

export const Route = createFileRoute("/about")({
  head: () => aboutHead("ar", "من نحن — عُقاب OKAAB", ABOUT_COPY.ar.intro),
  component: () => <AboutPage lang="ar" copy={ABOUT_COPY.ar} />,
});
