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
