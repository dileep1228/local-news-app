const POST_LIFETIME_MS = 2 * 60 * 60 * 1000;

/** Milliseconds until a post expires, floored at zero. */
export function msRemaining(expiresAt: string, now = Date.now()): number {
  return Math.max(0, new Date(expiresAt).getTime() - now);
}

/** "1h 48m" / "22m" - short enough to sit in a metadata row. */
export function formatRemaining(expiresAt: string, now = Date.now()): string {
  const totalMinutes = Math.floor(msRemaining(expiresAt, now) / 60_000);

  if (totalMinutes <= 0) return 'expired';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** 1 when freshly posted, 0 at expiry - drives the decay bar. */
export function lifeFraction(expiresAt: string, now = Date.now()): number {
  return Math.min(1, msRemaining(expiresAt, now) / POST_LIFETIME_MS);
}
