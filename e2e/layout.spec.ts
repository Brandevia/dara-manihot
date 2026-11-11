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

    test('the first heading clears the fixed header (nothing is covered by it)', async ({
      page,
    }) => {
      await page.goto(path)
      const header = await page.locator('header').boundingBox()
      const h1 = await page.locator('h1').boundingBox()
      // 4.5rem at the default 16px root font size.
      expect(header?.height).toBe(72)
      expect(header?.y).toBe(0)
      expect(h1?.y ?? -1).toBeGreaterThanOrEqual(72)
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

test('the bar is solid at rest and gains a shadow once scrolled', async ({
  page,
}) => {
  await page.goto('/about')
  const style = () =>
    page.locator('header').evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, shadow: cs.boxShadow }
    })
  const rest = await style()
  // Opaque: no alpha channel, no translucent glass.
  expect(rest.bg).toMatch(/^rgb\(/)
  expect(rest.shadow).toBe('none')
  await page.mouse.wheel(0, 1200)
  await expect(page.locator('header')).toHaveAttribute('data-scrolled', 'true')
  await expect.poll(async () => (await style()).shadow).not.toBe('none')
  expect((await style()).bg).toBe(rest.bg)
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
