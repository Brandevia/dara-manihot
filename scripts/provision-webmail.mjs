#!/usr/bin/env node
/**
 * Creates the five business webmail accounts through the cPanel UAPI.
 *
 *   node scripts/provision-webmail.mjs            # dry run: prints the plan
 *   node scripts/provision-webmail.mjs --apply    # creates the missing ones
 *
 * Needs CPANEL_HOST (e.g. server1.example.com:2083), CPANEL_USER and
 * CPANEL_TOKEN (cPanel > Security > Manage API Tokens). Safe to re-run:
 * accounts that already exist are skipped, never modified.
 *
 * Passwords are generated locally, written once to webmail-credentials.txt
 * (mode 600, git ignored) for the handover, and never printed or logged.
 * If your host is not cPanel, use docs/EMAIL-SETUP.md (manual steps).
 */
import { randomInt } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%^&*-_=+'
const ALL = LOWER + UPPER + DIGITS + SYMBOLS

const pick = (set) => set[randomInt(set.length)]

/** 20 chars, always containing every character class, shuffled. */
export function generatePassword(length = 20) {
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)]
  while (chars.length < length) chars.push(pick(ALL))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

const LOCAL_PART = /^[a-z0-9][a-z0-9._-]{0,63}$/

/** Splits the wanted accounts into ones to create and ones that exist. */
export function buildPlan(config, existingEmails) {
  const existing = new Set(existingEmails.map((e) => e.toLowerCase()))
  const seen = new Set()
  const toCreate = []
  const skipped = []
  for (const account of config.accounts) {
    if (!LOCAL_PART.test(account.local))
      throw new Error(`Invalid mailbox name: "${account.local}"`)
    const email = `${account.local}@${config.domain}`
    if (seen.has(email)) throw new Error(`Duplicate account: ${email}`)
    seen.add(email)
    ;(existing.has(email) ? skipped : toCreate).push({ ...account, email })
  }
  return { toCreate, skipped }
}

/** POST body (not the URL, so passwords stay out of access logs). */
export function buildAddPopBody(account, domain, password) {
  return new URLSearchParams({
    email: account.local,
    domain,
    password,
    quota: String(account.quotaMb ?? 1024),
    send_welcome_email: '0',
  })
}

async function uapi(host, auth, module, fn, body) {
  const url = `https://${host}/execute/${module}/${fn}`
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `cpanel ${auth}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body,
  })
  if (!res.ok) throw new Error(`${module}::${fn} failed: HTTP ${res.status}`)
  const json = await res.json()
  if (json.status !== 1)
    throw new Error(
      `${module}::${fn} failed: ${(json.errors ?? []).join('; ')}`,
    )
  return json.data
}

/**
 * @param {{
 *   env?: Record<string, string | undefined>,
 *   argv?: string[],
 *   configPath?: string,
 *   credentialsPath?: string,
 * }} [options]
 */
export async function run(
  {
    env = process.env,
    argv = process.argv.slice(2),
    configPath,
    credentialsPath = 'webmail-credentials.txt',
  } = /** @type {never} */ ({}),
) {
  const apply = argv.includes('--apply')
  const path =
    configPath ??
    fileURLToPath(new URL('./webmail-accounts.json', import.meta.url))
  const config = JSON.parse(readFileSync(path, 'utf8'))

  const { CPANEL_HOST, CPANEL_USER, CPANEL_TOKEN } = env
  if (!CPANEL_HOST || !CPANEL_USER || !CPANEL_TOKEN)
    throw new Error(
      'Set CPANEL_HOST, CPANEL_USER and CPANEL_TOKEN first (see the header of this file).',
    )
  const auth = `${CPANEL_USER}:${CPANEL_TOKEN}`

  const pops = await uapi(CPANEL_HOST, auth, 'Email', 'list_pops')
  const { toCreate, skipped } = buildPlan(
    config,
    pops.map((p) => p.email),
  )

  console.log(`Domain: ${config.domain}`)
  for (const a of skipped) console.log(`  exists   ${a.email}`)
  for (const a of toCreate)
    console.log(
      `  ${apply ? 'creating' : 'would create'} ${a.email}  (${a.purpose})`,
    )
  if (!apply) {
    console.log(
      '\nDry run only. Re-run with --apply to create the accounts above.',
    )
    return { created: [], skipped }
  }

  const created = []
  const lines = [
    'Dara-Manihot webmail credentials. Hand over securely, then delete this file.',
    '',
  ]
  for (const account of toCreate) {
    const password = generatePassword()
    await uapi(
      CPANEL_HOST,
      auth,
      'Email',
      'add_pop',
      buildAddPopBody(account, config.domain, password),
    )
    created.push(account)
    lines.push(`${account.email}\t${password}\t${account.purpose}`)
    console.log(`  created  ${account.email}`)
  }
  if (created.length > 0) {
    writeFileSync(credentialsPath, `${lines.join('\n')}\n`, { mode: 0o600 })
    console.log(
      `\nPasswords saved to ${credentialsPath} (not printed, git ignored).`,
    )
  }
  return { created, skipped }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run().catch((error) => {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  })
}
