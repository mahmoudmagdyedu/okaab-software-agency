import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.1";
import { runHealth } from "../_shared/health.ts";
import { serviceClient, syncYouTubeChannel } from "../_shared/youtube.ts";

const cors = {
  "access-control-allow-origin": "https://okaab.org",
  "access-control-allow-headers": "authorization, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: cors });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon || !authorization) return json({ error: "غير مصرح" }, 401);
  const authClient = createClient(url, anon, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const user = (await authClient.auth.getUser()).data.user;
  if (!user) return json({ error: "غير مصرح" }, 401);
  const admin = serviceClient();
  const profile = (await admin.from("profiles").select("*").eq("id", user.id).maybeSingle()).data;
  if (!profile?.is_active || !["super_admin", "admin"].includes(profile.role))
    return json({ error: "لا تملك صلاحية هذه العملية" }, 403);
  const input = await request.json().catch(() => ({}));
  try {
    if (input.action === "youtube_sync") return json(await syncYouTubeChannel(admin));
    if (input.action === "health_run") return json(await runHealth(admin));
    if (input.action !== "invite") return json({ error: "عملية غير معروفة" }, 400);

    const email = String(input.email ?? "")
      .trim()
      .toLowerCase();
    const role = String(input.role ?? "");
    const teamId = input.teamId ? String(input.teamId) : null;
    if (!/^\S+@\S+\.\S+$/.test(email) || !["admin", "team_leader", "employee"].includes(role))
      return json({ error: "بيانات الدعوة غير صحيحة" }, 400);
    if (email === "okaab@okaab.org") return json({ error: "بريد السوبر أدمن محجوز" }, 400);
    if (role === "admin" && profile.role !== "super_admin")
      return json({ error: "السوبر أدمن فقط يمكنه تعيين أدمن" }, 403);
    if (role !== "admin" && !teamId) return json({ error: "اختر فريقًا لهذا الدور" }, 400);

    const pending = await admin
      .from("pending_invites")
      .insert({
        email,
        role,
        team_id: role === "admin" ? null : teamId,
        invited_by: profile.id,
      })
      .select("id")
      .single();
    if (pending.error)
      return json(
        {
          error:
            pending.error.code === "23505" ? "توجد دعوة فعالة لهذا البريد" : "تعذّر حفظ الدعوة",
        },
        409,
      );
    const invited = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: "https://okaab.org/admin",
      data: { invited_by: profile.id },
    });
    if (invited.error) {
      await admin.from("pending_invites").delete().eq("id", pending.data.id);
      return json({ error: invited.error.message }, 400);
    }
    await admin.from("audit_log").insert({
      actor_id: profile.id,
      action: "member.invited",
      entity_type: "profile",
      entity_id: invited.data.user.id,
      summary_ar: `تمت دعوة ${email} بدور ${role}`,
      metadata: { role, team_id: teamId },
    });
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "تعذّر إتمام العملية" }, 500);
  }
});
