import type { Page } from '@playwright/test'

type Sample = [elapsedMs: number, left: number | null]
type Recorder = Window & { __samples?: Sample[] }

/** Starts sampling `selector`'s left edge every animation frame for ~1.1s. */
export async function startRecording(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as Recorder
    w.__samples = []
    const t0 = performance.now()
    const tick = () => {
      const r = document.querySelector(sel)?.getBoundingClientRect()
      w.__samples?.push([Math.round(performance.now() - t0), r ? r.left : null])
      if (performance.now() - t0 < 1100) requestAnimationFrame(tick)
    }
    tick()
  }, selector)
}

/** Left-edge positions recorded while the element existed. */
export async function recordedLefts(page: Page): Promise<number[]> {
  const samples = await page.evaluate(
    () => (window as Recorder).__samples ?? [],
  )
  return samples.map(([, l]) => l).filter((l): l is number => l !== null)
}
