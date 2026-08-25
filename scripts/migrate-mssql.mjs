import fs from "node:fs/promises";
import path from "node:path";
import sql from "mssql";

const connection = process.env.MSSQL_TCP_URL || process.env.MSSQL_URL;
if (!connection) throw new Error("MSSQL_TCP_URL or MSSQL_URL is required");

const pool = await sql.connect(connection);
try {
  const directory = path.resolve("database/migrations");
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await pool.request().batch(await fs.readFile(path.join(directory, file), "utf8"));
    console.log(`Applied MSSQL migration ${file}`);
  }
} finally {
  await pool.close();
}
