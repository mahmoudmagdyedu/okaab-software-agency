import { spawnSync } from "node:child_process";

const APPROVED_CLERK_KEY = "pk_live_Y2xlcmsub2thYWIub3JnJA";

if (
  process.env["NODE_ENV"] === "production" &&
  process.env["VITE_CLERK_PUBLISHABLE_KEY"] !== APPROVED_CLERK_KEY
) {
  throw new Error(
    "Production VITE_CLERK_PUBLISHABLE_KEY does not match the approved okaab.org Clerk instance",
  );
}

const npmCli = process.env["npm_execpath"];

if (!npmCli) {
  throw new Error("npm_execpath is missing; run this script through npm run build");
}

function run(args, env = process.env) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["run", "build:site"]);

const mawIdEnv = {
  ...process.env,
  VITE_APP_BASE_PATH: process.env["MAWID_BASE_PATH"] ?? "/maw'id",
  VITE_SUPABASE_PROJECT_ID:
    process.env["MAWID_SUPABASE_PROJECT_ID"] ?? process.env["VITE_SUPABASE_PROJECT_ID"],
  VITE_SUPABASE_URL: process.env["MAWID_SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"],
  VITE_SUPABASE_PUBLISHABLE_KEY:
    process.env["MAWID_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
};

run(["run", "build:mawid"], mawIdEnv);

const bunPosEnv = {
  ...process.env,
  VITE_APP_BASE_PATH: process.env["BUN_POS_BASE_PATH"] ?? "/bun-al-deerah",
};

run(["run", "build:bun-pos"], bunPosEnv);
