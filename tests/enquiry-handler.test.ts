import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  handleEnquiry,
  MAX_BODY_BYTES,
  makeReference,
} from '@/lib/enquiry-handler'
import { MailNotConfiguredError } from '@/lib/mailer'
import { HONEYPOT_FIELD, MIN_FILL_MS, RateLimiter } from '@/lib/spam'

const NOW = 1_800_000_000_000
const goodBody = () => ({
  name: 'Ada Okafor',
  email: 'ada@example.com',
  phone: '+234 802 340 0557',
  service: 'solar-renewables',
  message: 'We would like a solar quote for our mill.',
  startedAt: NOW - 20_000,
  [HONEYPOT_FIELD]: '',
})

function post(
  body: unknown,
  headers: Record<string, string> = {},
  raw?: string,
) {
  return new Request('https://www.daramanihot.com.ng/api/enquiry', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'www.daramanihot.com.ng',
      'x-forwarded-for': '203.0.113.7',
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  })
}

let send: ReturnType<typeof vi.fn>
let log: ReturnType<typeof vi.fn>
const deps = () => ({
  now: () => NOW,
  send: send as never,
  perIp: new RateLimiter(5, 3_600_000),
  global: new RateLimiter(100, 3_600_000),
  log: log as never,
})

beforeEach(() => {
  send = vi.fn().mockResolvedValue({ notified: true, acknowledged: true })
  log = vi.fn()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/enquiry: happy path', () => {
  it('delivers a valid enquiry and returns a reference', async () => {
    const res = await handleEnquiry(post(goodBody()), deps())
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ ok: true, acknowledged: true })
    expect(json.reference).toMatch(/^DM-\d{6}-[A-Z2-9]{4}$/)
    expect(send).toHaveBeenCalledOnce()
    const [data, ctx] = send.mock.calls[0]
    expect(data.email).toBe('ada@example.com')
    expect(ctx.reference).toBe(json.reference)
  })

  it('never sends the honeypot or timing fields onward', async () => {
    await handleEnquiry(post(goodBody()), deps())
    const [data] = send.mock.calls[0]
    expect(Object.keys(data).sort()).toEqual([
      'email',
      'message',
      'name',
      'phone',
      'service',
    ])
  })

  it('logs the enquiry without personal data', async () => {
    await handleEnquiry(post(goodBody()), deps())
    const logged = JSON.stringify(log.mock.calls)
    expect(logged).toContain('enquiry.received')
    expect(logged).not.toContain('ada@example.com')
    expect(logged).not.toContain('Okafor')
    expect(logged).not.toContain('solar quote')
  })

  it('is never cached', async () => {
    const res = await handleEnquiry(post(goodBody()), deps())
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  it('reports when the acknowledgement could not be sent', async () => {
    send.mockResolvedValue({ notified: true, acknowledged: false })
    const json = await (await handleEnquiry(post(goodBody()), deps())).json()
    expect(json.acknowledged).toBe(false)
  })
})

