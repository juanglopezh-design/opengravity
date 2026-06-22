/**
 * Rate limiter en memoria por UID.
 * En producción (single-instance en Render) funciona perfectamente.
 * Si escalaras a múltiples instancias, sustituye por Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;      // máx 10 generaciones por minuto por usuario

// Limpieza periódica para evitar memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

export function checkRateLimit(uid: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(uid);

  if (!entry || entry.resetAt < now) {
    store.set(uid, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true };
}

const ipStore = new Map<string, RateLimitEntry>();
const IP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const IP_MAX_REQUESTS = 3;               // max 3 free demo generations per day

// Periodically clean up ipStore to prevent leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of ipStore.entries()) {
    if (entry.resetAt < now) ipStore.delete(key);
  }
}, 30 * 60 * 1000);

export function checkIpRateLimit(ip: string): RateLimitResult & { remaining: number } {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || entry.resetAt < now) {
    ipStore.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return { allowed: true, remaining: IP_MAX_REQUESTS - 1 };
  }

  if (entry.count >= IP_MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: IP_MAX_REQUESTS - entry.count };
}
