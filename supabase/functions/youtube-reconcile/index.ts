import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serviceClient, syncYouTubeChannel } from "../_shared/youtube.ts";

Deno.serve(async (request: Request) => {
  const secret = Deno.env.get("HEALTH_MONITOR_SECRET");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || supplied !== secret) return new Response("Unauthorized", { status: 401 });
  try {
    return Response.json(await syncYouTubeChannel(serviceClient()));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "sync_unreachable" },
      { status: 503 },
    );
  }
});
