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
 *   1. the Tailwind prefix on the desktop wrapper and the logo size (site-header)
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

// Estimated width the desktop bar needs: 2 * 32px container padding + 81px
// logo + 24px gap + 443px links + 24px gap + 134px button = 770px (1rem =
// 16px). The swap must not happen below that. The real, measured fit is
// asserted by e2e/header-fit.spec.ts.
const DESKTOP_HEADER_NEEDS_PX = 770

describe('header breakpoint stays in sync', () => {
  const header = read('components/site-header.tsx')
  const mobileNav = read('components/mobile-nav.tsx')

  const prefix = (src: string, utility: RegExp) => {
    const m = src.match(utility)
    if (!m) throw new Error(`utility ${utility} not found`)
    return m[1]
  }

  const wrapperPrefix = prefix(header, /hidden[^"]*?\b(\w+):flex/)
  const burgerPrefix = prefix(mobileNav, /(\w+):hidden/)

  it('uses one Tailwind breakpoint for the desktop wrapper and the hamburger', () => {
    expect(burgerPrefix).toBe(wrapperPrefix)
  })

  it('moves the logo size with the same breakpoint', () => {
    expect(header).toContain(`${wrapperPrefix}:h-12`)
  })

  it('DESKTOP_QUERY is that same breakpoint', () => {
    const q = mobileNav.match(/DESKTOP_QUERY = '\(min-width: ([\d.]+)rem\)'/)
    expect(q, 'DESKTOP_QUERY not found').not.toBeNull()
    expect(Number(q?.[1])).toBe(BREAKPOINT_REM[wrapperPrefix])
  })

  it('swaps no lower than the desktop header can fit (no md regression)', () => {
    expect(BREAKPOINT_REM[wrapperPrefix] * 16).toBeGreaterThanOrEqual(
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
