import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "../components/AdminShell";
import { getCurrentUserFn } from "../lib/auth.functions";
import { systemRoles } from "../lib/auth-types";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const demoRole = new URLSearchParams(location.searchStr).get("demo");
    if (demoRole && systemRoles.includes(demoRole as (typeof systemRoles)[number])) {
      return { demoRole };
    }

    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    if (user.passwordResetRequired) throw redirect({ to: "/change-password" });
    return { user };
  },
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — فوترة" },
      {
        name: "description",
        content:
          "لوحة إدارة نظام فوترة الفاتحة: الفواتير، الشفتات، الأصناف، المخزون، التقارير، والإعدادات.",
      },
      { property: "og:title", content: "لوحة الإدارة — فوترة" },
      {
        property: "og:description",
        content: "لوحة إدارة نظام فوترة الفاتحة لمقهى بُنّ الديرة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminShell,
});
