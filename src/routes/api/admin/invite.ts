import { clerkClient } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";
import type { AppRole } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/admin/invite")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const actor = await requireAdminProfile(["super_admin", "admin"]);
          const input = (await request.json()) as {
            email?: string;
            role?: AppRole;
            teamId?: string | null;
          };
          const email = input.email?.trim().toLowerCase();
          const role = input.role;
          if (!email || !role || !["admin", "team_leader", "employee"].includes(role))
            return Response.json({ error: "بيانات الدعوة غير مكتملة" }, { status: 400 });
          if (role === "admin" && actor.role !== "super_admin")
            return Response.json({ error: "السوبر أدمن فقط يمكنه تعيين أدمن" }, { status: 403 });
          if (role !== "admin" && !input.teamId)
            return Response.json({ error: "اختر الفريق أولًا" }, { status: 400 });

          const pool = await getDb();
          await pool
            .request()
            .input("email", sql.NVarChar(320), email)
            .input("role", sql.NVarChar(32), role)
            .input("team_id", sql.NVarChar(64), role === "admin" ? null : input.teamId || null)
            .input("invited_by", sql.NVarChar(64), actor.id).query(`
              update okaab.pending_invites set accepted_at = sysutcdatetime() where email = @email and accepted_at is null;
              insert into okaab.pending_invites (email, role, team_id, invited_by, expires_at)
              values (@email, @role, @team_id, @invited_by, dateadd(day, 7, sysutcdatetime()));
            `);

          await clerkClient().invitations.createInvitation({
            emailAddress: email,
            redirectUrl: `${new URL(request.url).origin}/admin`,
            ignoreExisting: true,
          });
          return Response.json({ ok: true });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Admin invitation failed", error);
          return Response.json({ error: "تعذّر إرسال الدعوة الآن" }, { status: 500 });
        }
      },
    },
  },
});
