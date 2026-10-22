/**
 * Cookie consent: what the visitor chose, and for how long it is remembered.
 *
 * The site sets no cookies of its own. The one thing that needs permission is
 * the Google map on the Contact page, because Google receives the visitor's
 * IP address and may set cookies once it loads (see the Privacy Policy). So
 * "accepted" means "the map may load", and nothing else is gated on it.
 *
 * The choice is kept in the browser's localStorage, not in a cookie, so
 * remembering "no" never sets a cookie itself, and it is never sent to our
 * server. It lasts 12 months, then the visitor is asked again. Changing
 * CONSENT_VERSION asks everyone again (do that when the policy changes what
 * accepting covers).
 *
 * State is read straight from storage on every call and pushed to subscribers
 * on change, so it plugs into `useSyncExternalStore` (hooks/use-cookie-consent)
 * and stays in step across tabs.
 */

export const CONSENT_KEY = 'dm-cookie-consent'
export const CONSENT_VERSION = 1
/** 12 months. The Privacy Policy says "12 months"; keep them in step. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
/** Tolerated clock skew for a stored timestamp that looks like the future. */
const CLOCK_SKEW_MS = 5 * 60 * 1000

export type ConsentChoice = 'accepted' | 'declined'

/**
 * `loading`: server render and hydration, before storage can be read (render
 * as if undecided, but show no banner, so nothing flashes for returning
 * visitors). `unset`: no valid choice on record.
 */
export type ConsentState = 'loading' | 'unset' | ConsentChoice

export function serializeConsent(choice: ConsentChoice, now: number): string {
  return JSON.stringify({
    v: CONSENT_VERSION,
    choice,
    at: new Date(now).toISOString(),
  })
}

/** Returns the stored choice, or null if absent, malformed, old or expired. */
export function parseConsent(
  raw: string | null | undefined,
  now: number,
): ConsentChoice | null {
  if (!raw) return null
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (!value || typeof value !== 'object') return null
  const { v, choice, at } = value as Record<string, unknown>
  if (v !== CONSENT_VERSION) return null
  if (choice !== 'accepted' && choice !== 'declined') return null
  if (typeof at !== 'string') return null
  const given = Date.parse(at)
  if (!Number.isFinite(given)) return null
  if (given > now + CLOCK_SKEW_MS) return null
  if (now - given >= CONSENT_MAX_AGE_MS) return null
  return choice
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>()

/**
 * Used only when localStorage throws (Safari private mode, blocked site
 * data), so the choice at least holds for the page session instead of the
 * banner coming back on every navigation. Never consulted while storage works.
 */
let memory: string | null = null

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY)
  } catch {
    return memory
  }
}

function writeRaw(raw: string | null): void {
  memory = raw
  try {
    if (raw === null) window.localStorage.removeItem(CONSENT_KEY)
    else window.localStorage.setItem(CONSENT_KEY, raw)
  } catch {
    // Storage unavailable: `memory` holds it for this page session.
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

/** Current state on the client. Cheap and returns a primitive, as React needs. */
export function getConsentSnapshot(): ConsentState {
  return parseConsent(readRaw(), Date.now()) ?? 'unset'
}

/** What the server renders, and what hydration starts from. */
export function getServerConsentSnapshot(): ConsentState {
  return 'loading'
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener)
  // Another tab changed (or cleared) the choice.
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function setConsent(choice: ConsentChoice): void {
  writeRaw(serializeConsent(choice, Date.now()))
  emit()
}

/** Forget the choice: the banner returns, and the map is withdrawn. */
export function resetConsent(): void {
  writeRaw(null)
  emit()
}
