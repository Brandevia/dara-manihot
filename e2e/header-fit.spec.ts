import { expect, type Page, test } from '@playwright/test'

/**
 * Regression: between 768px and ~950px the desktop header needs a ~895px
 * pill but the page only offers `viewport - 2 * --container-pad`. Nothing
 * inside the pill can shrink, so the "Get in touch" CTA spilled out of the
 * pill and off the right edge of the screen.
 *
 * The fix moves the hamburger -> desktop swap from `md` (48rem) to `lg`
 * (64rem). These tests measure the real rendered geometry, so they also catch
 * the next time a nav link, label or gap makes the desktop layout wider.
 */

// Widths chosen for a reason: the iPad portrait set (768/810/820/834), the
// reported screenshot (884), the old failure edges (950/951/959), both sides of
// the swap (1023/1024) and common laptop/desktop sizes.
const WIDTHS = [
  320, 360, 412, 700, 767, 768, 810, 820, 834, 884, 900, 950, 951, 959, 960,
  1000, 1023, 1024, 1100, 1280, 1440, 1920,
]

type Mode = 'desktop' | 'hamburger'

async function measure(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector('header')
    const pill = header?.querySelector(':scope > div')
    if (!header || !pill) throw new Error('header pill not found')
    const rect = (el: Element | null | undefined) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      const shown = getComputedStyle(el).display !== 'none' && b.width > 0
      return { left: b.left, right: b.right, shown }
    }
    const cta = [...header.querySelectorAll('a[data-slot="button"]')].find(
      (a) => a.getAttribute('href') === '/contact',
    )
    return {
      viewport: document.documentElement.clientWidth,
      padRight: Number.parseFloat(getComputedStyle(pill).paddingRight),
      pill: rect(pill),
      cta: rect(cta),
      nav: rect(header.querySelector('nav[aria-label="Main"]')),
      burger: rect(header.querySelector('button[aria-label$="menu"]')),
    }
  })
}

test.describe('header fits at every viewport width', () => {
  test.skip(({ isMobile }) => isMobile, 'width is set explicitly below')

  for (const width of WIDTHS) {
    test(`${width}px: one navigation mode, nothing clipped or overflowing`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const m = await measure(page)
      if (!(m.pill && m.cta && m.nav && m.burger))
        throw new Error('header parts missing')

      const mode: Mode = m.nav.shown && m.cta.shown ? 'desktop' : 'hamburger'

      // The pill is always fully on screen.
      expect(m.pill.left).toBeGreaterThanOrEqual(0)
      expect(m.pill.right).toBeLessThanOrEqual(m.viewport + 0.5)

      if (mode === 'desktop') {
        // Never both navigations at once.
        expect(m.burger.shown).toBe(false)
        // The CTA sits inside the pill with its right padding intact.
        expect(m.cta.right + m.padRight).toBeLessThanOrEqual(m.pill.right + 0.5)
        expect(m.cta.right).toBeLessThanOrEqual(m.viewport)
      } else {
        // Never zero navigations: the hamburger must be the way in.
        expect(m.burger.shown).toBe(true)
        expect(m.burger.right).toBeLessThanOrEqual(m.pill.right + 0.5)
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
})
