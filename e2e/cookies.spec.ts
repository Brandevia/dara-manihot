import { expect, test } from '@playwright/test'

test.describe('cookie consent and the office map', () => {
  test('first visit asks, accepting loads the map with no extra click', async ({
    page,
  }) => {
    await page.goto('/contact')
    const banner = page.getByRole('dialog', { name: 'Cookie preferences' })
    await expect(banner).toBeVisible()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(0)

    await banner.getByRole('button', { name: 'Accept all' }).click()
    await expect(banner).toBeHidden()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(1)
    expect(await page.context().cookies()).toEqual([])
  })

  test('the switches: essential is locked on, non-essential is off and explains itself when turned on', async ({ page }) => {
    await page.goto('/contact')
    const banner = page.getByRole('dialog', { name: 'Cookie preferences' })
    await expect(banner.getByRole('switch', { name: 'Essential', exact: true })).toBeDisabled()
    const optional = banner.getByRole('switch', { name: 'Non-essential' })
    await expect(optional).toHaveAttribute('aria-checked', 'false')
    await expect(banner.getByText(/Google receives your IP address/)).toHaveCount(0)

    await optional.click()
    await expect(optional).toHaveAttribute('aria-checked', 'true')
    await expect(banner.getByText(/Google receives your IP address/)).toBeVisible()

    await banner.getByRole('button', { name: 'Save choices' }).click()
    await expect(banner).toBeHidden()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(1)
  })

  test('the choice is remembered across reloads and pages', async ({
    page,
  }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Accept all' }).click()
    await page.reload()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(1)
    await page.goto('/about')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('declining keeps Google out and the footer reopens the choice', async ({
    page,
  }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Reject non-essential' }).click()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: /get directions/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Cookie settings' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(1)
  })

  test('withdrawing consent removes the map', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(1)
    await page.getByRole('button', { name: 'Cookie settings' }).click()
    await expect(page.locator('[data-office-map] iframe')).toHaveCount(0)
  })
})
