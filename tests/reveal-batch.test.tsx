import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Stagger, StaggerItem } from '@/components/animations'
import { STAGGER_GAP } from '@/lib/motion'
import { MAX_STAGGER_STEPS, revealInBatch } from '@/lib/reveal-batch'

/** One observer per element, like motion creates, each fireable by hand. */
class ControlledObserver {
  static instances: ControlledObserver[] = []
  constructor(private callback: IntersectionObserverCallback) {
    ControlledObserver.instances.push(this)
  }
  targets = new Set<Element>()
  observe = (el: Element) => {
    this.targets.add(el)
  }
  unobserve = (el: Element) => {
    this.targets.delete(el)
  }
  disconnect = () => this.targets.clear()
  takeRecords = () => []
  fire(isIntersecting = true, only?: Element) {
    for (const target of this.targets) {
      if (only && target !== only) continue
      this.callback(
        [
          { target, isIntersecting, intersectionRatio: 1 },
        ] as unknown as IntersectionObserverEntry[],
        this as unknown as IntersectionObserver,
      )
    }
  }
}

/** Scroll one element into view (motion may share an observer between many). */
const scrollIn = (el: Element) =>
  act(() => {
    for (const o of ControlledObserver.instances) o.fire(true, el)
  })
const items = () => [...document.querySelectorAll('[data-reveal]')]

// Motion caches its observer for the whole module, so instances are never
// cleared between tests; `fire(…, only)` picks the element that matters.
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', ControlledObserver)
  window.__reduceMotion = false
})

describe('revealInBatch', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame'] }))
  afterEach(() => vi.useRealTimers())

  it('staggers items that arrive in the same frame, in arrival order', () => {
    const delays: number[] = []
    for (let i = 0; i < 3; i++) revealInBatch((d) => delays.push(d))
    expect(delays).toEqual([]) // waits for the frame so it can see them all
    act(() => vi.advanceTimersByTime(20))
    expect(delays).toEqual([0, STAGGER_GAP, STAGGER_GAP * 2])
  })

  it('starts an item that arrives later (by scrolling) at once', () => {
    const delays: number[] = []
    revealInBatch((d) => delays.push(d))
    act(() => vi.advanceTimersByTime(20))
    revealInBatch((d) => delays.push(d))
    act(() => vi.advanceTimersByTime(20))
    expect(delays).toEqual([0, 0])
  })

  it('caps the wait so a fast scroll past many items is not slow', () => {
    const delays: number[] = []
    for (let i = 0; i < 12; i++) revealInBatch((d) => delays.push(d))
    act(() => vi.advanceTimersByTime(20))
    expect(Math.max(...delays)).toBe(MAX_STAGGER_STEPS * STAGGER_GAP)
    expect(delays).toHaveLength(12)
  })
})

describe('StaggerItem', () => {
  const opacities = () =>
    [...document.querySelectorAll<HTMLElement>('[data-reveal]')].map(
      (el) => el.style.opacity,
    )

  it('renders hidden, so there is no flash of content before it reveals', () => {
    render(
      <Stagger>
        <StaggerItem>a</StaggerItem>
        <StaggerItem>b</StaggerItem>
      </Stagger>,
    )
    expect(opacities()).toEqual(['0', '0'])
  })

  it('reveals only the items that have scrolled into view (the phone fix)', async () => {
    // Real timers: motion drives its animations from the real frame clock.
    render(
      <Stagger>
        {[0, 1, 2, 3].map((n) => (
          <StaggerItem key={n}>item {n}</StaggerItem>
        ))}
      </Stagger>,
    )
    const [first, second, third] = items()
    // Only the first two are on screen; the rest are far down a tall column.
    scrollIn(first)
    scrollIn(second)
    await vi.waitFor(() => expect(opacities()).toEqual(['1', '1', '0', '0']), {
      timeout: 3000,
    })
    // Hold a moment: the off-screen items must not creep in on their own.
    await new Promise((r) => setTimeout(r, 300))
    expect(opacities()).toEqual(['1', '1', '0', '0'])

    // Scrolling on reveals the next one.
    scrollIn(third)
    await vi.waitFor(() => expect(opacities()).toEqual(['1', '1', '1', '0']), {
      timeout: 3000,
    })
  })
})
