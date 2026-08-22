import { createFileRoute, notFound } from "@tanstack/react-router";

import MawidBooking from "@/components/mawid/MawidBooking";

export const Route = createFileRoute("/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug !== "maw'id") throw notFound();
  },
  head: () => ({
    meta: [
      { title: "مَوعِد — احجز موعدك أونلاين | عُقاب" },
      {
        name: "description",
        content: "احجز موعدك أونلاين: اختر الفرع والخدمة ومقدم الخدمة والوقت، ثم أكّد الحجز فوراً.",
      },
      { property: "og:title", content: "مَوعِد — منصة حجز المواعيد" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://okaab.org/maw'id" },
    ],
    links: [{ rel: "canonical", href: "https://okaab.org/maw'id" }],
  }),
  component: MawidBooking,
});
