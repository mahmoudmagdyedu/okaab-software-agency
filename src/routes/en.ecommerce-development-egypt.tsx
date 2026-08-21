import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding, buildServiceHead } from "@/components/okaab/ServiceLanding";
import { ecommerceEn } from "@/content/service-pages/ecommerce";

export const Route = createFileRoute("/en/ecommerce-development-egypt")({
  head: () => buildServiceHead(ecommerceEn),
  component: () => <ServiceLanding content={ecommerceEn} />,
});
