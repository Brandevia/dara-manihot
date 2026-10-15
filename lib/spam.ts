/**
 * Spam and bot protection that needs no third-party service, no cookies and
 * no CAPTCHA for real visitors:
 *
 *  1. Honeypot: a field humans never see. Bots that fill every input trip it.
 *  2. Timing trap: the form stamps the time it was shown. A submission that
 *     arrives sooner than a person could type, or with no stamp at all (a
 *     script POSTing straight to the API), is rejected.
 *  3. Rate limits: per client IP, plus a global ceiling that caps mailbox
 *     flooding from many addresses.
 *
 * None of this stops a determined human; it stops the automated bulk traffic
 * that contact forms attract. See docs/EMAIL-SETUP.md for the upgrade path.
 */

export const HONEYPOT_FIELD = 'companyWebsite'
export const MIN_FILL_MS = 3_000
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000

export type BotReason = 'honeypot' | 'no-timestamp' | 'too-fast' | 'stale'

export function detectBot(
  body: Record<string, unknown>,
  now: number,
): BotReason | null {
  const honeypot = body[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return 'honeypot'

  const startedAt = body.startedAt
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt))
    return 'no-timestamp'

  const elapsed = now - startedAt
  if (elapsed < MIN_FILL_MS) return 'too-fast' // also catches future stamps
  if (elapsed > MAX_FORM_AGE_MS) return 'stale'
  return null
}

export interface LimitResult {
  allowed: boolean
  /** Seconds until the oldest hit leaves the window. 0 when allowed. */
  retryAfterSec: number
}

/**
 * Sliding window limiter held in memory. On serverless hosting each instance
 * has its own counter, so this is best effort per instance, not a hard global
 * guarantee. That is acceptable for a contact form; the global key below is a
 * second brake on the same principle.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5_000,
  ) {}

  check(key: string, now: number): LimitResult {
    const cutoff = now - this.windowMs
    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff)

    if (recent.length >= this.limit) {
      this.hits.set(key, recent)
      return {
        allowed: false,
        retryAfterSec: Math.max(
          1,
          Math.ceil((recent[0] + this.windowMs - now) / 1000),
        ),
      }
    }

    recent.push(now)
    this.hits.set(key, recent)
    if (this.hits.size > this.maxKeys) this.prune(cutoff)
    return { allowed: true, retryAfterSec: 0 }
  }

  reset(): void {
    this.hits.clear()
  }

  private prune(cutoff: number): void {
    for (const [key, times] of this.hits) {
      if (times.every((t) => t <= cutoff)) this.hits.delete(key)
    }
  }
}

const HOUR = 60 * 60 * 1000
export const perIpLimiter = new RateLimiter(5, HOUR)
export const globalLimiter = new RateLimiter(100, HOUR)

/** Best available client address from proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}
