import { createHmac } from "node:crypto";

import { getDb, sql } from "@/lib/db.server";

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitRule = {
  identity: string;
  limit: number;
  windowMs: number;
};

type LockedBucket = RateLimitRule & {
  identityHash: Buffer;
  count: number;
  expiresAt: Date | null;
};

const MAX_DEADLOCK_RETRIES = 2;

function hashIdentity(identity: string) {
  const secret = process.env["QUOTE_RATE_LIMIT_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error("QUOTE_RATE_LIMIT_SECRET must contain at least 32 characters");
  }
  return createHmac("sha256", secret).update(identity).digest();
}

function isDeadlock(error: unknown) {
  const candidate = error as {
    number?: number;
    originalError?: { info?: { number?: number } };
  };
  return candidate?.number === 1205 || candidate?.originalError?.info?.number === 1205;
}

function deadlockBackoff(attempt: number) {
  return new Promise((resolve) => setTimeout(resolve, 30 * (attempt + 1) + Math.random() * 30));
}

async function consumeOnce(
  preparedRules: Array<RateLimitRule & { identityHash: Buffer }>,
  now = Date.now(),
): Promise<RateLimitDecision> {
  const pool = await getDb();
  const transaction = new sql.Transaction(pool);
  const lockedBuckets: LockedBucket[] = preparedRules.map((rule) => ({
    ...rule,
    count: 0,
    expiresAt: null,
  }));

  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    for (const bucket of lockedBuckets) {
      const result = await new sql.Request(transaction).input(
        "identity_hash",
        sql.VarBinary(32),
        bucket.identityHash,
      ).query<{ hit_count: number; expires_at: Date }>(`
          select hit_count, expires_at
          from okaab.quote_rate_limits with (updlock, holdlock)
          where identity_hash = @identity_hash
        `);

      const current = result.recordset[0];
      if (current) {
        bucket.count = current.hit_count;
        bucket.expiresAt = current.expires_at;
      }
    }

    const blocked = lockedBuckets.filter(
      (bucket) =>
        bucket.expiresAt && bucket.expiresAt.getTime() > now && bucket.count >= bucket.limit,
    );

    if (blocked.length > 0) {
      await transaction.commit();
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          ...blocked.map((bucket) => Math.ceil((bucket.expiresAt!.getTime() - now) / 1_000)),
        ),
      };
    }

    for (const bucket of lockedBuckets) {
      const isActive = Boolean(bucket.expiresAt && bucket.expiresAt.getTime() > now);
      const nextCount = isActive ? bucket.count + 1 : 1;
      const nextExpiry = isActive ? bucket.expiresAt! : new Date(now + bucket.windowMs);

      if (bucket.expiresAt) {
        await new sql.Request(transaction)
          .input("identity_hash", sql.VarBinary(32), bucket.identityHash)
          .input("hit_count", sql.Int, nextCount)
          .input("expires_at", sql.DateTimeOffset, nextExpiry).query(`
            update okaab.quote_rate_limits
            set hit_count = @hit_count, expires_at = @expires_at, updated_at = sysutcdatetime()
            where identity_hash = @identity_hash
          `);
      } else {
        await new sql.Request(transaction)
          .input("identity_hash", sql.VarBinary(32), bucket.identityHash)
          .input("expires_at", sql.DateTimeOffset, nextExpiry).query(`
            insert into okaab.quote_rate_limits (identity_hash, hit_count, expires_at)
            values (@identity_hash, 1, @expires_at)
          `);
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback().catch(() => undefined);
    throw error;
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function consumeQuoteRateLimits(
  rules: RateLimitRule[],
  now = Date.now(),
): Promise<RateLimitDecision> {
  if (rules.length === 0) return { allowed: true, retryAfterSeconds: 0 };
  if (rules.some((rule) => !rule.identity || rule.limit < 1 || rule.windowMs < 1)) {
    throw new Error("Invalid quote rate-limit rule");
  }

  const preparedRules = rules
    .map((rule) => ({ ...rule, identityHash: hashIdentity(rule.identity) }))
    .sort((left, right) => Buffer.compare(left.identityHash, right.identityHash));

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await consumeOnce(preparedRules, now);
    } catch (error) {
      if (!isDeadlock(error) || attempt >= MAX_DEADLOCK_RETRIES) throw error;
      await deadlockBackoff(attempt);
    }
  }
}

export async function cleanupExpiredQuoteRateLimits() {
  const pool = await getDb();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1_000);
  let deletedTotal = 0;

  for (let batch = 0; batch < 10; batch += 1) {
    const result = await pool.request().input("cutoff", sql.DateTimeOffset, cutoff).query<{
      deleted_count: number;
    }>(`
        ;with expired as (
          select top (1000) identity_hash
          from okaab.quote_rate_limits with (readpast, rowlock)
          where expires_at < @cutoff
          order by identity_hash
        )
        delete limits
        from okaab.quote_rate_limits as limits
        inner join expired on expired.identity_hash = limits.identity_hash;
        select @@rowcount as deleted_count;
      `);
    const deleted = result.recordset[0]?.deleted_count ?? 0;
    deletedTotal += deleted;
    if (deleted < 1000) break;
  }

  return deletedTotal;
}
