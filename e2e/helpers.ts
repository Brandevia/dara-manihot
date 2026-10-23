import type { Page } from '@playwright/test'

/** Starts sampling `selector`'s width and right edge every frame for ~1.1s. */
export async function startSizeRecording(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as Window & { __sizes?: [number, number][] }
    w.__sizes = []
    const t0 = performance.now()
    const tick = () => {
      const r = document.querySelector(sel)?.getBoundingClientRect()
      if (r) w.__sizes?.push([r.width, r.right])
      if (performance.now() - t0 < 1100) requestAnimationFrame(tick)
    }
    tick()
  }, selector)
}

/** [width, right] pairs recorded while the element existed. */
export async function recordedSizes(page: Page): Promise<[number, number][]> {
  return page.evaluate(
    () => (window as Window & { __sizes?: [number, number][] }).__sizes ?? [],
  )
}

/**
 * Picks a service in the enquiry form, whichever control the browser got:
 * the phone's native <select> on touch devices, or the styled listbox with a
 * mouse. (A visitor does the same: tap the field, then tap the option.)
 */
export async function chooseService(page: Page, value: string) {
  const control = page.locator('#enquiry-service')
  if ((await control.evaluate((el) => el.tagName)) === 'SELECT') {
    await control.selectOption(value)
    return
  }
  await control.click()
  await page.locator(`[role="option"][data-value="${value}"]`).click()
}

/** The chosen service's value, read from whichever control is on the page. */
export async function selectedService(page: Page): Promise<string> {
  return page.locator('#enquiry-service').evaluate((el) => {
    if (el instanceof HTMLSelectElement) return el.value
    return el.getAttribute('data-value') ?? ''
  })
}
