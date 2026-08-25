// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load all env vars (including non-VITE_ server secrets) into process.env for server routes.
const serverEnv = loadEnv(process.env['NODE_ENV'] || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

// Keep this as a variable so the wrapper's deliberately narrow public type still
// forwards supported Nitro options to the installed Nitro runtime.
const nitroPreset = process.env["NITRO_PRESET"];
const nativeRootPlugin = {
  name: "okaab-native-root-path",
  enforce: "pre" as const,
  configResolved(config: { root: string }) {
    config.root = path.resolve(config.root);
  },
};
const nitroConfig = {
  ...(nitroPreset ? { preset: nitroPreset } : {}),
  compressPublicAssets: true,
  routeRules: {
    "/fonts/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/logo-96.webp": {
      headers: { "cache-control": "public, max-age=2592000" },
    },
    "/logo-192.webp": {
      headers: { "cache-control": "public, max-age=2592000" },
    },
  },
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: nitroConfig,
  vite: {
    // Keep the Vite root in the platform-native path format. The Lovable MCP
    // plugin validates generated route paths against this value on Windows.
    root: __dirname,
    plugins: [nativeRootPlugin, mcpPlugin()],
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        entities: path.resolve(__dirname, "node_modules/entities"),
      },
    },
  },
});
