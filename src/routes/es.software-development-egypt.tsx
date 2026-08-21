import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { softwareEs } from "@/content/service-pages/software";

export const Route = createFileRoute("/es/software-development-egypt")({
  head: () => buildServiceHead(softwareEs),
  component: () => <ServiceLanding content={softwareEs} />,
});
