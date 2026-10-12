import { expect, test } from '@playwright/test'

const PAGES = [
  '/',
  '/about',
  '/services',
  '/projects',
  '/contact',
  '/privacy',
  '/terms',
]

for (const path of PAGES) {
  test.describe(path, () => {
    test('renders without console errors, with a title and one h1', async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveTitle(/Dara-Manihot/)
      await expect(page.locator('h1')).toHaveCount(1)
      expect(errors).toEqual([])
    })

    test('does not scroll sideways at 360px (regression: 481px wide home page)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const [scrollW, clientW] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ])
      expect(scrollW).toBeLessThanOrEqual(clientW)
    })

    test('content starts directly under the header (regression: 160px header over 64px offset)', async ({
      page,
    }) => {
      await page.goto(path)
      const header = await page.locator('header').boundingBox()
      const main = await page.locator('main').boundingBox()
      expect(header?.height).toBe(72)
      expect(Math.round(main?.y ?? -1)).toBe(72)
    })
  })
}

test('header height is unchanged by scrolling (no layout shift)', async ({
  page,
}) => {
  await page.goto('/about')
  const before = (await page.locator('header').boundingBox())?.height
  await page.mouse.wheel(0, 1200)
  await expect(page.locator('header')).toHaveAttribute('data-scrolled', 'true')
  expect((await page.locator('header').boundingBox())?.height).toBe(before)
})

test('every CTA button uses the secondary colour token', async ({ page }) => {
  await page.goto('/')
  const secondary = await page.evaluate(() => {
    const probe = document.createElement('i')
    probe.style.color = 'var(--secondary)'
    document.body.append(probe)
    const c = getComputedStyle(probe).color
    probe.remove()
    return c
  })
  const ctas = page
    .getByRole('link', { name: /explore our services|get in touch/i })
    .filter({ has: page.locator('svg') })
  expect(await ctas.count()).toBeGreaterThan(0)
  for (const cta of await ctas.all()) {
    if (!(await cta.isVisible())) continue
    expect(await cta.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
      secondary,
    )
  }
})
