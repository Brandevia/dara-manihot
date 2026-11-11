import { expect, test } from '@playwright/test'
import {
  recordedClips,
  recordedRects,
  startClipRecording,
  startRectRecording,
} from './helpers'

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('shows all links, hides the hamburger, and marks the current page', async ({
    page,
  }) => {
    await page.goto('/services')
    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const name of ['Home', 'About', 'Services', 'Projects', 'Contact'])
      await expect(nav.getByRole('link', { name })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Services' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden()
  })

  test('shows the logo image, linking home', async ({ page }) => {
    await page.goto('/about')
    const home = page
      .locator('header')
      .getByRole('link', { name: 'Dara-Manihot home' })
    await expect(home).toHaveAttribute('href', '/')
    const logo = home.locator('img')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveAttribute('src', /logo\.png/)
    // Pressing it goes home.
    await home.click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('puts links and the call to action on the trailing edge, after the logo', async ({
    page,
  }) => {
    await page.goto('/')
    const logo = await page
      .locator('header a[aria-label$="home"]')
      .boundingBox()
    const nav = await page
      .getByRole('navigation', { name: 'Main' })
      .boundingBox()
    const cta = await page
      .locator('header a[data-slot="button"][href="/contact"]')
      .boundingBox()
    const vw = page.viewportSize()?.width ?? 0
    if (!(logo && nav && cta)) throw new Error('header parts missing')
    expect(logo.x + logo.width).toBeLessThan(nav.x)
    expect(nav.x + nav.width).toBeLessThan(cta.x)
    // The button is in the right half; the logo in the left half.
    expect(cta.x).toBeGreaterThan(vw / 2)
    expect(logo.x).toBeLessThan(vw / 2)
  })

  test('navigates between pages', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About' })
      .click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'About' }),
    ).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('mobile drawer', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only')

  test('hamburger sits on the right, desktop nav is hidden', async ({
    page,
  }) => {
    await page.goto('/')
    const burger = page.getByRole('button', { name: 'Open menu' })
    const box = await burger.boundingBox()
    const vw = page.viewportSize()?.width ?? 0
    expect(box && box.x + box.width / 2).toBeGreaterThan(vw / 2)
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden()
  })

  test('unrolls from the bottom edge of the header bar, full width, without reflowing', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const bar = await page.locator('header').boundingBox()
    await startRectRecording(page, '[data-slot="menu-panel"]')
    await startClipRecording(page, '[data-slot="menu-panel"]')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1200)
    const rects = await recordedRects(page)
    const clips = await recordedClips(page)
    const first = rects[0]
    const last = rects.at(-1)
    if (!(first && last && bar)) throw new Error('no samples')
    const vw = page.viewportSize()?.width ?? 0

    // Flush under the bar, edge to edge: no floating gap, no side margins.
    expect(Math.abs(first.top - (bar.y + bar.height))).toBeLessThan(1)
    expect(Math.abs(last.left)).toBeLessThan(1)
    expect(Math.abs(last.width - vw)).toBeLessThan(1)
    expect(last.height).toBeGreaterThan(200)
    // The box itself never moves or resizes: only the clip reveals it, so
    // nothing reflows (GPU-only, no `height` animation).
    expect(Math.abs(last.top - first.top)).toBeLessThan(1)
    expect(Math.abs(last.height - first.height)).toBeLessThan(1)
    // The reveal: starts folded away, ends fully shown, never goes backwards.
    expect(clips[0]).toBeGreaterThan(80)
    expect(clips.at(-1)).toBeLessThan(1)
    expect(clips).toEqual([...clips].sort((a, b) => b - a))
    await expect(page.locator('[data-slot="menu-panel"]')).not.toHaveClass(
      /glass/,
    )
  })

  test('the links start on the logo edge', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(700)
    const logo = await page
      .locator('header a[aria-label$="home"]')
      .boundingBox()
    const link = dialog.getByRole('link', { name: 'About' })
    const box = await link.boundingBox()
    const pad = await link.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).paddingLeft),
    )
    if (!(logo && box)) throw new Error('no boxes')
    // Text (link box + its own padding) meets the logo's leading edge.
    expect(Math.abs(box.x + pad - logo.x)).toBeLessThan(2)
  })

  test('the bar stays put and pressable while the menu is open', async ({
    page,
  }) => {
    await page.goto('/')
    const before = await page.locator('header').boundingBox()
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Site navigation' }),
    ).toBeVisible()
    const during = await page.locator('header').boundingBox()
    expect(during).toEqual(before)
    // Nothing from the page scrim sits over the bar.
    const hit = await page.evaluate(() => {
      const t = document.querySelector('header button[aria-expanded="true"]')
      if (!t) return null
      const r = t.getBoundingClientRect()
      return document
        .elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        ?.closest('button')
        ?.getAttribute('aria-expanded')
    })
    expect(hit).toBe('true')
  })

  test('the toggle is two lines that turn into an X', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    const bars = toggle.locator('span[aria-hidden] > span')
    await expect(bars).toHaveCount(2)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    const open = page.locator('button[aria-expanded="true"]')
    await expect(open).toHaveAttribute('aria-label', 'Close menu')
    await page.waitForTimeout(450)
    const angles = await open
      .locator('span[aria-hidden] > span')
      .evaluateAll((els) =>
        els.map((el) => {
          // Tailwind v4 sets the standalone `rotate` property, which leaves
          // `transform` as "none".
          const rotate = getComputedStyle(el).rotate
          return rotate === 'none' ? 0 : Math.round(Number.parseFloat(rotate))
        }),
      )
    expect(angles.map(Math.abs)).toEqual([45, 45])
    expect(angles[0]).toBe(-angles[1])
  })

  test('shows text links then a green call to action, and nothing else', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('svg')).toHaveCount(0)
    const cta = dialog.getByRole('link', { name: 'Explore Our Services' })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveCSS('background-color', 'rgb(31, 127, 49)')
  })

  test('the links feed in one after another, top to bottom', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => {
      const w = window as Window & { __seen?: Record<string, number> }
      w.__seen = {}
      const called = performance.now()
      // The clock starts when the panel first appears, so a slow click on a
      // busy machine cannot make the recording miss the animation.
      let t0: number | null = null
      const tick = () => {
        if (t0 === null && document.querySelector('[data-slot="menu-panel"]'))
          t0 = performance.now()
        if (t0 !== null)
          for (const li of document.querySelectorAll(
            '[data-slot="menu-panel"] li',
          ))
            if (Number(getComputedStyle(li).opacity) > 0.5) {
              const key = li.textContent ?? ''
              w.__seen ??= {}
              w.__seen[key] ??= performance.now() - (t0 as number)
            }
        const done =
          t0 === null
            ? performance.now() - called > 10_000
            : performance.now() - t0 > 1500
        if (!done) requestAnimationFrame(tick)
      }
      tick()
    })
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1600)
    const seen = await page.evaluate(
      () =>
        (window as Window & { __seen?: Record<string, number> }).__seen ?? {},
    )
    const times = Object.values(seen)
    expect(times.length).toBeGreaterThanOrEqual(4)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times.at(-1)).toBeGreaterThan(times[0])
  })

  test('pressing outside the panel closes it', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()
    const vh = page.viewportSize()?.height ?? 600
    await page.mouse.click(10, vh - 10)
    await expect(dialog).toHaveCount(0)
  })

  test('closes by folding up under the bar, then unmounts', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1000)
    await startRectRecording(page, '[data-slot="menu-panel"]')
    await startClipRecording(page, '[data-slot="menu-panel"]')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
    const rects = await recordedRects(page)
    const clips = await recordedClips(page)
    const start = rects[0]
    if (!start) throw new Error('no samples')
    // Folds up toward the bar: the clip closes from the bottom...
    expect(clips[0]).toBeLessThan(5)
    expect(Math.max(...clips)).toBeGreaterThan(60)
    // ...while the box and its top edge stay where they were.
    for (const r of rects) expect(Math.abs(r.top - start.top)).toBeLessThan(1)
    await expect(page.locator('[data-slot="menu-panel"]')).toHaveCount(0)
  })

  test('pressing the hamburger again closes the menu and it stays closed', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()
    // The same button, now an X. Radix hides it from the accessibility tree
    // while the dialog is open, so target it by its expanded state.
    await page.locator('button[aria-expanded="true"]').click()
    await expect(dialog).toHaveCount(0)
    await page.waitForTimeout(400)
    await expect(dialog).toHaveCount(0) // not swallowed and re-opened
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })

  test('traps focus, locks scroll, and returns focus to the hamburger', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(
        await page.evaluate(
          () => !!document.activeElement?.closest('[data-slot="menu-panel"]'),
        ),
      ).toBe(true)
    }
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
    ).toBe('hidden')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
  })

  test('choosing a page navigates and closes the drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    // Name the drawer: the cookie banner is also a role="dialog".
    const drawer = page.getByRole('dialog', { name: 'Site navigation' })
    await drawer.getByRole('link', { name: 'Projects' }).click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(drawer).toHaveCount(0)
  })
})