describe('POST /api/enquiry: request hygiene', () => {
  it('rejects non JSON content types (415)', async () => {
    const res = await handleEnquiry(
      post(null, { 'content-type': 'text/plain' }),
      deps(),
    )
    expect(res.status).toBe(415)
  })

  it('rejects a cross origin browser post (403)', async () => {
    const res = await handleEnquiry(
      post(goodBody(), { origin: 'https://evil.example' }),
      deps(),
    )
    expect(res.status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  it('accepts the same origin, including behind a proxy host header', async () => {
    const ok = await handleEnquiry(
      post(goodBody(), { origin: 'https://www.daramanihot.com.ng' }),
      deps(),
    )
    expect(ok.status).toBe(200)
    const proxied = await handleEnquiry(
      post(goodBody(), {
        origin: 'https://www.daramanihot.com.ng',
        host: 'internal:3000',
        'x-forwarded-host': 'www.daramanihot.com.ng',
      }),
      deps(),
    )
    expect(proxied.status).toBe(200)
  })

  it('rejects oversize bodies (413)', async () => {
    const res = await handleEnquiry(
      post(
        null,
        {},
        JSON.stringify({ message: 'x'.repeat(MAX_BODY_BYTES + 1) }),
      ),
      deps(),
    )
    expect(res.status).toBe(413)
  })

  it.each(['not json', '[]', 'null', '"str"', '42'])(
    'rejects malformed body %s (400)',
    async (raw) => {
      const res = await handleEnquiry(post(null, {}, raw), deps())
      expect(res.status).toBe(400)
      expect(send).not.toHaveBeenCalled()
    },
  )
})

describe('POST /api/enquiry: validation', () => {
  it('returns field errors with 422 and sends nothing', async () => {
    const res = await handleEnquiry(
      post({ ...goodBody(), email: 'nope', message: '' }),
      deps(),
    )
    const json = await res.json()
    expect(res.status).toBe(422)
    expect(Object.keys(json.errors).sort()).toEqual(['email', 'message'])
    expect(send).not.toHaveBeenCalled()
  })

  it('blocks header injection through the email field', async () => {
    const res = await handleEnquiry(
      post({
        ...goodBody(),
        email: 'a@example.com\nBcc: victim@example.com',
      }),
      deps(),
    )
    expect(res.status).toBe(422)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('POST /api/enquiry: spam protection (scope 4.5)', () => {
  it('silently drops a honeypot hit while looking successful', async () => {
    const res = await handleEnquiry(
      post({ ...goodBody(), [HONEYPOT_FIELD]: 'http://spam' }),
      deps(),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    expect(send).not.toHaveBeenCalled()
    expect(JSON.stringify(log.mock.calls)).toContain('honeypot')
  })

  it('drops a direct API post with no timestamp', async () => {
    const { startedAt: _drop, ...noStamp } = goodBody()
    const res = await handleEnquiry(post(noStamp), deps())
    expect(res.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it('drops a post that arrives faster than a person could fill the form', async () => {
    await handleEnquiry(
      post({ ...goodBody(), startedAt: NOW - (MIN_FILL_MS - 500) }),
      deps(),
    )
    expect(send).not.toHaveBeenCalled()
  })

  it('rate limits one IP after five enquiries (429 with Retry-After)', async () => {
    const d = deps()
    for (let i = 0; i < 5; i++)
      expect((await handleEnquiry(post(goodBody()), d)).status).toBe(200)
    const res = await handleEnquiry(post(goodBody()), d)
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(send).toHaveBeenCalledTimes(5)
  })

  it('does not let one IP block another', async () => {
    const d = deps()
    for (let i = 0; i < 6; i++) await handleEnquiry(post(goodBody()), d)
    const other = await handleEnquiry(
      post(goodBody(), { 'x-forwarded-for': '198.51.100.1' }),
      d,
    )
    expect(other.status).toBe(200)
  })

  it('enforces the global ceiling across many IPs', async () => {
    const d = { ...deps(), global: new RateLimiter(2, 3_600_000) }
    const from = (n: number) =>
      post(goodBody(), { 'x-forwarded-for': `203.0.113.${n}` })
    expect((await handleEnquiry(from(1), d)).status).toBe(200)
    expect((await handleEnquiry(from(2), d)).status).toBe(200)
    expect((await handleEnquiry(from(3), d)).status).toBe(429)
  })

  it('checks the rate limit before validating the content', async () => {
    const d = deps()
    for (let i = 0; i < 5; i++) await handleEnquiry(post(goodBody()), d)
    const res = await handleEnquiry(
      post({ ...goodBody(), email: 'invalid' }),
      d,
    )
    expect(res.status).toBe(429)
  })
})

describe('POST /api/enquiry: delivery failures', () => {
  it('returns 502 with a human message and the reference when the mail server fails', async () => {
    send.mockRejectedValue(new Error('ECONNREFUSED'))
    const res = await handleEnquiry(post(goodBody()), deps())
    const json = await res.json()
    expect(res.status).toBe(502)
    expect(json.ok).toBe(false)
    expect(json.error).toMatch(/email or call us/i)
    expect(json.reference).toMatch(/^DM-/)
    expect(JSON.stringify(json)).not.toContain('ECONNREFUSED')
  })

  it('returns 503 when email is not configured', async () => {
    send.mockRejectedValue(new MailNotConfiguredError())
    const res = await handleEnquiry(post(goodBody()), deps())
    expect(res.status).toBe(503)
  })
})

describe('makeReference', () => {
  it('encodes the UTC date', () => {
    expect(makeReference(Date.UTC(2026, 9, 14))).toMatch(/^DM-261014-/)
  })

  it('is unique and avoids ambiguous characters', () => {
    const refs = new Set(Array.from({ length: 500 }, () => makeReference(NOW)))
    expect(refs.size).toBeGreaterThan(495)
    for (const r of refs) expect(r.split('-')[2]).not.toMatch(/[01OI]/)
  })
})
