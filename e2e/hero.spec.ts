import { expect, test } from '@playwright/test'

// These tests are about the carousel, not cookies: record a choice up front so
// the cookie banner (fixed to the bottom of a phone screen) is out of the way.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'dm-cookie-consent',
      JSON.stringify({ v: 1, choice: 'declined', at: new Date().toISOString() }),
    )
  })
})

const active = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLImageElement>(
        'section[aria-roledescription=carousel] img',
      ),
    ].findIndex((i) => i.dataset.active === 'true'),
  )

test('hero is an image carousel with the green gradient over the photos', async ({
  page,
}) => {
  await page.goto('/')
  const carousel = page.locator('section[aria-roledescription=carousel]')
  expect(await carousel.locator('img').count()).toBeGreaterThanOrEqual(2)
  // Both gradient layers paint a background image over the pictures.
  for (const cls of ['bg-hero-gradient', 'bg-hero-gradient-bottom']) {
    const image = await carousel
      .locator(`.${cls}`)
      .evaluate((e) => getComputedStyle(e).backgroundImage)
    expect(image, cls).toContain('linear-gradient')
  }
})

test('hero text carries the photo legibility shadow', async ({ page }) => {
  await page.goto('/')
  const shadow = await page
    .locator('#home-hero-title')
    .evaluate((e) => getComputedStyle(e).textShadow)
  expect(shadow).not.toBe('none')
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
