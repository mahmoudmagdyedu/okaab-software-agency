import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { ecommerceFr } from "@/content/service-pages/ecommerce";

export const Route = createFileRoute("/fr/ecommerce-development-egypt")({
  head: () => buildServiceHead(ecommerceFr),
  component: () => <ServiceLanding content={ecommerceFr} />,
});
