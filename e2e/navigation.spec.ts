import { expect, test } from '@playwright/test'
import { recordedRects, startRectRecording } from './helpers'

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

  test('drops down from the header pill into a glass panel as wide as it', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const pill = await page.locator('header > div').first().boundingBox()
    await startRectRecording(page, '[data-slot="menu-panel"]')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1200)
    const rects = await recordedRects(page)
    const first = rects[0]
    const rest = rects.at(-1)
    if (!(first && rest && pill)) throw new Error('no samples')
    // Starts flat, directly under the pill, and grows downward to full height.
    expect(first.height).toBeLessThan(rest.height * 0.25)
    expect(rest.height).toBeGreaterThan(200)
    expect(first.top).toBeGreaterThanOrEqual(pill.y + pill.height)
    // The top edge never moves: it expands down, it does not slide.
    expect(Math.abs(rest.top - first.top)).toBeLessThan(2)
    // Same side margins as the pill, so the two read as one unit.
    expect(Math.abs(rest.left - pill.x)).toBeLessThan(2)
    expect(Math.abs(rest.width - pill.width)).toBeLessThan(2)
    await expect(page.locator('[data-slot="menu-panel"]')).toHaveClass(/glass/)
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
          const m = new DOMMatrix(getComputedStyle(el).transform)
          return Math.round(Math.atan2(m.b, m.a) * (180 / Math.PI))
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
      const t0 = performance.now()
      const tick = () => {
        for (const li of document.querySelectorAll(
          '[data-slot="menu-panel"] li',
        ))
          if (Number(getComputedStyle(li).opacity) > 0.5) {
            const key = li.textContent ?? ''
            w.__seen ??= {}
            w.__seen[key] ??= performance.now() - t0
          }
        if (performance.now() - t0 < 1500) requestAnimationFrame(tick)
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

  test('closes by folding up under the pill, then unmounts', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1000)
    await startRectRecording(page, '[data-slot="menu-panel"]')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
    const rects = await recordedRects(page)
    const start = rects[0]
    const end = rects.at(-1)
    if (!(start && end)) throw new Error('no samples')
    expect(end.height).toBeLessThan(start.height * 0.25) // collapsed upward
    expect(Math.abs(end.top - start.top)).toBeLessThan(2) // top edge fixed
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
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Projects' })
      .click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
