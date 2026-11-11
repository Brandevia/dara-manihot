import { expect, type Page, test } from '@playwright/test'

/**
 * The header is a full-width bar: logo on the leading edge, links and the
 * "Get in touch" button on the trailing edge. Nothing in it can shrink, so
 * below a certain width the desktop layout would collide (the logo with the
 * links, or the button spilling off the right edge). The hamburger takes over
 * at `lg` (64rem) before that can happen.
 *
 * These tests measure the real rendered geometry at widths chosen for a
 * reason, so they also catch the next time a nav link, label, gap or logo
 * size makes the desktop layout wider.
 */

// The iPad portrait set (768/810/820/834), the old pill's failure edges
// (884/950/951/959), both sides of the swap (1023/1024), phones down to 320
// (WCAG 1.4.10 reflow) and common laptop/desktop sizes.
const WIDTHS = [
  320, 360, 412, 700, 767, 768, 810, 820, 834, 884, 900, 950, 951, 959, 960,
  1000, 1023, 1024, 1100, 1280, 1440, 1920,
]

type Mode = 'desktop' | 'hamburger'

async function measure(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector('header')
    const row = header?.querySelector(':scope > div')
    if (!header || !row) throw new Error('header bar not found')
    const rect = (el: Element | null | undefined) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      const shown = getComputedStyle(el).display !== 'none' && b.width > 0
      return {
        left: b.left,
        right: b.right,
        top: b.top,
        bottom: b.bottom,
        width: b.width,
        height: b.height,
        shown,
      }
    }
    const cta = [...header.querySelectorAll('a[data-slot="button"]')].find(
      (a) => a.getAttribute('href') === '/contact',
    )
    const rowStyle = getComputedStyle(row)
    return {
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      rootFont: Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      ),
      padLeft: Number.parseFloat(rowStyle.paddingLeft),
      padRight: Number.parseFloat(rowStyle.paddingRight),
      header: rect(header),
      row: rect(row),
      logo: rect(header.querySelector('a[aria-label$="home"] img')),
      cta: rect(cta),
      nav: rect(header.querySelector('nav[aria-label="Main"]')),
      burger: rect(header.querySelector('button[aria-label$="menu"]')),
    }
  })
}

test.describe('header fits at every viewport width', () => {
  test.skip(({ isMobile }) => isMobile, 'width is set explicitly below')

  for (const width of WIDTHS) {
    test(`${width}px: one navigation mode, full-width bar, nothing clipped or overlapping`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const m = await measure(page)
      if (!(m.header && m.row && m.logo && m.cta && m.nav && m.burger))
        throw new Error('header parts missing')

      const mode: Mode = m.nav.shown && m.cta.shown ? 'desktop' : 'hamburger'

      // A conventional bar: it spans the whole viewport and is 4.5rem tall.
      expect(m.header.left).toBeCloseTo(0, 0)
      expect(m.header.right).toBeCloseTo(m.viewport, 0)
      expect(m.header.top).toBeCloseTo(0, 0)
      expect(m.header.height).toBeCloseTo(4.5 * m.rootFont, 0)
      // The page does not scroll sideways because of it (WCAG 1.4.10).
      expect(m.scrollWidth).toBeLessThanOrEqual(m.viewport)

      // The logo is visible, inside the bar's side padding and vertically
      // inside the bar, with room above and below.
      expect(m.logo.shown).toBe(true)
      expect(m.logo.left).toBeGreaterThanOrEqual(m.row.left + m.padLeft - 0.5)
      expect(m.logo.top).toBeGreaterThanOrEqual(m.header.top)
      expect(m.logo.bottom).toBeLessThanOrEqual(m.header.bottom)
      // The wordmark is part of the image; it must stay legible: no tiny logo.
      expect(m.logo.height).toBeGreaterThanOrEqual(40)

      if (mode === 'desktop') {
        // Never both navigations at once.
        expect(m.burger.shown).toBe(false)
        // Links and button never collide with the logo (at least 16px apart).
        expect(m.nav.left - m.logo.right).toBeGreaterThanOrEqual(16)
        // The button sits inside the bar's trailing padding.
        expect(m.cta.right + m.padRight).toBeLessThanOrEqual(m.row.right + 0.5)
        expect(m.cta.right).toBeLessThanOrEqual(m.viewport)
        // Links come before the button, left to right.
        expect(m.nav.right).toBeLessThanOrEqual(m.cta.left)
      } else {
        // Never zero navigations: the hamburger must be the way in.
        expect(m.burger.shown).toBe(true)
        expect(m.burger.right).toBeLessThanOrEqual(m.viewport)
        expect(m.burger.left).toBeGreaterThanOrEqual(m.logo.right)
        // 44px hit area (WCAG 2.5.8 asks for 24).
        expect(m.burger.width).toBeGreaterThanOrEqual(44)
        expect(m.burger.height).toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('the swap happens once, at 1024px, and tablets get the hamburger', async ({
    page,
  }) => {
    await page.goto('/')
    // Poll rather than read once: a resize lands asynchronously, and a single
    // read right after it can see the previous layout on a busy machine.
    const expectModeAt = async (width: number, mode: Mode) => {
      await page.setViewportSize({ width, height: 800 })
      await expect
        .poll(
          async () => {
            const m = await measure(page)
            return m.nav?.shown && m.cta?.shown ? 'desktop' : 'hamburger'
          },
          { message: `mode at ${width}px` },
        )
        .toBe(mode)
    }
    await expectModeAt(768, 'hamburger')
    await expectModeAt(834, 'hamburger')
    await expectModeAt(1023, 'hamburger')
    await expectModeAt(1024, 'desktop')
  })

  test('the open mobile menu closes when the window grows to desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 900, height: 800 })
    await page.goto('/')
    // Name the drawer: the cookie banner is also a role="dialog".
    const drawer = page.getByRole('dialog', { name: 'Site navigation' })
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(drawer).toBeVisible()

    await page.setViewportSize({ width: 1100, height: 800 })
    await expect(drawer).toHaveCount(0)
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: 'Contact',
      }),
    ).toBeVisible()
  })

  test('browser text size 200%: the bar still has one working navigation', async ({
    page,
  }) => {
    // Every header dimension is in rem, so a larger default font size scales
    // the whole bar. The swap moves with it; there is never zero navigation.
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.addInitScript(() => {
      document.documentElement.style.fontSize = '200%'
    })
    await page.goto('/')
    const m = await measure(page)
    if (!(m.nav && m.cta && m.burger)) throw new Error('header parts missing')
    expect(m.nav.shown || m.burger.shown).toBe(true)
    expect(m.scrollWidth).toBeLessThanOrEqual(m.viewport)
  })
})
