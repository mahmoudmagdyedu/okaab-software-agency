import { spawn } from "node:child_process";

const publicPort = process.env["PORT"] ?? "3000";
const mawIdPort = process.env["MAWID_INTERNAL_PORT"] ?? "3001";
const mawIdOrigin = `http://127.0.0.1:${mawIdPort}`;
const mawIdBasePath = process.env["MAWID_BASE_PATH"] ?? "/maw'id";
const bunPosPort = process.env["BUN_POS_INTERNAL_PORT"] ?? "3002";
const bunPosOrigin = `http://127.0.0.1:${bunPosPort}`;
const bunPosBasePath = process.env["BUN_POS_BASE_PATH"] ?? "/bun-al-deerah";
const children = new Set();
let shuttingDown = false;

function startServer(entry, env) {
  const child = spawn(process.execPath, [entry], {
    env,
    stdio: "inherit",
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

function stopAll(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

async function waitForService(child, name, readyUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`${name} stopped during startup with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(readyUrl, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // The internal listener is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`${name} did not become ready within 15 seconds`);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopAll(signal);
    setTimeout(() => process.exit(0), 1_000).unref();
  });
}

const mawIdEnv = {
  ...process.env,
  HOST: "127.0.0.1",
  PORT: mawIdPort,
  VITE_APP_BASE_PATH: mawIdBasePath,
  SUPABASE_PROJECT_ID:
    process.env["MAWID_SUPABASE_PROJECT_ID"] ?? process.env["SUPABASE_PROJECT_ID"],
  SUPABASE_URL: process.env["MAWID_SUPABASE_URL"] ?? process.env["SUPABASE_URL"],
  SUPABASE_PUBLISHABLE_KEY:
    process.env["MAWID_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"],
};

const mawId = startServer("apps/mawid/.output/server/index.mjs", mawIdEnv);

try {
  await waitForService(mawId, "Mawid", new URL(`${mawIdBasePath}/`, mawIdOrigin));
} catch (error) {
  console.error(error);
  stopAll();
  process.exit(1);
}

const bunPos = startServer("apps/bun-al-deerah-pos/.output/server/index.mjs", {
  ...process.env,
  HOST: "127.0.0.1",
  PORT: bunPosPort,
  VITE_APP_BASE_PATH: bunPosBasePath,
});

try {
  await waitForService(
    bunPos,
    "Bun Al Deerah POS",
    new URL(`${bunPosBasePath}/health/live`, bunPosOrigin),
  );
} catch (error) {
  console.error(error);
  stopAll();
  process.exit(1);
}

const site = startServer(".output/server/index.mjs", {
  ...process.env,
  HOST: process.env["HOST"] ?? "0.0.0.0",
  PORT: publicPort,
  MAWID_INTERNAL_PORT: mawIdPort,
  MAWID_ORIGIN: mawIdOrigin,
  BUN_POS_INTERNAL_PORT: bunPosPort,
  BUN_POS_ORIGIN: bunPosOrigin,
});

site.once("exit", (code, signal) => {
  stopAll(signal ?? "SIGTERM");
  process.exit(code ?? 1);
});

mawId.once("exit", (code, signal) => {
  if (shuttingDown) return;
  console.error(`Mawid stopped unexpectedly (${signal ?? code ?? "unknown"})`);
  stopAll(signal ?? "SIGTERM");
  process.exit(code ?? 1);
});

bunPos.once("exit", (code, signal) => {
  if (shuttingDown) return;
  console.error(`Bun Al Deerah POS stopped unexpectedly (${signal ?? code ?? "unknown"})`);
  stopAll(signal ?? "SIGTERM");
  process.exit(code ?? 1);
});
