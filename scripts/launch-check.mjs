#!/usr/bin/env node
/**
 * Launch readiness report: everything still standing between this build and
 * a production deploy. Exit code 1 if anything blocks launch.
 *
 *   pnpm launch:check        (Node 22.6+; it reads the site's own TypeScript data)
 *
 * BLOCKER = do not go live. WARNING = go live only knowingly.
 */
import { pathToFileURL } from 'node:url'

/** Pure: takes the facts, returns findings. Tested in tests/scripts.test.ts. */
export function runChecks({ env, slots, team, hasRealPhoto, socialLinks }) {
  const findings = []
  const add = (level, id, message) => findings.push({ level, id, message })

  const zepto = env.MAIL_DRIVER === 'zeptomail' || (!env.MAIL_DRIVER && env.ZEPTOMAIL_TOKEN)
  if (zepto) {
    const validAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? '')
    if (!env.ZEPTOMAIL_TOKEN?.trim() || env.ZEPTOMAIL_TOKEN.includes('********') || /[\r\n]/.test(env.ZEPTOMAIL_TOKEN))
      add('BLOCKER', 'zeptomail', 'ZEPTOMAIL_TOKEN is missing or invalid.')
    if (!validAddress(env.ZEPTOMAIL_FROM_EMAIL?.trim()))
      add('BLOCKER', 'zeptomail', 'ZEPTOMAIL_FROM_EMAIL must be a complete authorised sender address.')
    if (env.ENQUIRY_TO && env.ENQUIRY_TO.split(',').some((value) => !validAddress(value.trim()) || /[,;]/.test(value)))
      add('BLOCKER', 'zeptomail', 'ENQUIRY_TO must be a comma-separated list of valid recipient addresses.')
  } else {
    for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'])
      if (!env[key]) add('BLOCKER', 'smtp', `${key} is not set: enquiries cannot be delivered.`)
  }
  if (env.MAIL_DRIVER && !['zeptomail', 'smtp', 'json'].includes(env.MAIL_DRIVER))
    add('BLOCKER', 'mail-driver', 'MAIL_DRIVER must be zeptomail, smtp or json.')
  if (env.MAIL_DRIVER === 'json')
    add(
      'BLOCKER',
      'mail-driver',
      'MAIL_DRIVER=json sends nothing: real enquiries would be silently dropped.',
    )
  if (env.NEXT_PUBLIC_SHOW_PHOTO_SLOTS === 'true')
    add(
      'BLOCKER',
      'photo-brief',
      'NEXT_PUBLIC_SHOW_PHOTO_SLOTS=true prints photo briefs to the public.',
    )

  const fakeTeam = team.filter((m) => m.placeholder)
  if (fakeTeam.length > 0)
    add(
      'BLOCKER',
      'team',
      `${fakeTeam.length} placeholder team member(s) on /projects (${fakeTeam.map((m) => m.name).join(', ')}).`,
    )

  if (
    !env.NEXT_PUBLIC_SITE_URL ||
    /localhost|127\.0\.0\.1/.test(env.NEXT_PUBLIC_SITE_URL)
  )
    add(
      'WARNING',
      'site-url',
      'NEXT_PUBLIC_SITE_URL is unset or local: the logo in emails will not load for recipients.',
    )

  const pending = slots.filter((s) => !hasRealPhoto(s))
  if (pending.length > 0)
    add(
      'WARNING',
      'photos',
      `${pending.length} of ${slots.length} image slots have no real photo yet: ${pending.map((s) => s.id).join(', ')}.`,
    )

  add(
    'WARNING',
    'social',
    `Social links are unverified guesses from the original site: ${Object.values(socialLinks).join(', ')}.`,
  )

  return findings
}

export function formatReport(findings) {
  const blockers = findings.filter((f) => f.level === 'BLOCKER')
  const lines = findings.map(
    (f) => `${f.level === 'BLOCKER' ? 'BLOCKER ' : 'WARNING '} ${f.message}`,
  )
  lines.push(
    '',
    blockers.length === 0
      ? 'No blockers.'
      : `${blockers.length} blocker(s): do not go live yet.`,
  )
  return lines.join('\n')
}

async function main() {
  const [{ PHOTO_SLOTS, hasRealPhoto }, { TEAM }, { SOCIAL_LINKS }] =
    await Promise.all([
      import('../lib/imagery.ts'),
      import('../lib/team.ts'),
      import('../lib/constants.ts'),
    ])
  const findings = runChecks({
    env: process.env,
    slots: PHOTO_SLOTS,
    team: TEAM,
    hasRealPhoto,
    socialLinks: SOCIAL_LINKS,
  })
  console.log(formatReport(findings))
  process.exit(findings.some((f) => f.level === 'BLOCKER') ? 1 : 0)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
