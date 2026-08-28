import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/components/okaab/AboutPage";
import { ABOUT_COPY } from "@/content/legal";
import { aboutHead } from "@/lib/legal-head";

export const Route = createFileRoute("/en/about")({
  head: () => aboutHead("en", "About OKAAB — Software Agency in Egypt", ABOUT_COPY.en.intro),
  component: () => <AboutPage lang="en" copy={ABOUT_COPY.en} />,
});
