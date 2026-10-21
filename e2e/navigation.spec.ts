import { expect, test } from '@playwright/test'
import { recordedSizes, startSizeRecording } from './helpers'

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

  test('grows out of the hamburger into a floating glass panel', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const burger = await page
      .getByRole('button', { name: 'Open menu' })
      .boundingBox()
    await startSizeRecording(page, '[data-slot="menu-panel"]')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1200)
    const sizes = await recordedSizes(page)
    const [firstWidth, firstRight] = sizes[0]
    const [restWidth, restRight] = sizes.at(-1) as [number, number]
    // Starts tiny, beside the hamburger, and ends at full size.
    expect(firstWidth).toBeLessThan(restWidth * 0.25)
    expect(
      Math.abs(firstRight - ((burger?.x ?? 0) + (burger?.width ?? 0))),
    ).toBeLessThan(24)
    expect(restWidth).toBeGreaterThan(250)
    // Translucent: it is the frosted glass surface, not an opaque sheet.
    await expect(page.locator('[data-slot="menu-panel"]')).toHaveClass(/glass/)
    expect(restRight).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0)
  })

  test('closes by shrinking back into the hamburger, then unmounts', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1000)
    await startSizeRecording(page, '[data-slot="menu-panel"]')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
    const sizes = await recordedSizes(page)
    const [startWidth] = sizes[0]
    const [endWidth] = sizes.at(-1) as [number, number]
    expect(endWidth).toBeLessThan(startWidth * 0.25) // shrank into the button
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
