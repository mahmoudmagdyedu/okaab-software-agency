import { auth, clerkClient } from "@clerk/tanstack-react-start/server";

import type { AppRole, Profile } from "@/integrations/supabase/types";
import { getDb, sql } from "@/lib/db.server";
import { hasMinimumRole, isAdminDashboardRole, ROLE_LEVEL } from "@/lib/roles";

const SUPER_ADMIN_EMAIL = (process.env["SUPER_ADMIN_EMAIL"] || "okaab@okaab.org").toLowerCase();

type StoredProfile = Profile & { effective_role?: AppRole };

async function loadAccountProfile(userId: string) {
  const pool = await getDb();
  const result = await pool.request().input("id", sql.NVarChar(64), userId).query<StoredProfile>(`
    select top (1) p.*,coalesce(ar.role_key,p.role) effective_role
    from okaab.profiles p
    left join okaab.account_roles ar on ar.user_id=p.id
    left join okaab.clerk_user_links cul on cul.profile_id=p.id
    where p.id=@id or cul.clerk_user_id=@id
  `);
  const stored = result.recordset[0];
  return stored
    ? ({ ...stored, role: stored.effective_role || stored.role } as Profile)
    : undefined;
}

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
  let profile = await loadAccountProfile(userId);

  if (!profile) {
    const user = await clerkClient().users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) return null;
    const existing = await pool
      .request()
      .input("email", sql.NVarChar(320), email)
      .query<{ id: string }>("select top (1) id from okaab.profiles where lower(email)=@email");
    const existingProfileId = existing.recordset[0]?.id;
    if (existingProfileId) {
      await pool
        .request()
        .input("clerk_user_id", sql.NVarChar(64), userId)
        .input("profile_id", sql.NVarChar(64), existingProfileId)
        .input("email", sql.NVarChar(320), email).query(`
          if not exists (select 1 from okaab.clerk_user_links where clerk_user_id=@clerk_user_id)
            insert into okaab.clerk_user_links (clerk_user_id,profile_id,linked_email)
            values (@clerk_user_id,@profile_id,@email);
        `);
      profile = await loadAccountProfile(userId);
    }
    if (!profile) {
      const invite = await pool
        .request()
        .input("email", sql.NVarChar(320), email)
        .query<{ role: AppRole; team_id: string | null }>(
          "select top (1) role,team_id from okaab.pending_invites where email=@email and accepted_at is null and expires_at>sysutcdatetime() order by created_at desc",
        );
      const invited = invite.recordset[0];
      const role: AppRole =
        email === SUPER_ADMIN_EMAIL ? "super_admin" : invited?.role || "student";
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
          if not exists (select 1 from okaab.account_roles where user_id=@id)
            insert into okaab.account_roles (user_id,role_key) values (@id,@role);
          if not exists (select 1 from okaab.clerk_user_links where clerk_user_id=@id)
            insert into okaab.clerk_user_links (clerk_user_id,profile_id,linked_email)
            values (@id,@id,@email);
          update okaab.pending_invites set accepted_at=sysutcdatetime() where email=@email and accepted_at is null;
        `);
      profile = await loadAccountProfile(userId);
    }
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
        `update okaab.profiles set role='super_admin',team_id=null,is_active=1,last_seen_at=sysutcdatetime(),updated_at=sysutcdatetime() where id=@id;
         update okaab.account_roles set role_key='super_admin',updated_at=sysutcdatetime() where user_id=@id;`,
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
