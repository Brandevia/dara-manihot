import { expect, type Page, test } from '@playwright/test'
import { chooseService, selectedService } from './helpers'

/**
 * Scope 4.5, 4.6 and 4.2 in a real browser, on both the desktop and mobile
 * projects. The Playwright-launched server runs with MAIL_DRIVER=json, so the
 * whole pipeline (form, API, templates, both emails) runs without SMTP.
 *
 * The form's timing trap rejects anything submitted in under 3 seconds, so the
 * tests wait like a person would before the one real submission.
 */

const HUMAN_PAUSE_MS = 3_200

/**
 * The API limits each client IP to 5 enquiries an hour, and every test here
 * comes from 127.0.0.1. Each test that submits therefore presents its own
 * address, the way real visitors do behind a proxy.
 */
const uniqueIp = () =>
  `198.51.100.${Math.floor(Math.random() * 254) + 1}, 10.0.0.${Math.floor(Math.random() * 254) + 1}`
const asVisitor = () => ({ 'x-forwarded-for': uniqueIp() })

// The contact page also has a "Copy email address" button, so labels alone
// are ambiguous; the form fields have stable ids.
const field = (page: Page, name: string) => page.locator(`#enquiry-${name}`)

async function fillForm(page: Page) {
  await field(page, 'name').fill('Ada Okafor')
  await field(page, 'email').fill('ada@example.com')
  await field(page, 'phone').fill('+234 802 340 0557')
  await chooseService(page, 'solar-renewables')
  await page
    .getByLabel(/how can we help/i)
    .fill('We would like a solar quote for our cassava mill.')
}

test.describe('enquiry form', () => {
  test('a visitor can submit an enquiry and sees a confirmation', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders(asVisitor())
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await fillForm(page)
    await page.waitForTimeout(HUMAN_PAUSE_MS)

    const [response] = await Promise.all([
      page.waitForResponse('**/api/enquiry'),
      page.getByRole('button', { name: /send enquiry/i }).click(),
    ])
    expect(response.status()).toBe(200)

    const success = page.getByTestId('enquiry-success')
    await expect(success).toBeVisible()
    await expect(success).toContainText('ada@example.com')
    await expect(page.getByTestId('enquiry-reference')).toHaveText(
      /^DM-\d{6}-[A-Z2-9]{4}$/,
    )
    await expect(success).toBeFocused()
  })

  test('shows validation errors and sends nothing when the form is empty', async ({
    page,
  }) => {
    let apiCalls = 0
    await page.route('**/api/enquiry', (route) => {
      apiCalls++
      return route.abort()
    })
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /send enquiry/i }).click()

    await expect(page.getByText(/please enter your name/i)).toBeVisible()
    await expect(
      page.getByText(/valid|enter your email/i).first(),
    ).toBeVisible()
    await expect(page.getByText(/please choose a service/i)).toBeVisible()
    await expect(field(page, 'name')).toBeFocused()
    expect(apiCalls).toBe(0)
  })

  test('rejects a malformed email in the browser', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await fillForm(page)
    await field(page, 'email').fill('not-an-email')
    await page.getByRole('button', { name: /send enquiry/i }).click()
    await expect(page.getByText(/valid email address/i)).toBeVisible()
    await expect(field(page, 'email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('keeps what was typed and offers direct contact when the server fails', async ({
    page,
  }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Mail server is down.' }),
      }),
    )
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await fillForm(page)
    await page.getByRole('button', { name: /send enquiry/i }).click()

    // Scoped to the form: Next's route announcer is also role=alert.
    const alert = page
      .getByRole('form', { name: /enquiry form/i })
      .getByRole('alert')
    await expect(alert).toContainText('Mail server is down.')
    await expect(alert.locator('a[href^="mailto:"]')).toBeVisible()
    await expect(alert.locator('a[href^="tel:"]')).toBeVisible()
    await expect(field(page, 'name')).toHaveValue('Ada Okafor')
  })

  test('a deep link preselects the service', async ({ page }) => {
    await page.goto('/contact?service=green-hydrogen#enquiry')
    expect(await selectedService(page)).toBe('green-hydrogen')
  })

  test('"Enquire about this service" on /services lands on the form with that service chosen', async ({
    page,
  }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    await page
      .locator('#solar-renewables')
      .getByRole('link', { name: /enquire about this service/i })
      .click()
    await expect(page).toHaveURL(/\/contact\?service=solar-renewables#enquiry/)
    expect(await selectedService(page)).toBe('solar-renewables')
  })

  test('the honeypot is invisible and unreachable by keyboard', async ({
    page,
  }) => {
    await page.goto('/contact')
    const trap = page.locator('input[name="companyWebsite"]')
    await expect(trap).toHaveAttribute('tabindex', '-1')
    const box = await trap.boundingBox()
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThan(0)
  })
})

