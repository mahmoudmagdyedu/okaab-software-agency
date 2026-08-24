import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  audit,
  checkLoginRateLimit,
  createSession,
  createTemporaryPassword,
  currentUser,
  destroyCurrentSession,
  hashPassword,
  normalizeEmail,
  requireUser,
  verifyPassword,
} from "./auth.server";
import { getPool, sql } from "./db.server";
import {
  systemRoles,
  type AccessRequestRow,
  type ManagedUser,
  type SystemRole,
} from "./auth-types";

const emailSchema = z.string().trim().email().max(320);
const loginSchema = z.object({ email: emailSchema, password: z.string().min(8).max(200) });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z
    .string()
    .min(12, "كلمة المرور الجديدة يجب ألا تقل عن 12 حرفًا")
    .max(200)
    .regex(/[A-Z]/, "أضف حرفًا إنجليزيًا كبيرًا")
    .regex(/[a-z]/, "أضف حرفًا إنجليزيًا صغيرًا")
    .regex(/[0-9]/, "أضف رقمًا")
    .regex(/[^A-Za-z0-9]/, "أضف رمزًا خاصًا"),
});
const accessRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: emailSchema,
  organizationName: z.string().trim().max(160).optional(),
  requestedRole: z.enum(["admin", "employee"]),
  reason: z.string().trim().max(1000).optional(),
});
const createStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: emailSchema,
  role: z.enum(systemRoles),
  organizationName: z.string().trim().max(160).optional(),
  temporaryPassword: z.string().min(10).max(200).optional(),
});

function unauthorized(message: string): never {
  setResponseStatus(401);
  throw new Error(message);
}

async function organizationIdFor(name: string) {
  const pool = await getPool();
  const normalized = name.trim() || "بُنّ الديرة";
  const slug =
    normalized
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || `org-${Date.now()}`;
  const existing = await pool
    .request()
    .input("slug", sql.NVarChar(120), slug)
    .query(
      "SELECT TOP 1 CONVERT(NVARCHAR(36), id) AS id FROM dbo.Organizations WHERE slug = @slug",
    );
  if (existing.recordset[0]?.id) return String(existing.recordset[0].id);
  const created = await pool
    .request()
    .input("name", sql.NVarChar(160), normalized)
    .input("slug", sql.NVarChar(120), `${slug}-${Date.now().toString(36)}`).query(`
      INSERT INTO dbo.Organizations (name, slug)
      OUTPUT CONVERT(NVARCHAR(36), inserted.id) AS id
      VALUES (@name, @slug)
    `);
  return String(created.recordset[0]?.id);
}

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(async () =>
  currentUser(),
);

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const limiter = checkLoginRateLimit(data.email);
    const email = normalizeEmail(data.email);
    const pool = await getPool();
    const result = await pool.request().input("email", sql.NVarChar(320), email).query(`
        SELECT TOP 1
          CONVERT(NVARCHAR(36), id) AS id,
          full_name AS fullName,
          password_hash AS passwordHash,
          role,
          status,
          password_reset_required AS passwordResetRequired
        FROM dbo.Users
        WHERE email = @email
      `);
    const record = result.recordset[0] as
      | {
          id: string;
          fullName: string;
          passwordHash: string;
          role: SystemRole;
          status: string;
          passwordResetRequired: boolean;
        }
      | undefined;
    if (
      !record ||
      record.status !== "active" ||
      !(await verifyPassword(data.password, record.passwordHash))
    ) {
      limiter.failed();
      unauthorized("بيانات الدخول غير صحيحة");
    }
    limiter.succeeded();
    await createSession(record.id);
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, record.id)
      .query("UPDATE dbo.Users SET last_login_at = SYSUTCDATETIME() WHERE id = @id");
    await audit(record.id, "auth.login", "user", record.id);
    return {
      ok: true,
      role: record.role,
      fullName: record.fullName,
      passwordResetRequired: Boolean(record.passwordResetRequired),
    };
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => changePasswordSchema.parse(data))
  .handler(async ({ data }) => {
    const actor = await requireUser();
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, actor.id)
      .query("SELECT TOP 1 password_hash AS passwordHash FROM dbo.Users WHERE id = @id");
    const passwordHash = String(result.recordset[0]?.passwordHash ?? "");
    if (!(await verifyPassword(data.currentPassword, passwordHash))) {
      setResponseStatus(400);
      throw new Error("كلمة المرور الحالية غير صحيحة");
    }
    if (data.currentPassword === data.newPassword) {
      setResponseStatus(400);
      throw new Error("اختر كلمة مرور جديدة مختلفة");
    }
    const nextHash = await hashPassword(data.newPassword);
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, actor.id)
      .input("passwordHash", sql.NVarChar(512), nextHash).query(`
        UPDATE dbo.Users
        SET password_hash = @passwordHash, password_reset_required = 0,
          updated_at = SYSUTCDATETIME()
        WHERE id = @id
      `);
    await audit(actor.id, "auth.password_changed", "user", actor.id);
    return { ok: true };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const user = await currentUser();
  await destroyCurrentSession();
  if (user) await audit(user.id, "auth.logout", "user", user.id);
  return { ok: true };
});

