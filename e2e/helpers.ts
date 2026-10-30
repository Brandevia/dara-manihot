import type { Page } from '@playwright/test'

export interface RectSample {
  top: number
  left: number
  right: number
  width: number
  height: number
}

/** Starts sampling `selector`'s box every frame for ~1.1s. */
export async function startRectRecording(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as Window & { __rects?: RectSample[] }
    w.__rects = []
    const t0 = performance.now()
    const tick = () => {
      const r = document.querySelector(sel)?.getBoundingClientRect()
      if (r)
        w.__rects?.push({
          top: r.top,
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
        })
      if (performance.now() - t0 < 1100) requestAnimationFrame(tick)
    }
    tick()
  }, selector)
}

/** The boxes recorded while the element existed, oldest first. */
export async function recordedRects(page: Page): Promise<RectSample[]> {
  return page.evaluate(
    () => (window as Window & { __rects?: RectSample[] }).__rects ?? [],
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
