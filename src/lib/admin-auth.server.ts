import { auth, clerkClient } from "@clerk/tanstack-react-start/server";

import { getDb, sql } from "@/lib/db.server";
import type { AppRole, Profile } from "@/integrations/supabase/types";

const SUPER_ADMIN_EMAIL = (process.env["SUPER_ADMIN_EMAIL"] || "okaab@okaab.org").toLowerCase();

function displayName(
  user: Awaited<ReturnType<ReturnType<typeof clerkClient>["users"]["getUser"]>>,
) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.primaryEmailAddress?.emailAddress || "Okaab User";
}

export async function getAdminProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const pool = await getDb();
  const current = await pool
    .request()
    .input("id", sql.NVarChar(64), userId)
    .query<Profile>("select top (1) * from okaab.profiles where id = @id");
  if (current.recordset[0]) return current.recordset[0].is_active ? current.recordset[0] : null;

  const user = await clerkClient().users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (!email) return null;

  const invite = await pool
    .request()
    .input("email", sql.NVarChar(320), email)
    .query<{ role: AppRole; team_id: string | null }>(
      "select top (1) role, team_id from okaab.pending_invites where email = @email and accepted_at is null and expires_at > sysutcdatetime() order by created_at desc",
    );
  const invited = invite.recordset[0];
  if (email !== SUPER_ADMIN_EMAIL && !invited) return null;

  const role: AppRole = email === SUPER_ADMIN_EMAIL ? "super_admin" : invited!.role;
  const teamId = email === SUPER_ADMIN_EMAIL ? null : invited!.team_id;
  const request = pool
    .request()
    .input("id", sql.NVarChar(64), userId)
    .input("email", sql.NVarChar(320), email)
    .input("display_name", sql.NVarChar(160), displayName(user))
    .input("avatar_url", sql.NVarChar(1000), user.imageUrl || null)
    .input("role", sql.NVarChar(32), role)
    .input("team_id", sql.NVarChar(64), teamId);
  await request.query(`
    insert into okaab.profiles (id, email, display_name, avatar_url, role, team_id, is_active, last_seen_at)
    values (@id, @email, @display_name, @avatar_url, @role, @team_id, 1, sysutcdatetime());
    update okaab.pending_invites set accepted_at = sysutcdatetime() where email = @email and accepted_at is null;
  `);
  const created = await pool
    .request()
    .input("id", sql.NVarChar(64), userId)
    .query<Profile>("select top (1) * from okaab.profiles where id = @id");
  return created.recordset[0] ?? null;
}

export async function requireAdminProfile(roles?: AppRole[]) {
  const profile = await getAdminProfile();
  if (!profile) throw new Response("Unauthorized", { status: 401 });
  if (roles && !roles.includes(profile.role)) throw new Response("Forbidden", { status: 403 });
  return profile;
}
