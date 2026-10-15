import { randomBytes } from 'node:crypto'
import { validateEnquiry } from '@/lib/enquiry'
import { MailNotConfiguredError, sendEnquiryEmails } from '@/lib/mailer'
import {
  clientIp,
  detectBot,
  globalLimiter,
  perIpLimiter,
  type RateLimiter,
} from '@/lib/spam'

/**
 * POST /api/enquiry, with its collaborators injectable so every branch can be
 * tested without a mail server or a clock. app/api/enquiry/route.ts is a thin
 * wrapper around this.
 *
 * Order matters: cheap checks first (size, type, origin, rate limit, bot
 * traps), validation next, and only then any email is sent.
 *
 * "Website records the enquiry" (scope 4.6, step 2): the site has no database,
 * and serverless disks do not persist, so the record is (a) a PII free
 * structured log line per enquiry, keyed by reference number, and (b) the full
 * notification email, which lands in the Dara-Manihot mailbox. The reference
 * number appears in both emails and the log so any enquiry can be traced.
 */

export const MAX_BODY_BYTES = 20_000

export interface HandlerDeps {
  now: () => number
  send: typeof sendEnquiryEmails
  perIp: RateLimiter
  global: RateLimiter
  log: (entry: Record<string, unknown>) => void
}

const defaultDeps: HandlerDeps = {
  now: () => Date.now(),
  send: sendEnquiryEmails,
  perIp: perIpLimiter,
  global: globalLimiter,
  log: (entry) => console.info(JSON.stringify(entry)),
}

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  })

/** DM-YYMMDD-XXXX: dated for humans, random suffix so it cannot be guessed. */
export function makeReference(now: number): string {
  const d = new Date(now)
  const stamp = [d.getUTCFullYear() % 100, d.getUTCMonth() + 1, d.getUTCDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('')
  // No 0/O/1/I so it can be read out over the phone.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from(
    randomBytes(4),
    (b) => alphabet[b % alphabet.length],
  ).join('')
  return `DM-${stamp}-${suffix}`
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // non browser clients send none; not a security gate
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function handleEnquiry(
  request: Request,
  overrides: Partial<HandlerDeps> = {},
): Promise<Response> {
  const deps = { ...defaultDeps, ...overrides }
  const now = deps.now()

  if (!request.headers.get('content-type')?.includes('application/json'))
    return json({ ok: false, error: 'Unsupported content type.' }, 415)

  if (!sameOrigin(request))
    return json({ ok: false, error: 'Request not allowed.' }, 403)

  const raw = await request.text()
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES)
    return json({ ok: false, error: 'Your message is too large.' }, 413)

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return json({ ok: false, error: 'Invalid request.' }, 400)

  const ip = clientIp(request.headers)
  const ipLimit = deps.perIp.check(ip, now)
  const globalLimit = ipLimit.allowed
    ? deps.global.check('all', now)
    : { allowed: true, retryAfterSec: 0 }
  if (!ipLimit.allowed || !globalLimit.allowed) {
    const retryAfter = ipLimit.allowed
      ? globalLimit.retryAfterSec
      : ipLimit.retryAfterSec
    deps.log({
      event: 'enquiry.rate_limited',
      scope: ipLimit.allowed ? 'global' : 'ip',
    })
    return json(
      {
        ok: false,
        error:
          'Too many enquiries just now. Please try again a little later, or call us.',
      },
      429,
      { 'Retry-After': String(retryAfter) },
    )
  }

  const bot = detectBot(body as Record<string, unknown>, now)
  if (bot) {
    // Pretend it worked so the bot learns nothing and does not adapt.
    deps.log({ event: 'enquiry.spam_rejected', reason: bot })
    return json(
      { ok: true, reference: makeReference(now), acknowledged: true },
      200,
    )
  }

  const result = validateEnquiry(body)
  if (!result.ok) return json({ ok: false, errors: result.errors }, 422)

  const reference = makeReference(now)
  const receivedAt = new Date(now).toISOString()
  deps.log({
    event: 'enquiry.received',
    reference,
    service: result.data.service,
    receivedAt,
  })

  try {
    const sent = await deps.send(result.data, { reference, receivedAt })
    deps.log({
      event: 'enquiry.delivered',
      reference,
      acknowledged: sent.acknowledged,
    })
    return json({ ok: true, reference, acknowledged: sent.acknowledged }, 200)
  } catch (error) {
    const notConfigured = error instanceof MailNotConfiguredError
    console.error(
      JSON.stringify({
        event: 'enquiry.delivery_failed',
        reference,
        notConfigured,
        error: error instanceof Error ? error.message : String(error),
      }),
    )
    return json(
      {
        ok: false,
        reference,
        error:
          'We could not send your enquiry just now. Please email or call us directly using the details on this page.',
      },
      notConfigured ? 503 : 502,
    )
  }
}