export const requestAccessFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => accessRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const pool = await getPool();
    const email = normalizeEmail(data.email);
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar(320), email)
      .query("SELECT TOP 1 id FROM dbo.Users WHERE email = @email");
    if (existingUser.recordset.length === 0) {
      await pool
        .request()
        .input("fullName", sql.NVarChar(160), data.fullName)
        .input("email", sql.NVarChar(320), email)
        .input("organizationName", sql.NVarChar(160), data.organizationName ?? null)
        .input("requestedRole", sql.NVarChar(32), data.requestedRole)
        .input("reason", sql.NVarChar(1000), data.reason ?? null).query(`
          IF NOT EXISTS (
            SELECT 1 FROM dbo.AccessRequests WHERE email = @email AND status = N'pending'
          )
          INSERT INTO dbo.AccessRequests (full_name, email, organization_name, requested_role, reason)
          VALUES (@fullName, @email, @organizationName, @requestedRole, @reason)
        `);
    }
    await audit(null, "access.requested", "email", email, data.requestedRole);
    return { ok: true };
  });

export const listUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  const actor = await requireUser(["super_admin", "admin"]);
  const pool = await getPool();
  const request = pool.request();
  let where = "";
  if (actor.role === "admin") {
    request.input("organizationId", sql.UniqueIdentifier, actor.organizationId);
    where = "WHERE u.organization_id = @organizationId AND u.role <> N'super_admin'";
  }
  const result = await request.query(`
    SELECT
      CONVERT(NVARCHAR(36), u.id) AS id,
      CONVERT(NVARCHAR(36), u.organization_id) AS organizationId,
      u.full_name AS fullName,
      u.email,
      u.role,
      u.status,
      u.password_reset_required AS passwordResetRequired,
      CONVERT(NVARCHAR(33), u.created_at, 126) AS createdAt,
      CONVERT(NVARCHAR(33), u.last_login_at, 126) AS lastLoginAt
    FROM dbo.Users u
    ${where}
    ORDER BY u.created_at DESC
  `);
  return { actor, users: result.recordset as ManagedUser[] };
});

