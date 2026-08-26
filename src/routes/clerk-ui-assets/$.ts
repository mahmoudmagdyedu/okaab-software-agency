import { createFileRoute } from "@tanstack/react-router";

const CLERK_UI_BASE_URL =
  "https://clerk.okaab.org/npm/@clerk/ui@1.30.8/dist/";

const assetPromises = new Map<string, Promise<{ body: ArrayBuffer; contentType: string }>>();

function isAllowedAssetName(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:js|css|woff2?|svg|png)$/.test(value);
}

async function loadClerkUiAsset(assetName: string) {
  let assetPromise = assetPromises.get(assetName);
  if (!assetPromise) {
    assetPromise = fetch(`${CLERK_UI_BASE_URL}${assetName}`, {
      headers: { "user-agent": "Okaab-Clerk-Loader/1.0" },
      signal: AbortSignal.timeout(20_000),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Clerk UI asset ${assetName} returned ${response.status}`);
      }
      return {
        body: await response.arrayBuffer(),
        contentType: response.headers.get("content-type") || "application/octet-stream",
      };
    });
    assetPromises.set(assetName, assetPromise);
  }

  try {
    return await assetPromise;
  } catch (error) {
    assetPromises.delete(assetName);
    throw error;
  }
}

export const Route = createFileRoute("/clerk-ui-assets/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const assetName = (params._splat || "").replace(/^\/+/, "");
        if (!isAllowedAssetName(assetName)) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const asset = await loadClerkUiAsset(assetName);
          return new Response(asset.body, {
            headers: {
              "content-type": asset.contentType,
              "cache-control": "public, max-age=31536000, immutable",
              "x-content-type-options": "nosniff",
            },
          });
        } catch (error) {
          console.error("Unable to load Clerk UI asset", { assetName, error });
          return new Response("Clerk UI is temporarily unavailable", {
            status: 502,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
      },
    },
  },
});
