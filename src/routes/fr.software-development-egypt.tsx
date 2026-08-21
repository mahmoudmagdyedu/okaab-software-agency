import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { softwareFr } from "@/content/service-pages/software";

export const Route = createFileRoute("/fr/software-development-egypt")({
  head: () => buildServiceHead(softwareFr),
  component: () => <ServiceLanding content={softwareFr} />,
});
