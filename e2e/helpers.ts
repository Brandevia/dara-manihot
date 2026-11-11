import type { Page } from '@playwright/test'

export interface RectSample {
  top: number
  left: number
  right: number
  width: number
  height: number
}

/**
 * Starts sampling `selector`'s box every frame for ~1.1s. The window opens when
 * the element first appears (not when this is called), so a slow click or
 * hydration on a busy machine cannot make the recording miss it. Gives up
 * after 10s if the element never shows up.
 */
export async function startRectRecording(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as Window & { __rects?: RectSample[] }
    w.__rects = []
    const called = performance.now()
    let t0: number | null = null
    const tick = () => {
      const r = document.querySelector(sel)?.getBoundingClientRect()
      if (r) {
        t0 ??= performance.now()
        w.__rects?.push({
          top: r.top,
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
        })
      }
      const done =
        t0 === null
          ? performance.now() - called > 10_000
          : performance.now() - t0 > 1100
      if (!done) requestAnimationFrame(tick)
    }
    tick()
  }, selector)
}

/**
 * Starts sampling `selector`'s box and its bottom `clip-path` inset (percent
 * hidden from the bottom: 100 = folded away, 0 = fully revealed) every frame
 * for ~1.1s from when it first appears. The mobile panel is laid out at full size and revealed with
 * `clip-path`, so its box never changes and the inset is the animation.
 */
export async function startClipRecording(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as Window & { __clips?: number[] }
    w.__clips = []
    const called = performance.now()
    let t0: number | null = null
    const tick = () => {
      const el = document.querySelector(sel)
      if (el) {
        t0 ??= performance.now()
        const m = getComputedStyle(el).clipPath.match(/inset\(([^)]+)\)/)
        const bottom = m?.[1].trim().split(/\s+/)[2]
        w.__clips?.push(bottom ? Number.parseFloat(bottom) : 0)
      }
      const done =
        t0 === null
          ? performance.now() - called > 10_000
          : performance.now() - t0 > 1100
      if (!done) requestAnimationFrame(tick)
    }
    tick()
  }, selector)
}

/** The bottom insets recorded while the element existed, oldest first. */
export async function recordedClips(page: Page): Promise<number[]> {
  return page.evaluate(
    () => (window as Window & { __clips?: number[] }).__clips ?? [],
  )
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
