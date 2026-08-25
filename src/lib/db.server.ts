import sql from "mssql";

let poolPromise: Promise<sql.ConnectionPool> | undefined;

function connectionString() {
  const value = process.env["MSSQL_TCP_URL"] || process.env["MSSQL_URL"];
  if (!value) throw new Error("MSSQL connection is not configured");
  return value;
}

export function getDb() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(connectionString()).connect().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

export async function dbHealth() {
  const started = Date.now();
  const pool = await getDb();
  await pool.request().query("select 1 as ok");
  return { ok: true, latencyMs: Date.now() - started };
}

export { sql };