test.describe('enquiry form: mobile usability (scope 4.4)', () => {
  test.use({ viewport: { width: 360, height: 800 } })

  test('fields and button are comfortable touch targets', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    for (const name of ['name', 'email', 'phone', 'service']) {
      const box = await field(page, name).boundingBox()
      expect(box?.height, name).toBeGreaterThanOrEqual(44)
    }
    const button = await page
      .getByRole('button', { name: /send enquiry/i })
      .boundingBox()
    expect(button?.height).toBeGreaterThanOrEqual(44)
  })

  test('field text is 16px or larger so iOS does not zoom the page', async ({
    page,
  }) => {
    await page.goto('/contact')
    for (const name of ['name', 'email', 'message']) {
      const size = await field(page, name).evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).fontSize),
      )
      expect(size).toBeGreaterThanOrEqual(16)
    }
  })

  test('the page still does not scroll sideways with every error showing', async ({
    page,
  }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /send enquiry/i }).click()
    await expect(page.getByText(/please enter your name/i)).toBeVisible()
    const [scrollW, clientW] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ])
    expect(scrollW).toBeLessThanOrEqual(clientW)
  })
})

test.describe('POST /api/enquiry', () => {
  test('validates once past the bot checks', async ({ request }) => {
    const res = await request.post('/api/enquiry', {
      headers: asVisitor(),
      data: {
        name: '',
        email: 'x',
        service: '',
        message: '',
        startedAt: Date.now() - 10_000,
      },
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(Object.keys(body.errors).sort()).toEqual([
      'email',
      'message',
      'name',
      'service',
    ])
  })

  test('rate limits one address after five enquiries, but not other visitors', async ({
    request,
  }) => {
    const headers = asVisitor()
    const data = {
      name: 'Ada Okafor',
      email: 'ada@example.com',
      service: 'general',
      message: 'A real enough message to pass validation.',
      startedAt: Date.now() - 10_000,
    }
    for (let i = 0; i < 5; i++) {
      const ok = await request.post('/api/enquiry', { headers, data })
      expect(ok.status(), `request ${i + 1}`).toBe(200)
    }
    const blocked = await request.post('/api/enquiry', { headers, data })
    expect(blocked.status()).toBe(429)
    expect(Number(blocked.headers()['retry-after'])).toBeGreaterThan(0)

    const other = await request.post('/api/enquiry', {
      headers: asVisitor(),
      data,
    })
    expect(other.status()).toBe(200)
  })

  test('refuses a cross origin post', async ({ request }) => {
    const res = await request.post('/api/enquiry', {
      headers: { origin: 'https://evil.example' },
      data: {},
    })
    expect(res.status()).toBe(403)
  })

  test('refuses non JSON bodies and other methods', async ({ request }) => {
    const text = await request.post('/api/enquiry', {
      headers: { 'content-type': 'text/plain' },
      data: 'hello',
    })
    expect(text.status()).toBe(415)
    expect((await request.get('/api/enquiry')).status()).toBe(405)
  })
})

test.describe('sustainable energy positioning (scope 4.2)', () => {
  test('the home page shows agriculture and energy as equals', async ({
    page,
  }) => {
    await page.goto('/')
    const hero = page.getByRole('list', { name: /what we do/i })
    await expect(hero).toContainText('Sustainable Agriculture')
    await expect(hero).toContainText('Sustainable Energy')

    const section = page
      .locator('#pillars-title')
      .locator('xpath=ancestor::section')
    await expect(section.getByRole('heading', { level: 3 })).toHaveText([
      'Sustainable Agriculture',
      'Sustainable Energy',
    ])
  })

  test('the services page has a section per pillar with working jump links', async ({
    page,
  }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    for (const id of ['sustainable-agriculture', 'sustainable-energy']) {
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
    await page
      .getByRole('navigation', { name: /service areas/i })
      .getByRole('link', { name: /sustainable energy/i })
      .click()
    await expect(page).toHaveURL(/#sustainable-energy$/)
    await expect(page.locator('#solar-renewables')).toBeVisible()
  })
})

test.describe('images (scope 4.3)', () => {
  test('no page shows a broken image', async ({ page }) => {
    for (const path of ['/', '/about', '/services', '/projects', '/contact']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((r) => setTimeout(r, 300))
      })
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.src),
      )
      expect(broken, path).toEqual([])
    }
  })
})

