import { expect, test } from '@playwright/test'

const active = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLImageElement>(
        'section[aria-roledescription=carousel] img',
      ),
    ].findIndex((i) => i.dataset.active === 'true'),
  )

test('hero is an image carousel under the green gradient', async ({ page }) => {
  await page.goto('/')
  const slides = page.locator('section[aria-roledescription=carousel] img')
  expect(await slides.count()).toBeGreaterThanOrEqual(2)
  const gradient = await page
    .locator('.bg-hero-gradient')
    .first()
    .evaluate((e) => getComputedStyle(e).backgroundImage)
  expect(gradient).toContain('linear-gradient')
})

test('autoplays through the slides, pauses, and resumes', async ({ page }) => {
  test.slow()
  await page.goto('/')
  expect(await active(page)).toBe(0)
  await expect.poll(() => active(page), { timeout: 10_000 }).toBe(1)
  await page.getByRole('button', { name: 'Pause slideshow' }).click()
  const held = await active(page)
  await page.waitForTimeout(7500)
  expect(await active(page)).toBe(held)
  await page.getByRole('button', { name: 'Play slideshow' }).click()
  await expect.poll(() => active(page), { timeout: 10_000 }).not.toBe(held)
})

test('indicators and arrows change the slide', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /show slide 3/i }).click()
  expect(await active(page)).toBe(2)
  await page.getByRole('button', { name: 'Next slide' }).click()
  expect(await active(page)).toBe(3)
  await page.getByRole('button', { name: 'Next slide' }).click()
  expect(await active(page)).toBe(0)
})

test.describe('prefers-reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })
  test('does not auto-advance', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: 'Play slideshow' }),
    ).toBeVisible()
    await page.waitForTimeout(8000)
    expect(await active(page)).toBe(0)
  })
})
