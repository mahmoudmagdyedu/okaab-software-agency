import type { AppRole } from "@/integrations/supabase/types";

const SITE_ORIGIN = "https://okaab.org";

/**
 * Clerk app invitations must land on a page that renders <SignUp /> so the
 * __clerk_ticket appended by Clerk can be claimed. The nested redirect_url is
 * then used only after account creation has completed.
 */
export function buildInvitationRedirectUrl(role: Exclude<AppRole, "super_admin">) {
  const destination = role === "student" ? "/dashboard" : "/admin";
  const url = new URL("/sign-up", SITE_ORIGIN);
  url.searchParams.set("redirect_url", `${SITE_ORIGIN}${destination}`);
  return url.toString();
}
