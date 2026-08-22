type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();
const MAX_TRACKED_IDENTITIES = 5_000;

function removeExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function consumeQuoteRateLimit(
  identity: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitDecision {
  if (buckets.size >= MAX_TRACKED_IDENTITIES) removeExpiredBuckets(now);

  const current = buckets.get(identity);
  if (!current || current.resetAt <= now) {
    buckets.set(identity, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
