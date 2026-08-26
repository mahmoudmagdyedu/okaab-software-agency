import { createFileRoute } from "@tanstack/react-router";

const CLERK_UI_URL =
  "https://clerk.okaab.org/npm/@clerk/ui@1.30.8/dist/ui.browser.js";

let clerkUiPromise: Promise<string> | undefined;

async function loadClerkUi() {
  clerkUiPromise ??= fetch(CLERK_UI_URL, {
    headers: { "user-agent": "Okaab-Clerk-Loader/1.0" },
    signal: AbortSignal.timeout(20_000),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Clerk UI upstream returned ${response.status}`);
    }
    return response.text();
  });

  try {
    return await clerkUiPromise;
  } catch (error) {
    clerkUiPromise = undefined;
    throw error;
  }
}

export const Route = createFileRoute("/clerk-ui.js")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response(await loadClerkUi(), {
            headers: {
              "content-type": "application/javascript; charset=utf-8",
              "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
              "x-content-type-options": "nosniff",
            },
          });
        } catch (error) {
          console.error("Unable to load Clerk UI runtime", error);
          return new Response("Clerk UI is temporarily unavailable", {
            status: 502,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
      },
    },
  },
});
