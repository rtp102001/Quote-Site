export interface Limit { key: string; limit: number; windowSeconds: number }

/** Fixed-window counter in D1. Returns false if any limit is exceeded (and does not count it). */
export async function checkRateLimits(db: D1Database, limits: Limit[], nowMs = Date.now()): Promise<boolean> {
  const rows = limits.map((l) => ({ ...l, window: Math.floor(nowMs / 1000 / l.windowSeconds) * l.windowSeconds }));
  for (const r of rows) {
    const got = await db.prepare("SELECT count FROM rate_limit_buckets WHERE bucket_key = ? AND window_start = ?")
      .bind(r.key, r.window).first<{ count: number }>();
    if (got && got.count >= r.limit) return false;
  }
  await db.batch(rows.map((r) =>
    db.prepare(`INSERT INTO rate_limit_buckets (bucket_key, window_start, count) VALUES (?, ?, 1)
      ON CONFLICT(bucket_key, window_start) DO UPDATE SET count = count + 1`).bind(r.key, r.window)));
  return true;
}

export const QUOTE_LIMITS = (ip: string, email: string): Limit[] => [
  { key: `quote:ip:${ip}`, limit: 5, windowSeconds: 3600 },
  { key: `quote:email:${email}`, limit: 3, windowSeconds: 86400 },
];
export const SIGNUP_LIMITS = (ip: string): Limit[] => [{ key: `signup:ip:${ip}`, limit: 5, windowSeconds: 3600 }];
