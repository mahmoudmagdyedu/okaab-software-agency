import { auth, clerkClient } from "@clerk/tanstack-react-start/server";

import type { AppRole, Profile } from "@/integrations/supabase/types";
import { getDb, sql } from "@/lib/db.server";
import { hasMinimumRole, isAdminDashboardRole, ROLE_LEVEL } from "@/lib/roles";

const SUPER_ADMIN_EMAIL = (process.env["SUPER_ADMIN_EMAIL"] || "okaab@okaab.org").toLowerCase();

function displayName(
  user: Awaited<ReturnType<ReturnType<typeof clerkClient>["users"]["getUser"]>>,
) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.primaryEmailAddress?.emailAddress || "Okaab User";
}

async function ensureLearnerProjection(profile: Profile) {
  const pool = await getDb();
  await pool
    .request()
    .input("id", sql.NVarChar(64), profile.id)
    .input("email", sql.NVarChar(320), profile.email)
    .input("display_name", sql.NVarChar(160), profile.display_name)
    .input("avatar_url", sql.NVarChar(1000), profile.avatar_url)
    .input("status", sql.NVarChar(20), profile.is_active ? "active" : "banned").query(`
      if not exists (select 1 from okaab.learner_profiles where id=@id)
        insert into okaab.learner_profiles (id,email,display_name,avatar_url,status)
        values (@id,@email,@display_name,@avatar_url,@status);
      else
        update okaab.learner_profiles set email=@email,display_name=@display_name,
          avatar_url=@avatar_url,status=case when status='deleted' then status else @status end,
          updated_at=sysutcdatetime() where id=@id;
    `);
}

/** Returns the single account record shared by the website and Android app. */
export async function getAccountProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const pool = await getDb();
  const current = await pool
    .request()
    .input("id", sql.NVarChar(64), userId)
    .query<Profile>("select top (1) * from okaab.profiles where id=@id");
  let profile = current.recordset[0];

  if (!profile) {
    const user = await clerkClient().users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) return null;
    const invite = await pool
      .request()
      .input("email", sql.NVarChar(320), email)
      .query<{ role: AppRole; team_id: string | null }>(
        "select top (1) role,team_id from okaab.pending_invites where email=@email and accepted_at is null and expires_at>sysutcdatetime() order by created_at desc",
      );
    const invited = invite.recordset[0];
    const role: AppRole = email === SUPER_ADMIN_EMAIL ? "super_admin" : invited?.role || "student";
    const teamId =
      role === "student" || role === "admin" || role === "super_admin"
        ? null
        : invited?.team_id || null;
    await pool
      .request()
      .input("id", sql.NVarChar(64), userId)
      .input("email", sql.NVarChar(320), email)
      .input("display_name", sql.NVarChar(160), displayName(user))
      .input("avatar_url", sql.NVarChar(1000), user.imageUrl || null)
      .input("role", sql.NVarChar(32), role)
      .input("team_id", sql.NVarChar(64), teamId).query(`
        if not exists (select 1 from okaab.profiles where id=@id)
          insert into okaab.profiles (id,email,display_name,avatar_url,role,team_id,is_active,last_seen_at)
          values (@id,@email,@display_name,@avatar_url,@role,@team_id,1,sysutcdatetime());
        update okaab.pending_invites set accepted_at=sysutcdatetime() where email=@email and accepted_at is null;
      `);
    const created = await pool
      .request()
      .input("id", sql.NVarChar(64), userId)
      .query<Profile>("select top (1) * from okaab.profiles where id=@id");
    profile = created.recordset[0];
  }

  if (!profile) return null;
  if (
    profile.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL &&
    (profile.role !== "super_admin" || !profile.is_active || profile.team_id !== null)
  ) {
    await pool
      .request()
      .input("id", sql.NVarChar(64), profile.id)
      .query(
        "update okaab.profiles set role='super_admin',team_id=null,is_active=1,last_seen_at=sysutcdatetime(),updated_at=sysutcdatetime() where id=@id",
      );
    profile = { ...profile, role: "super_admin", team_id: null, is_active: true };
  } else {
    await pool
      .request()
      .input("id", sql.NVarChar(64), profile.id)
      .query("update okaab.profiles set last_seen_at=sysutcdatetime() where id=@id");
  }
  await ensureLearnerProjection(profile);
  return profile;
}

export async function getAdminProfile(): Promise<Profile | null> {
  const profile = await getAccountProfile();
  return profile?.is_active && isAdminDashboardRole(profile.role) ? profile : null;
}

export async function requireAdminProfile(roles?: AppRole[]) {
  const profile = await getAdminProfile();
  if (!profile) throw new Response("Unauthorized", { status: 401 });
  const minimum =
    roles?.reduce<AppRole>(
      (lowest, role) => (ROLE_LEVEL[role] < ROLE_LEVEL[lowest] ? role : lowest),
      roles[0] || "employee",
    ) || "employee";
  if (!hasMinimumRole(profile.role, minimum)) throw new Response("Forbidden", { status: 403 });
  return profile;
}
