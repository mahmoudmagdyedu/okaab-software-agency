import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { ecommerceAr } from "@/content/service-pages/ecommerce";

export const Route = createFileRoute("/ecommerce-development-egypt")({
  head: () => buildServiceHead(ecommerceAr),
  component: () => <ServiceLanding content={ecommerceAr} />,
});
