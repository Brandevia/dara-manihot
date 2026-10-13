import { expect, test } from '@playwright/test'
import { recordedLefts, startRecording } from './helpers'

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

  test('slides in from the right and overshoots (bounce), then settles flush to the edge', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await startRecording(page, '[data-slot="sheet-content"]')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1200)
    const lefts = await recordedLefts(page)
    const rest = lefts.at(-1) as number
    expect(lefts[0]).toBeGreaterThan(rest + 100) // started off to the right
    expect(Math.min(...lefts)).toBeLessThan(rest - 5) // overshot past rest
    const right = await page
      .locator('[data-slot="sheet-content"]')
      .evaluate((e) => e.getBoundingClientRect().right)
    expect(Math.round(right)).toBe(page.viewportSize()?.width)
  })

  test('bounces out too: small anticipation, then exits and unmounts', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1000)
    await startRecording(page, '[data-slot="sheet-content"]')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
    const lefts = await recordedLefts(page)
    expect(Math.min(...lefts)).toBeLessThan(lefts[0] - 3) // anticipation
    expect(Math.max(...lefts)).toBeGreaterThan(page.viewportSize()!.width) // left the screen
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0)
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
          () =>
            !!document.activeElement?.closest('[data-slot="sheet-content"]'),
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
