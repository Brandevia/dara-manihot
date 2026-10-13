import { expect, test } from '@playwright/test'

test('back-to-top: hidden at the top, appears after scrolling, returns to the top', async ({
  page,
}) => {
  await page.goto('/about')
  const btn = page.getByRole('button', { name: 'Back to top' })
  await expect(btn).toHaveCount(0)
  await page.mouse.wheel(0, 1500)
  await expect(btn).toBeVisible()
  await btn.click()
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 })
    .toBe(0)
  await expect(btn).toHaveCount(0)
})

test('humans.txt is served as plain text with the developer details', async ({
  request,
}) => {
  const res = await request.get('/humans.txt')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/plain')
  const body = await res.text()
  expect(body).toContain('Sodeke Pamilerin')
  expect(body).toContain('github.com/PRAIZZZ-08')
})

test('head links to humans.txt as the author', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="author"]')).toHaveAttribute(
    'href',
    '/humans.txt',
  )
})

for (const [path, heading] of [
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
] as const) {
  test(`${path} renders and its contents links jump to sections`, async ({
    page,
  }) => {
    await page.goto(path)
    await expect(
      page.getByRole('heading', { level: 1, name: heading }),
    ).toBeVisible()
    const first = page.locator('article section').nth(2)
    const id = await first.getAttribute('id')
    await page.evaluate((i) => {
      location.hash = `#${i}`
    }, id)
    await expect(first).toBeInViewport()
    // The sticky header must not cover the section heading it jumped to.
    const top = (await first.locator('h2').boundingBox())?.y ?? 0
    expect(top).toBeGreaterThanOrEqual(72)
  })
}

test('footer legal links work', async ({ page }) => {
  await page.goto('/')
  for (const [name, url] of [
    ['Privacy Policy', /\/privacy$/],
    ['Terms of Service', /\/terms$/],
  ] as const) {
    await page.locator('footer').getByRole('link', { name }).click()
    await expect(page).toHaveURL(url)
    await page.goto('/')
  }
})

test('footer service links deep-link to the service card', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('footer')
    .getByRole('link', { name: 'Green Hydrogen Production' })
    .click()
  await expect(page).toHaveURL(/\/services#green-hydrogen$/)
  await expect(page.locator('#green-hydrogen')).toBeInViewport()
})

test('unknown routes show the styled 404', async ({ page }) => {
  const res = await page.goto('/definitely-not-here')
  expect(res?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: /doesn.t exist/i }),
  ).toBeVisible()
})

test('contact: copy button copies the email', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'clipboard permission API is chromium-only',
  )
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'copied' }),
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'info@daramanihot.com.ng',
  )
})
