import { clerkClient } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";

import { requireAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";
import type { AppRole } from "@/integrations/supabase/types";

const ROLE_LABELS: Record<Exclude<AppRole, "super_admin">, string> = {
  admin: "أدمن",
  team_leader: "تيم ليدر",
  employee: "موظف",
  student: "طالب",
};

export const Route = createFileRoute("/api/admin/invite")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await requireAdminProfile(["super_admin", "admin"]);
          const [pool, clerk] = await Promise.all([getDb(), clerkClient()]);
          const [databaseInvites, clerkInvites] = await Promise.all([
            pool.request().query(`
              select i.id, i.email, i.role, i.team_id, i.created_at, i.expires_at,
                     t.name as team_name
              from okaab.pending_invites i
              left join okaab.teams t on t.id = i.team_id
              where i.accepted_at is null and i.expires_at > sysutcdatetime()
              order by i.created_at desc
            `),
            clerk.invitations.getInvitationList({ status: "pending", limit: 100 }),
          ]);
          const clerkByEmail = new Map(
            clerkInvites.data.map((item) => [item.emailAddress.toLowerCase(), item]),
          );
          const invitations = databaseInvites.recordset.map((row) => {
            const clerkInvite = clerkByEmail.get(String(row.email).toLowerCase());
            return {
              id: String(row.id),
              email: String(row.email),
              role: String(row.role),
              teamId: row.team_id ? String(row.team_id) : null,
              teamName: row.team_name ? String(row.team_name) : null,
              createdAt: new Date(row.created_at).toISOString(),
              expiresAt: new Date(row.expires_at).toISOString(),
              invitationUrl: clerkInvite?.url ?? null,
            };
          });
          return Response.json({ invitations }, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Loading admin invitations failed", error);
          return Response.json({ error: "تعذّر تحميل الدعوات المعلقة" }, { status: 500 });
        }
      },
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
          if (!email || !role || !["admin", "team_leader", "employee", "student"].includes(role))
            return Response.json({ error: "بيانات الدعوة غير مكتملة" }, { status: 400 });
          if (role === "admin" && actor.role !== "super_admin")
            return Response.json({ error: "السوبر أدمن فقط يمكنه تعيين أدمن" }, { status: 403 });
          if (!["student", "admin"].includes(role) && !input.teamId)
            return Response.json({ error: "اختر الفريق أولًا" }, { status: 400 });

          const pool = await getDb();
          if (!["student", "admin"].includes(role)) {
            const team = await pool
              .request()
              .input("team_id", sql.NVarChar(64), input.teamId)
              .query("select top (1) id from okaab.teams where id=@team_id and is_active=1");
            if (!team.recordset[0])
              return Response.json(
                { error: "الفريق المحدد غير موجود أو غير نشط" },
                { status: 400 },
              );
          }

          const clerk = await clerkClient();
          const users = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
          if (users.data.length)
            return Response.json(
              { error: "هذا البريد لديه حساب بالفعل. عدّل صلاحيته من قائمة الأعضاء." },
              { status: 409 },
            );

          const pending = await clerk.invitations.getInvitationList({
            status: "pending",
            query: email,
            limit: 100,
          });
          for (const existing of pending.data.filter(
            (item) => item.emailAddress.toLowerCase() === email,
          )) {
            await clerk.invitations.revokeInvitation(existing.id);
          }

          const invitation = await clerk.invitations.createInvitation({
            emailAddress: email,
            redirectUrl:
              role === "student" ? "https://okaab.org/dashboard" : "https://okaab.org/admin",
            expiresInDays: 7,
            ignoreExisting: false,
            notify: false,
            publicMetadata: {
              okaabRole: role,
              okaabTeamId: ["student", "admin"].includes(role) ? null : input.teamId || null,
            },
          });
          if (!invitation.url) throw new Error("Clerk invitation URL is missing");

          const inviteId = crypto.randomUUID();
          try {
            await pool
              .request()
              .input("id", sql.NVarChar(64), inviteId)
              .input("email", sql.NVarChar(320), email)
              .input("role", sql.NVarChar(32), role)
              .input(
                "team_id",
                sql.NVarChar(64),
                ["student", "admin"].includes(role) ? null : input.teamId || null,
              )
              .input("invited_by", sql.NVarChar(64), actor.id).query(`
                update okaab.pending_invites set accepted_at = sysutcdatetime() where email = @email and accepted_at is null;
                insert into okaab.pending_invites (id,email,role,team_id,invited_by,expires_at)
                values (@id,@email,@role,@team_id,@invited_by,dateadd(day,7,sysutcdatetime()));
              `);

            await sendTemplateEmail("invite", email, {
              idempotencyKey: `okaab-admin-invite-${invitation.id}`,
              templateData: {
                siteName: "عُقاب OKAAB",
                siteUrl: "https://okaab.org",
                confirmationUrl: invitation.url,
                roleLabel: ROLE_LABELS[role as Exclude<AppRole, "super_admin">],
                expiresInDays: 7,
              },
            });
          } catch (error) {
            await Promise.allSettled([
              clerk.invitations.revokeInvitation(invitation.id),
              pool
                .request()
                .input("id", sql.NVarChar(64), inviteId)
                .query("delete from okaab.pending_invites where id=@id"),
            ]);
            throw error;
          }
          return Response.json({
            ok: true,
            email,
            invitationUrl: invitation.url,
            message: "تم إنشاء الدعوة وقبلت خدمة البريد إرسال الرسالة.",
          });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Admin invitation failed", error);
          return Response.json({ error: "تعذّر إرسال الدعوة الآن" }, { status: 500 });
        }
      },
    },
  },
});
