import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieBanner } from '@/components/cookie-banner'
import { CookieSettingsButton } from '@/components/cookie-settings-button'
import { Footer } from '@/components/footer'
import {
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  CONSENT_VERSION,
  getConsentSnapshot,
  getServerConsentSnapshot,
  parseConsent,
  resetConsent,
  serializeConsent,
  setConsent,
  subscribeConsent,
} from '@/lib/cookie-consent'
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '@/lib/legal'

const NOW = Date.parse('2026-10-21T12:00:00Z')

beforeEach(() => {
  window.localStorage.clear()
  resetConsent()
})
afterEach(() => vi.restoreAllMocks())

describe('parseConsent', () => {
  it('round trips both choices', () => {
    for (const c of ['accepted', 'declined'] as const) {
      expect(parseConsent(serializeConsent(c, NOW), NOW)).toBe(c)
    }
  })

  it.each([
    ['null', null],
    ['empty', ''],
    ['not json', '{nope'],
    ['a string', '"accepted"'],
    ['null json', 'null'],
    [
      'unknown choice',
      JSON.stringify({ v: 1, choice: 'maybe', at: '2026-10-21T00:00:00Z' }),
    ],
    [
      'wrong version',
      JSON.stringify({
        v: CONSENT_VERSION + 1,
        choice: 'accepted',
        at: '2026-10-21T00:00:00Z',
      }),
    ],
    ['no date', JSON.stringify({ v: CONSENT_VERSION, choice: 'accepted' })],
    [
      'bad date',
      JSON.stringify({
        v: CONSENT_VERSION,
        choice: 'accepted',
        at: 'yesterday',
      }),
    ],
  ])('rejects %s', (_n, raw) => {
    expect(parseConsent(raw, NOW)).toBeNull()
  })

  it('expires after 12 months, not before', () => {
    const raw = serializeConsent('accepted', NOW)
    expect(parseConsent(raw, NOW + CONSENT_MAX_AGE_MS - 1)).toBe('accepted')
    expect(parseConsent(raw, NOW + CONSENT_MAX_AGE_MS)).toBeNull()
  })

  it('rejects a timestamp from the future but tolerates small clock skew', () => {
    expect(parseConsent(serializeConsent('accepted', NOW + 60_000), NOW)).toBe(
      'accepted',
    )
    expect(
      parseConsent(serializeConsent('accepted', NOW + 24 * 3600_000), NOW),
    ).toBeNull()
  })
})

describe('consent store', () => {
  it('starts unset on the client and loading on the server', () => {
    expect(getConsentSnapshot()).toBe('unset')
    expect(getServerConsentSnapshot()).toBe('loading')
  })

  it('persists in localStorage and notifies subscribers', () => {
    const listener = vi.fn()
    const off = subscribeConsent(listener)
    setConsent('accepted')
    expect(getConsentSnapshot()).toBe('accepted')
    expect(window.localStorage.getItem(CONSENT_KEY)).toContain('accepted')
    expect(listener).toHaveBeenCalledTimes(1)
    resetConsent()
    expect(getConsentSnapshot()).toBe('unset')
    expect(window.localStorage.getItem(CONSENT_KEY)).toBeNull()
    off()
    setConsent('declined')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('follows changes made in another tab', () => {
    const listener = vi.fn()
    const off = subscribeConsent(listener)
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY }))
    expect(listener).toHaveBeenCalledTimes(1)
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated' }))
    expect(listener).toHaveBeenCalledTimes(1)
    off()
  })

  it('never sets a cookie', () => {
    setConsent('accepted')
    expect(document.cookie).toBe('')
  })

  it('treats an expired stored choice as unset', () => {
    const old = serializeConsent(
      'accepted',
      Date.now() - CONSENT_MAX_AGE_MS - 1000,
    )
    window.localStorage.setItem(CONSENT_KEY, old)
    expect(getConsentSnapshot()).toBe('unset')
  })

  it('falls back to memory when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => setConsent('declined')).not.toThrow()
    expect(getConsentSnapshot()).toBe('declined')
    expect(() => resetConsent()).not.toThrow()
    expect(getConsentSnapshot()).toBe('unset')
  })
})

