import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from '@/components/site-header'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

/**
 * The header swaps hamburger -> desktop nav at ONE breakpoint, expressed in
 * three places that jsdom cannot cross-check through layout:
 *   1. the Tailwind prefix on the pill and the desktop wrapper (site-header)
 *   2. the Tailwind prefix that hides the hamburger (mobile-nav)
 *   3. DESKTOP_QUERY, which closes the open mobile menu (mobile-nav)
 * If they drift, tablets get both navs, or none, or a menu stuck open.
 * The real geometry is covered by e2e/header-fit.spec.ts.
 */

const root = join(import.meta.dirname, '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

// Tailwind v4 default breakpoints, in rem.
const BREAKPOINT_REM: Record<string, number> = {
  sm: 40,
  md: 48,
  lg: 64,
  xl: 80,
  '2xl': 96,
}

// Measured: the desktop header needs a 895px pill + 2 * 32px container
// padding = 959px. The swap must not happen below that (1rem = 16px).
const DESKTOP_HEADER_NEEDS_PX = 959

describe('header breakpoint stays in sync', () => {
  const header = read('components/site-header.tsx')
  const mobileNav = read('components/mobile-nav.tsx')

  const prefix = (src: string, utility: RegExp) => {
    const m = src.match(utility)
    if (!m) throw new Error(`utility ${utility} not found`)
    return m[1]
  }

  const pillPrefix = prefix(header, /(\w+):w-fit/)
  const wrapperPrefix = prefix(header, /hidden (\w+):contents/)
  const burgerPrefix = prefix(mobileNav, /(\w+):hidden/)

  it('uses one Tailwind breakpoint for the pill, the wrapper and the hamburger', () => {
    expect(wrapperPrefix).toBe(pillPrefix)
    expect(burgerPrefix).toBe(pillPrefix)
  })

  it('moves the pill spacing with the same breakpoint', () => {
    expect(header).toContain(`${pillPrefix}:gap-16`)
    expect(header).toContain(`${pillPrefix}:pl-6`)
  })

  it('DESKTOP_QUERY is that same breakpoint', () => {
    const q = mobileNav.match(/DESKTOP_QUERY = '\(min-width: ([\d.]+)rem\)'/)
    expect(q, 'DESKTOP_QUERY not found').not.toBeNull()
    expect(Number(q?.[1])).toBe(BREAKPOINT_REM[pillPrefix])
  })

  it('swaps no lower than the desktop header can fit (no md regression)', () => {
    expect(BREAKPOINT_REM[pillPrefix] * 16).toBeGreaterThanOrEqual(
      DESKTOP_HEADER_NEEDS_PX,
    )
  })
})

describe('SiteHeader at runtime', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('subscribes to the 64rem query and closes the menu when it matches', async () => {
    const queries: string[] = []
    let onChange: ((e: MediaQueryListEvent) => void) | undefined
    let matches = false
    vi.stubGlobal('matchMedia', (query: string) => {
      queries.push(query)
      return {
        get matches() {
          return matches
        },
        media: query,
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
          onChange = cb
        },
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }
    })

    render(<SiteHeader />)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(queries).toContain('(min-width: 64rem)')
    expect(queries).not.toContain('(min-width: 48rem)')

    matches = true
    act(() => onChange?.({ matches: true } as MediaQueryListEvent))
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })
})
