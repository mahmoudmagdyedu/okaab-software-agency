import sql from "mssql";
import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

let poolPromise: Promise<sql.ConnectionPool> | undefined;

function connectionString() {
  return process.env["MSSQL_TCP_URL"] ?? process.env["MSSQL_URL"] ?? process.env["DATABASE_URL"];
}

export function isDatabaseConfigured() {
  return Boolean(connectionString());
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function ensureSchema(pool: sql.ConnectionPool) {
  await pool.request().batch(`
    IF OBJECT_ID(N'dbo.Organizations', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Organizations (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Organizations PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        name NVARCHAR(160) NOT NULL,
        slug NVARCHAR(120) NOT NULL CONSTRAINT UQ_Organizations_Slug UNIQUE,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Organizations_CreatedAt DEFAULT SYSUTCDATETIME()
      );
    END;

    IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Users (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        organization_id UNIQUEIDENTIFIER NULL,
        full_name NVARCHAR(160) NOT NULL,
        email NVARCHAR(320) NOT NULL,
        password_hash NVARCHAR(512) NOT NULL,
        role NVARCHAR(32) NOT NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT N'active',
        password_reset_required BIT NOT NULL CONSTRAINT DF_Users_Reset DEFAULT 1,
        created_by UNIQUEIDENTIFIER NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),
        last_login_at DATETIME2 NULL,
        CONSTRAINT FK_Users_Organization FOREIGN KEY (organization_id) REFERENCES dbo.Organizations(id),
        CONSTRAINT CK_Users_Role CHECK (role IN (N'super_admin', N'admin', N'manager', N'accountant', N'inventory', N'cashier', N'kitchen', N'employee')),
        CONSTRAINT CK_Users_Status CHECK (status IN (N'active', N'suspended'))
      );
      CREATE UNIQUE INDEX UX_Users_Email ON dbo.Users(email);
    END;

    IF OBJECT_ID(N'dbo.AccessRequests', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.AccessRequests (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AccessRequests PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        full_name NVARCHAR(160) NOT NULL,
        email NVARCHAR(320) NOT NULL,
        organization_name NVARCHAR(160) NULL,
        requested_role NVARCHAR(32) NOT NULL,
        reason NVARCHAR(1000) NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_AccessRequests_Status DEFAULT N'pending',
        reviewed_by UNIQUEIDENTIFIER NULL,
        reviewed_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_AccessRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AccessRequests_Reviewer FOREIGN KEY (reviewed_by) REFERENCES dbo.Users(id),
        CONSTRAINT CK_AccessRequests_Status CHECK (status IN (N'pending', N'approved', N'rejected'))
      );
      CREATE INDEX IX_AccessRequests_StatusCreated ON dbo.AccessRequests(status, created_at DESC);
    END;

    IF OBJECT_ID(N'dbo.Sessions', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Sessions (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Sessions PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME2 NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Sessions_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Sessions_User FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX UX_Sessions_TokenHash ON dbo.Sessions(token_hash);
      CREATE INDEX IX_Sessions_ExpiresAt ON dbo.Sessions(expires_at);
    END;

    IF OBJECT_ID(N'dbo.AuditLog', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.AuditLog (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AuditLog PRIMARY KEY,
        actor_user_id UNIQUEIDENTIFIER NULL,
        action NVARCHAR(100) NOT NULL,
        target_type NVARCHAR(80) NULL,
        target_id NVARCHAR(100) NULL,
        details NVARCHAR(2000) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_AuditLog_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AuditLog_Actor FOREIGN KEY (actor_user_id) REFERENCES dbo.Users(id)
      );
      CREATE INDEX IX_AuditLog_CreatedAt ON dbo.AuditLog(created_at DESC);
    END;
  `);
}

async function ensureSuperAdmin(pool: sql.ConnectionPool) {
  const email = process.env["SUPER_ADMIN_EMAIL"]?.trim().toLowerCase();
  const password = process.env["SUPER_ADMIN_PASSWORD"];
  if (!email || !password) return;

  const existing = await pool
    .request()
    .input("email", sql.NVarChar(320), email)
    .query("SELECT TOP 1 id FROM dbo.Users WHERE email = @email");
  if (existing.recordset.length > 0) return;

  const passwordHash = await hashPassword(password);
  await pool
    .request()
    .input("name", sql.NVarChar(160), "سوبر أدمن بُنّ الديرة")
    .input("email", sql.NVarChar(320), email)
    .input("passwordHash", sql.NVarChar(512), passwordHash).query(`
      INSERT INTO dbo.Users (full_name, email, password_hash, role, status, password_reset_required)
      VALUES (@name, @email, @passwordHash, N'super_admin', N'active', 1)
    `);
}

export async function getPool() {
  if (!poolPromise) {
    const value = connectionString();
    if (!value) throw new Error("MSSQL is not configured");
    poolPromise = new sql.ConnectionPool(value)
      .connect()
      .then(async (pool) => {
        await ensureSchema(pool);
        await ensureSuperAdmin(pool);
        return pool;
      })
      .catch((error) => {
        poolPromise = undefined;
        throw error;
      });
  }
  return poolPromise;
}

export async function databaseHealth() {
  if (!isDatabaseConfigured()) {
    return { ok: false, configured: false, message: "MSSQL is not configured" };
  }

  try {
    const startedAt = Date.now();
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    return {
      ok: true,
      configured: true,
      latencyMs: Date.now() - startedAt,
      bootstrapConfigured: Boolean(
        process.env["SUPER_ADMIN_EMAIL"] && process.env["SUPER_ADMIN_PASSWORD"],
      ),
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : "Database unavailable",
    };
  }
}

export { sql };
