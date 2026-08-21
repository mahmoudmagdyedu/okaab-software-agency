import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { softwareAr } from "@/content/service-pages/software";

export const Route = createFileRoute("/software-development-egypt")({
  head: () => buildServiceHead(softwareAr),
  component: () => <ServiceLanding content={softwareAr} />,
});