export const listAccessRequestsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser(["super_admin"]);
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      CONVERT(NVARCHAR(36), id) AS id,
      full_name AS fullName,
      email,
      organization_name AS organizationName,
      requested_role AS requestedRole,
      reason,
      status,
      CONVERT(NVARCHAR(33), created_at, 126) AS createdAt
    FROM dbo.AccessRequests
    ORDER BY CASE WHEN status = N'pending' THEN 0 ELSE 1 END, created_at DESC
  `);
  return result.recordset as AccessRequestRow[];
});

export const createStaffFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createStaffSchema.parse(data))
  .handler(async ({ data }) => {
    const actor = await requireUser(["super_admin", "admin"]);
    if (data.role === "super_admin" || (actor.role === "admin" && data.role === "admin")) {
      setResponseStatus(403);
      throw new Error("لا يمكنك إنشاء هذا الدور");
    }
    const organizationId =
      actor.role === "admin"
        ? actor.organizationId
        : await organizationIdFor(data.organizationName ?? "بُنّ الديرة");
    if (!organizationId) throw new Error("تعذر تحديد المنشأة");
    const temporaryPassword = data.temporaryPassword ?? createTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const pool = await getPool();
    const result = await pool
      .request()
      .input("organizationId", sql.UniqueIdentifier, organizationId)
      .input("fullName", sql.NVarChar(160), data.fullName)
      .input("email", sql.NVarChar(320), normalizeEmail(data.email))
      .input("passwordHash", sql.NVarChar(512), passwordHash)
      .input("role", sql.NVarChar(32), data.role)
      .input("createdBy", sql.UniqueIdentifier, actor.id).query(`
        INSERT INTO dbo.Users (
          organization_id, full_name, email, password_hash, role, created_by
        )
        OUTPUT CONVERT(NVARCHAR(36), inserted.id) AS id
        VALUES (
          @organizationId, @fullName, @email, @passwordHash, @role, @createdBy
        )
      `);
    const id = String(result.recordset[0]?.id);
    await audit(actor.id, "user.created", "user", id, data.role);
    return { ok: true, id, temporaryPassword };
  });

export const reviewAccessFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({ requestId: z.string().uuid(), decision: z.enum(["approved", "rejected"]) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const actor = await requireUser(["super_admin"]);
    const pool = await getPool();
    const found = await pool.request().input("id", sql.UniqueIdentifier, data.requestId).query(`
        SELECT TOP 1 full_name AS fullName, email, organization_name AS organizationName,
          requested_role AS requestedRole, status
        FROM dbo.AccessRequests WHERE id = @id
      `);
    const request = found.recordset[0] as
      | {
          fullName: string;
          email: string;
          organizationName: string | null;
          requestedRole: "admin" | "employee";
          status: string;
        }
      | undefined;
    if (!request || request.status !== "pending") throw new Error("طلب الوصول غير متاح");

    let temporaryPassword: string | undefined;
    if (data.decision === "approved") {
      const organizationId = await organizationIdFor(request.organizationName ?? "بُنّ الديرة");
      temporaryPassword = createTemporaryPassword();
      const passwordHash = await hashPassword(temporaryPassword);
      await pool
        .request()
        .input("organizationId", sql.UniqueIdentifier, organizationId)
        .input("fullName", sql.NVarChar(160), request.fullName)
        .input("email", sql.NVarChar(320), normalizeEmail(request.email))
        .input("passwordHash", sql.NVarChar(512), passwordHash)
        .input("role", sql.NVarChar(32), request.requestedRole)
        .input("createdBy", sql.UniqueIdentifier, actor.id).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = @email)
          INSERT INTO dbo.Users (
            organization_id, full_name, email, password_hash, role, created_by
          ) VALUES (
            @organizationId, @fullName, @email, @passwordHash, @role, @createdBy
          )
        `);
    }
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, data.requestId)
      .input("decision", sql.NVarChar(20), data.decision)
      .input("reviewedBy", sql.UniqueIdentifier, actor.id).query(`
        UPDATE dbo.AccessRequests
        SET status = @decision, reviewed_by = @reviewedBy, reviewed_at = SYSUTCDATETIME()
        WHERE id = @id
      `);
    await audit(actor.id, `access.${data.decision}`, "access_request", data.requestId);
    return { ok: true, temporaryPassword };
  });

export const changeUserStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["active", "suspended"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const actor = await requireUser(["super_admin", "admin"]);
    if (actor.id === data.userId) throw new Error("لا يمكنك إيقاف حسابك الحالي");
    const pool = await getPool();
    const target = await pool.request().input("id", sql.UniqueIdentifier, data.userId).query(`
        SELECT TOP 1 role, CONVERT(NVARCHAR(36), organization_id) AS organizationId
        FROM dbo.Users WHERE id = @id
      `);
    const user = target.recordset[0] as
      { role: SystemRole; organizationId: string | null } | undefined;
    if (!user) throw new Error("الحساب غير موجود");
    if (
      user.role === "super_admin" ||
      (actor.role === "admin" &&
        (user.role === "admin" || user.organizationId !== actor.organizationId))
    ) {
      setResponseStatus(403);
      throw new Error("لا يمكنك تعديل هذا الحساب");
    }
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, data.userId)
      .input("status", sql.NVarChar(20), data.status).query(`
        UPDATE dbo.Users SET status = @status, updated_at = SYSUTCDATETIME() WHERE id = @id;
        IF @status = N'suspended' DELETE FROM dbo.Sessions WHERE user_id = @id;
      `);
    await audit(actor.id, `user.${data.status}`, "user", data.userId);
    return { ok: true };
  });
