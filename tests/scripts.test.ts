import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatReport, runChecks } from '../scripts/launch-check.mjs'
import {
  buildAddPopBody,
  buildPlan,
  generatePassword,
  run,
} from '../scripts/provision-webmail.mjs'
import accounts from '../scripts/webmail-accounts.json'

type Account = { email: string }

describe('webmail account list (scope 4.6: five accounts)', () => {
  it('defines exactly five distinct, valid accounts', () => {
    expect(accounts.accounts).toHaveLength(5)
    expect(new Set(accounts.accounts.map((a) => a.local)).size).toBe(5)
    for (const a of accounts.accounts)
      expect(a.local).toMatch(/^[a-z0-9][a-z0-9._-]*$/)
  })

  it('includes the sender mailbox used for enquiry emails', () => {
    expect(accounts.accounts.some((a) => a.local === 'noreply')).toBe(true)
  })
})

describe('generatePassword', () => {
  it('is 20 characters with every character class, every time', () => {
    for (let i = 0; i < 200; i++) {
      const p = generatePassword()
      expect(p).toHaveLength(20)
      expect(p).toMatch(/[a-z]/)
      expect(p).toMatch(/[A-Z]/)
      expect(p).toMatch(/[0-9]/)
      expect(p).toMatch(/[!@#$%^&*\-_=+]/)
    }
  })

  it('does not repeat', () => {
    expect(
      new Set(Array.from({ length: 200 }, () => generatePassword())).size,
    ).toBe(200)
  })
})

describe('buildPlan', () => {
  const cfg = {
    domain: 'x.com',
    accounts: [{ local: 'sales' }, { local: 'projects' }],
  }

  it('skips existing accounts case insensitively', () => {
    const plan = buildPlan(cfg, ['SALES@x.com'])
    expect(plan.skipped.map((a: Account) => a.email)).toEqual(['sales@x.com'])
    expect(plan.toCreate.map((a: Account) => a.email)).toEqual([
      'projects@x.com',
    ])
  })

  it('rejects bad or duplicate names', () => {
    expect(() =>
      buildPlan({ domain: 'x.com', accounts: [{ local: 'Bad Name' }] }, []),
    ).toThrow(/Invalid mailbox/)
    expect(() =>
      buildPlan(
        { domain: 'x.com', accounts: [{ local: 'a' }, { local: 'a' }] },
        [],
      ),
    ).toThrow(/Duplicate/)
  })
})

describe('buildAddPopBody', () => {
  it('puts the password in the body, with a quota and no welcome email', () => {
    const body = buildAddPopBody(
      { local: 'sales', quotaMb: 2048 },
      'x.com',
      'p@ss&word',
    )
    expect(body.get('password')).toBe('p@ss&word')
    expect(body.get('quota')).toBe('2048')
    expect(body.get('send_welcome_email')).toBe('0')
  })
})

describe('provision-webmail run()', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'webmail-'))
  const configPath = path.join(dir, 'accounts.json')
  writeFileSync(
    configPath,
    JSON.stringify({
      domain: 'x.com',
      accounts: [{ local: 'sales', quotaMb: 100 }, { local: 'projects' }],
    }),
  )
  const env = {
    CPANEL_HOST: 'h.example:2083',
    CPANEL_USER: 'u',
    CPANEL_TOKEN: 't',
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const stub = () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`)
      const data = url.endsWith('list_pops') ? [{ email: 'sales@x.com' }] : {}
      return new Response(JSON.stringify({ status: 1, data }))
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    return calls
  }

  it('refuses to run without credentials', async () => {
    await expect(run({ env: {}, argv: [], configPath })).rejects.toThrow(
      /CPANEL_HOST/,
    )
  })

  it('dry run changes nothing', async () => {
    const calls = stub()
    const out = await run({
      env,
      argv: [],
      configPath,
      credentialsPath: path.join(dir, 'none.txt'),
    })
    expect(out.created).toEqual([])
    expect(calls.filter((c) => c.includes('add_pop'))).toHaveLength(0)
  })

  it('--apply creates only missing accounts and writes a private credentials file', async () => {
    const calls = stub()
    const credentialsPath = path.join(dir, 'creds.txt')
    const out = await run({
      env,
      argv: ['--apply'],
      configPath,
      credentialsPath,
    })
    expect(calls.filter((c) => c.includes('add_pop'))).toHaveLength(1)
    expect(out.created.map((a: Account) => a.email)).toEqual(['projects@x.com'])
    expect(statSync(credentialsPath).mode & 0o777).toBe(0o600)
    expect(readFileSync(credentialsPath, 'utf8')).toContain('projects@x.com')
    // The password is never put in a URL, where it would end up in logs.
    expect(calls.join('\n')).not.toMatch(/password=/)
  })

  it('surfaces cPanel errors clearly', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(JSON.stringify({ status: 0, errors: ['Bad token'] })),
    )
    await expect(run({ env, argv: [], configPath })).rejects.toThrow(
      /Bad token/,
    )
  })
})

describe('launch check', () => {
  const slots = [
    { id: 'a', src: '/images/hero/image5.png' },
    { id: 'b', src: '/images/team/real.jpg' },
    { id: 'c' },
  ]
  const hasRealPhoto = (s: { src?: string }) =>
    Boolean(s.src) && !s.src?.startsWith('/images/hero/')
  const goodEnv = {
    SMTP_HOST: 'h',
    SMTP_USER: 'u',
    SMTP_PASS: 'p',
    NEXT_PUBLIC_SITE_URL: 'https://www.daramanihot.com.ng',
  }
  const base = {
    env: goodEnv,
    slots,
    team: [{ name: 'Real Person', placeholder: false }],
    hasRealPhoto,
    socialLinks: { x: 'https://x.test' },
  }
  type Finding = { id: string; level: string }
  const ids = (f: Finding[], level: string) =>
    f.filter((x) => x.level === level).map((x) => x.id)

  it('has no blockers when email and team are real, and only warns about photos', () => {
    const f = runChecks(base)
    expect(ids(f, 'BLOCKER')).toEqual([])
    expect(ids(f, 'WARNING')).toContain('photos')
  })

  it('accepts complete ZeptoMail settings without SMTP credentials', () => {
    const env = { MAIL_DRIVER: 'zeptomail', ZEPTOMAIL_TOKEN: 'test-token', ZEPTOMAIL_FROM_EMAIL: 'noreply@daramanihot.com.ng' }
    expect(ids(runChecks({ ...base, env }), 'BLOCKER')).toEqual([])
  })

  it('blocks incomplete ZeptoMail settings instead of requiring SMTP', () => {
    const findings = runChecks({ ...base, env: { MAIL_DRIVER: 'zeptomail', ZEPTOMAIL_FROM_EMAIL: '@daramanihot.com.ng' } })
    expect(ids(findings, 'BLOCKER')).toEqual(['zeptomail', 'zeptomail'])
  })

  it('accepts both organisation recipients for ZeptoMail launch checks', () => {
    const env = { MAIL_DRIVER: 'zeptomail', ZEPTOMAIL_TOKEN: 'test', ZEPTOMAIL_FROM_EMAIL: 'noreply@daramanihot.com.ng', ENQUIRY_TO: 'daramanihot@gmail.com, info@daramanihot.com' }
    expect(ids(runChecks({ ...base, env }), 'BLOCKER')).toEqual([])
    expect(ids(runChecks({ ...base, env: { ...env, ENQUIRY_TO: 'one@example.com,' } }), 'BLOCKER')).toEqual(['zeptomail'])
  })

  it('blocks on missing SMTP settings', () => {
    expect(ids(runChecks({ ...base, env: {} }), 'BLOCKER')).toEqual([
      'smtp',
      'smtp',
      'smtp',
    ])
  })

  it('blocks on the json mail driver and on public photo briefs', () => {
    const f = runChecks({
      ...base,
      env: {
        ...goodEnv,
        MAIL_DRIVER: 'json',
        NEXT_PUBLIC_SHOW_PHOTO_SLOTS: 'true',
      },
    })
    expect(ids(f, 'BLOCKER')).toEqual(['mail-driver', 'photo-brief'])
  })

  it('blocks on placeholder team members', () => {
    const f = runChecks({
      ...base,
      team: [{ name: 'Dr. Fake', placeholder: true }],
    })
    expect(ids(f, 'BLOCKER')).toEqual(['team'])
  })

  it('warns about a local or missing site URL', () => {
    const f = runChecks({
      ...base,
      env: { ...goodEnv, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' },
    })
    expect(ids(f, 'WARNING')).toContain('site-url')
  })

  it('formats a readable report', () => {
    expect(formatReport(runChecks({ ...base, env: {} }))).toMatch(
      /\d blocker\(s\): do not go live/,
    )
    expect(formatReport(runChecks(base))).toContain('No blockers.')
  })
})

describe('launch check: social links', () => {
  const base = {
    env: {
      SMTP_HOST: 'h',
      SMTP_USER: 'u',
      SMTP_PASS: 'p',
      NEXT_PUBLIC_SITE_URL: 'https://www.daramanihot.com.ng',
    },
    slots: [],
    team: [],
    hasRealPhoto: () => true,
  }
  const warned = (socialLinks: Record<string, string>) =>
    runChecks({ ...base, socialLinks }).some((f: { id: string }) => f.id === 'social')

  it('no longer calls confirmed links "unverified guesses"', () => {
    expect(
      warned({
        linkedin: 'https://www.linkedin.com/company/daracare-manihot-industries-farms/',
        facebook: 'https://www.facebook.com/dmanihot',
      }),
    ).toBe(false)
  })

  it('still flags a link that is not a full https address', () => {
    expect(warned({ facebook: 'facebook.com/dmanihot' })).toBe(true)
    expect(warned({ facebook: 'http://facebook.com/dmanihot' })).toBe(true)
  })
})
