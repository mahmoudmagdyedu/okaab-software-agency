import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { ecommerceEs } from "@/content/service-pages/ecommerce";

export const Route = createFileRoute("/es/ecommerce-development-egypt")({
  head: () => buildServiceHead(ecommerceEs),
  component: () => <ServiceLanding content={ecommerceEs} />,
});
