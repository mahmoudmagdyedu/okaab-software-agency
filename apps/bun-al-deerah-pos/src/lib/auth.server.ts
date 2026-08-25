import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
  deleteCookie,
  getCookie,
  getRequestIP,
  setCookie,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { getPool, hashPassword, hashSessionToken, sql } from "./db.server";
import type { SessionUser, SystemRole } from "./auth-types";
import { APP_BASE_PATH } from "./base-path";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "bun_deerah_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const failedLogins = new Map<string, { count: number; resetsAt: number }>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: APP_BASE_PATH || "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, sessionCookieOptions());
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.UniqueIdentifier, userId)
    .input("tokenHash", sql.Char(64), hashSessionToken(token))
    .input("expiresAt", sql.DateTime2, new Date(Date.now() + SESSION_TTL_SECONDS * 1000)).query(`
      DELETE FROM dbo.Sessions WHERE expires_at <= SYSUTCDATETIME();
      INSERT INTO dbo.Sessions (user_id, token_hash, expires_at)
      VALUES (@userId, @tokenHash, @expiresAt);
    `);
  setCookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroyCurrentSession() {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    const pool = await getPool();
    await pool
      .request()
      .input("tokenHash", sql.Char(64), hashSessionToken(token))
      .query("DELETE FROM dbo.Sessions WHERE token_hash = @tokenHash");
  }
  clearSessionCookie();
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const pool = await getPool();
  const result = await pool.request().input("tokenHash", sql.Char(64), hashSessionToken(token))
    .query(`
      SELECT TOP 1
        CONVERT(NVARCHAR(36), u.id) AS id,
        CONVERT(NVARCHAR(36), u.organization_id) AS organizationId,
        u.full_name AS fullName,
        u.email,
        u.role,
        u.status,
        u.password_reset_required AS passwordResetRequired
      FROM dbo.Sessions s
      INNER JOIN dbo.Users u ON u.id = s.user_id
      WHERE s.token_hash = @tokenHash
        AND s.expires_at > SYSUTCDATETIME()
        AND u.status = N'active'
    `);
  const user = result.recordset[0] as SessionUser | undefined;
  if (!user) clearSessionCookie();
  return user ? { ...user, passwordResetRequired: Boolean(user.passwordResetRequired) } : null;
}

export async function requireUser(roles?: SystemRole[]) {
  const user = await currentUser();
  if (!user || (roles && !roles.includes(user.role))) {
    setResponseStatus(user ? 403 : 401);
    throw new Error(user ? "غير مصرح بهذه العملية" : "يرجى تسجيل الدخول");
  }
  return user;
}

export function checkLoginRateLimit(email: string) {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const key = createHash("sha256")
    .update(`${ip}:${normalizeEmail(email)}`)
    .digest("hex");
  const now = Date.now();
  const current = failedLogins.get(key);
  if (current && current.resetsAt > now && current.count >= 5) {
    setResponseStatus(429);
    throw new Error("محاولات كثيرة. حاول مرة أخرى بعد 15 دقيقة.");
  }
  return {
    failed() {
      const value = failedLogins.get(key);
      if (!value || value.resetsAt <= now) {
        failedLogins.set(key, { count: 1, resetsAt: now + 15 * 60 * 1000 });
      } else {
        value.count += 1;
      }
    },
    succeeded() {
      failedLogins.delete(key);
    },
  };
}

export async function audit(
  actorUserId: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: string,
) {
  const pool = await getPool();
  await pool
    .request()
    .input("actorUserId", sql.UniqueIdentifier, actorUserId)
    .input("action", sql.NVarChar(100), action)
    .input("targetType", sql.NVarChar(80), targetType ?? null)
    .input("targetId", sql.NVarChar(100), targetId ?? null)
    .input("details", sql.NVarChar(2000), details ?? null).query(`
      INSERT INTO dbo.AuditLog (actor_user_id, action, target_type, target_id, details)
      VALUES (@actorUserId, @action, @targetType, @targetId, @details)
    `);
}

export function createTemporaryPassword() {
  return `Bd!${randomBytes(9).toString("base64url")}`;
}

export { hashPassword, normalizeEmail };
