import { describe, expect, it } from 'vitest'
import {
  clientIp,
  detectBot,
  HONEYPOT_FIELD,
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
  RateLimiter,
} from '@/lib/spam'

const NOW = 1_800_000_000_000

describe('detectBot', () => {
  const human = { startedAt: NOW - 10_000 }

  it('passes a person who took a normal time', () => {
    expect(detectBot(human, NOW)).toBeNull()
  })

  it('catches a filled honeypot', () => {
    expect(
      detectBot({ ...human, [HONEYPOT_FIELD]: 'http://spam.example' }, NOW),
    ).toBe('honeypot')
  })

  it('ignores an empty or whitespace honeypot', () => {
    expect(detectBot({ ...human, [HONEYPOT_FIELD]: '' }, NOW)).toBeNull()
    expect(detectBot({ ...human, [HONEYPOT_FIELD]: '  ' }, NOW)).toBeNull()
  })

  it.each([undefined, null, 'soon', NaN, Infinity])(
    'rejects a missing or bad timestamp (%s)',
    (startedAt) => {
      expect(detectBot({ startedAt }, NOW)).toBe('no-timestamp')
    },
  )

  it('rejects submissions faster than a person could type', () => {
    expect(detectBot({ startedAt: NOW - (MIN_FILL_MS - 1) }, NOW)).toBe(
      'too-fast',
    )
    expect(detectBot({ startedAt: NOW - MIN_FILL_MS }, NOW)).toBeNull()
  })

  it('rejects timestamps from the future', () => {
    expect(detectBot({ startedAt: NOW + 60_000 }, NOW)).toBe('too-fast')
  })

  it('rejects very old forms', () => {
    expect(detectBot({ startedAt: NOW - MAX_FORM_AGE_MS - 1 }, NOW)).toBe(
      'stale',
    )
    expect(detectBot({ startedAt: NOW - MAX_FORM_AGE_MS }, NOW)).toBeNull()
  })
})

describe('RateLimiter', () => {
  it('allows up to the limit then blocks', () => {
    const limiter = new RateLimiter(3, 60_000)
    for (let i = 0; i < 3; i++)
      expect(limiter.check('a', NOW + i).allowed).toBe(true)
    const blocked = limiter.check('a', NOW + 10)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('reports how long until the oldest hit expires', () => {
    const limiter = new RateLimiter(1, 60_000)
    limiter.check('a', NOW)
    expect(limiter.check('a', NOW + 20_000).retryAfterSec).toBe(40)
  })

  it('lets requests through again once the window slides past', () => {
    const limiter = new RateLimiter(1, 60_000)
    limiter.check('a', NOW)
    expect(limiter.check('a', NOW + 30_000).allowed).toBe(false)
    expect(limiter.check('a', NOW + 60_001).allowed).toBe(true)
  })

  it('does not count blocked attempts against the window', () => {
    const limiter = new RateLimiter(1, 60_000)
    limiter.check('a', NOW)
    for (let i = 1; i < 50; i++) limiter.check('a', NOW + i * 1000)
    expect(limiter.check('a', NOW + 60_001).allowed).toBe(true)
  })

  it('tracks keys independently', () => {
    const limiter = new RateLimiter(1, 60_000)
    expect(limiter.check('a', NOW).allowed).toBe(true)
    expect(limiter.check('b', NOW).allowed).toBe(true)
    expect(limiter.check('a', NOW).allowed).toBe(false)
  })

  it('prunes stale keys instead of growing forever, keeping live ones', () => {
    const limiter = new RateLimiter(1, 1_000, 10)
    for (let i = 0; i < 10; i++) limiter.check(`old-${i}`, NOW)
    limiter.check('live', NOW + 5_000) // 11th key triggers the prune
    expect(limiter.check('live', NOW + 5_001).allowed).toBe(false) // still tracked
    expect(limiter.check('old-0', NOW + 5_002).allowed).toBe(true) // forgotten
  })

  it('can be reset', () => {
    const limiter = new RateLimiter(1, 60_000)
    limiter.check('a', NOW)
    limiter.reset()
    expect(limiter.check('a', NOW).allowed).toBe(true)
  })
})

describe('clientIp', () => {
  it('uses the first x-forwarded-for entry', () => {
    expect(
      clientIp(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })),
    ).toBe('203.0.113.9')
  })
  it('falls back to x-real-ip, then "unknown"', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe(
      '198.51.100.4',
    )
    expect(clientIp(new Headers())).toBe('unknown')
  })
})