describe('CookieBanner', () => {
  const nonEssentialSwitch = () =>
    screen.getByRole('switch', { name: 'Non-essential' })

  it('asks on a first visit, with equally prominent Reject and Accept all', () => {
    render(<CookieBanner />)
    const dialog = screen.getByRole('dialog', { name: 'Cookie preferences' })
    expect(dialog).toHaveAttribute('aria-modal', 'false')
    const accept = screen.getByRole('button', { name: 'Accept all' })
    const reject = screen.getByRole('button', { name: 'Reject non-essential' })
    expect(accept.className).toContain('h-12')
    expect(reject.className).toContain('h-12')
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy#cookies')
  })

  it('has an Essential switch that is on and locked', () => {
    render(<CookieBanner />)
    const essential = screen.getByRole('switch', { name: 'Essential' })
    expect(essential).toBeChecked()
    expect(essential).toBeDisabled()
  })

  it('starts with Non-essential off, and gives the map reasoning only on request', () => {
    render(<CookieBanner />)
    expect(nonEssentialSwitch()).not.toBeChecked()
    expect(screen.queryByText(/Google receives your IP address/i)).toBeNull()
    expect(
      screen.getByRole('button', { name: /why does the map need cookies/i }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the Google map reasoning when Non-essential is turned on', async () => {
    render(<CookieBanner />)
    await userEvent.click(nonEssentialSwitch())
    expect(nonEssentialSwitch()).toBeChecked()
    expect(
      screen.getByText(/Google receives your IP address/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /why does the map need cookies/i }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens and closes the reasoning from its own button', async () => {
    render(<CookieBanner />)
    const why = screen.getByRole('button', {
      name: /why does the map need cookies/i,
    })
    await userEvent.click(why)
    expect(
      screen.getByText(/Google receives your IP address/i),
    ).toBeInTheDocument()
    await userEvent.click(why)
    expect(screen.queryByText(/Google receives your IP address/i)).toBeNull()
  })

  it('operates the switch from the keyboard', async () => {
    render(<CookieBanner />)
    nonEssentialSwitch().focus()
    await userEvent.keyboard(' ')
    expect(nonEssentialSwitch()).toBeChecked()
  })

  it('does not take focus on a first visit', () => {
    render(<CookieBanner />)
    expect(screen.getByRole('dialog')).not.toHaveFocus()
  })

  it('Accept all stores "accepted" and closes', async () => {
    render(<CookieBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Accept all' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(getConsentSnapshot()).toBe('accepted')
  })

  it('Reject non-essential stores "declined" even if the switch was on', async () => {
    render(<CookieBanner />)
    await userEvent.click(nonEssentialSwitch())
    await userEvent.click(
      screen.getByRole('button', { name: 'Reject non-essential' }),
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(getConsentSnapshot()).toBe('declined')
  })

  it('Save choices with the switch off stores "declined"', async () => {
    render(<CookieBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Save choices' }))
    expect(getConsentSnapshot()).toBe('declined')
  })

  it('Save choices with the switch on stores "accepted"', async () => {
    render(<CookieBanner />)
    await userEvent.click(nonEssentialSwitch())
    await userEvent.click(screen.getByRole('button', { name: 'Save choices' }))
    expect(getConsentSnapshot()).toBe('accepted')
  })

  it('stays hidden for a returning visitor', () => {
    setConsent('accepted')
    render(<CookieBanner />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('returns and takes focus when reopened from the footer', async () => {
    setConsent('declined')
    render(
      <>
        <CookieBanner />
        <CookieSettingsButton />
      </>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Cookie settings' }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveFocus()
  })

  it('appears in response to a change in another tab', () => {
    setConsent('accepted')
    render(<CookieBanner />)
    act(() => {
      window.localStorage.removeItem(CONSENT_KEY)
      window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY }))
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('footer cookie settings', () => {
  it('is in the footer and withdraws consent', async () => {
    setConsent('accepted')
    render(<Footer />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Cookie settings' }),
    )
    expect(getConsentSnapshot()).toBe('unset')
  })
})

describe('legal text matches the behaviour', () => {
  const text = (sections: typeof PRIVACY_SECTIONS) => JSON.stringify(sections)

  it('the privacy policy no longer mentions the old click to load flow', () => {
    expect(text(PRIVACY_SECTIONS)).not.toMatch(/Load interactive map/i)
  })

  it('the privacy policy covers consent, storage, expiry and withdrawal', () => {
    const cookies = PRIVACY_SECTIONS.find((s) => s.id === 'cookies')
    const body = JSON.stringify(cookies)
    expect(body).toMatch(/accept cookies/i)
    expect(body).toMatch(/local storage/i)
    expect(body).toMatch(/12 months/)
    expect(body).toMatch(/Cookie settings/)
    expect(body).toMatch(/decline/i)
    expect(body).toMatch(/essential/i)
  })

  it('the terms point to the consent choice and the Google map', () => {
    expect(text(TERMS_SECTIONS)).toMatch(/Google map/)
    expect(text(TERMS_SECTIONS)).toMatch(/consent to cookies/i)
  })
})
