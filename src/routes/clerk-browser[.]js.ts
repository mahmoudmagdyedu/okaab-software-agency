import { createFileRoute } from "@tanstack/react-router";

const CLERK_JS_URL =
  "https://clerk.okaab.org/npm/@clerk/clerk-js@6.30.1/dist/clerk.browser.js";

let clerkJsPromise: Promise<string> | undefined;

async function loadClerkJs() {
  clerkJsPromise ??= fetch(CLERK_JS_URL, {
    headers: { "user-agent": "Okaab-Clerk-Loader/1.0" },
    signal: AbortSignal.timeout(20_000),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Clerk JS upstream returned ${response.status}`);
    }
    return response.text();
  });

  try {
    return await clerkJsPromise;
  } catch (error) {
    clerkJsPromise = undefined;
    throw error;
  }
}

export const Route = createFileRoute("/clerk-browser.js")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response(await loadClerkJs(), {
            headers: {
              "content-type": "application/javascript; charset=utf-8",
              "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
              "x-content-type-options": "nosniff",
            },
          });
        } catch (error) {
          console.error("Unable to load Clerk browser runtime", error);
          return new Response("Clerk runtime is temporarily unavailable", {
            status: 502,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
      },
    },
  },
});
