import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { softwareEn } from "@/content/service-pages/software";

export const Route = createFileRoute("/en/software-development-egypt")({
  head: () => buildServiceHead(softwareEn),
  component: () => <ServiceLanding content={softwareEn} />,
});