test.describe('service dropdown', () => {
  test('desktop: a styled listbox, grouped, that opens over the card without being clipped', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'phones keep the native picker')
    await page.goto('/contact#enquiry')
    await page.waitForLoadState('networkidle')
    const control = field(page, 'service')
    await expect(control).toHaveAttribute('role', 'combobox')

    await control.click()
    const list = page.getByRole('listbox')
    await expect(list).toBeVisible()
    await expect(control).toHaveAttribute('aria-expanded', 'true')
    for (const group of [
      'General',
      'Sustainable Agriculture',
      'Sustainable Energy',
    ])
      await expect(list.getByText(group, { exact: true })).toBeVisible()

    // Wait out the unfold, then check what is really on top at each row's
    // centre: if the card clipped the list, the hit would be something else.
    await page.waitForTimeout(500)
    const rows = list.getByRole('option')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(7)
    const first = await rows.first().boundingBox()
    expect(first).not.toBeNull()
    const onTop = await rows.first().evaluate((el) => {
      const r = el.getBoundingClientRect()
      const hit = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      )
      return el.contains(hit)
    })
    expect(onTop).toBe(true)
  })

  test('desktop: mouse, keyboard, Escape and outside click', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'phones keep the native picker')
    await page.goto('/contact#enquiry')
    await page.waitForLoadState('networkidle')
    const control = field(page, 'service')

    await control.click()
    await page.getByRole('option', { name: /green hydrogen/i }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(control).toContainText(/green hydrogen/i)
    await expect(control).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(control).toContainText(/green hydrogen/i)

    await control.click()
    await page.getByRole('heading', { name: /send us an enquiry/i }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
  })

  test('desktop: choosing a service clears its error', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'phones keep the native picker')
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /send enquiry/i }).click()
    await expect(page.getByText(/please choose a service/i)).toBeVisible()
    await chooseService(page, 'general')
    await expect(page.getByText(/please choose a service/i)).toBeHidden()
  })

  test('phones: keep the native picker, which is easiest to use on a touch screen', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'desktop gets the styled listbox')
    await page.goto('/contact#enquiry')
    await page.waitForLoadState('networkidle')
    await expect(field(page, 'service')).toHaveJSProperty('tagName', 'SELECT')
    await expect(page.getByRole('listbox')).toHaveCount(0)
  })
})

test.describe('home: who we are', () => {
  test('tiles lift and cast a shadow on hover (mouse only)', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'hover does not apply to touch')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const tile = page.locator('[data-tile]').first()
    await tile.scrollIntoViewIfNeeded()
    const before = await tile.evaluate((el) => getComputedStyle(el).boxShadow)
    await tile.hover()
    await expect
      .poll(() => tile.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe(before)
    // Tailwind v4 lifts with the individual `translate` property.
    await expect
      .poll(() => tile.evaluate((el) => getComputedStyle(el).translate))
      .not.toBe('none')
    // ...and it must be inside the transition, or the lift would just snap.
    expect(
      await tile.evaluate((el) => getComputedStyle(el).transitionProperty),
    ).toContain('translate')
  })

  test('the heading and statement are large and bold at every width', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const heading = page.getByRole('heading', { name: 'Who we are' })
    const size = (loc: typeof heading) =>
      loc.evaluate((el) => {
        const s = getComputedStyle(el)
        return {
          px: Number.parseFloat(s.fontSize),
          weight: Number(s.fontWeight),
        }
      })
    const h = await size(heading)
    expect(h.weight).toBeGreaterThanOrEqual(700)
    expect(h.px).toBeGreaterThanOrEqual(24)
    const statement = page.getByText(/leading Nigerian enterprise/)
    const p = await size(statement)
    expect(p.weight).toBeGreaterThanOrEqual(600)
    expect(p.px).toBeGreaterThanOrEqual(22)
  })
})
