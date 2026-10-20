import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CountUp } from '@/components/count-up'

/** An IntersectionObserver the test can fire by hand. */
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
  fire(isIntersecting: boolean) {
    for (const target of this.targets)
      this.callback(
        [
          {
            target,
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      )
  }
}

const scrollIntoView = () =>
  act(() => ControlledObserver.instances.forEach((o) => o.fire(true)))
const visible = () => document.querySelector('[data-count-up]')?.textContent

beforeEach(() => {
  ControlledObserver.instances = []
  vi.stubGlobal('IntersectionObserver', ControlledObserver)
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
  })
  window.__reduceMotion = false
})

afterEach(() => {
  vi.useRealTimers()
  window.__reduceMotion = false
})

describe('CountUp', () => {
  it('waits at zero until the figure scrolls into view', () => {
    render(<CountUp value="500+" />)
    expect(visible()).toBe('0+')
    act(() => vi.advanceTimersByTime(3000))
    expect(visible()).toBe('0+')
  })

  it('counts up to the exact figure once it is in view', () => {
    render(<CountUp value="500+" duration={1000} />)
    scrollIntoView()
    act(() => vi.advanceTimersByTime(300))
    const midway = Number.parseInt(visible() ?? '0', 10)
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(500)
    act(() => vi.advanceTimersByTime(1200))
    expect(visible()).toBe('500+')
  })

  it('only ever counts upwards', () => {
    render(<CountUp value="50+" duration={800} />)
    scrollIntoView()
    let last = -1
    for (let i = 0; i < 60; i++) {
      act(() => vi.advanceTimersByTime(16))
      const n = Number.parseInt(visible() ?? '0', 10)
      expect(n).toBeGreaterThanOrEqual(last)
      last = n
    }
    expect(last).toBe(50)
  })

  it('keeps the real figure for screen readers and hides the animation from them', () => {
    render(<CountUp value="10+" />)
    expect(
      screen.getByText('10+', { selector: '.sr-only' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-count-up]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('counts only the number inside a sentence and leaves the words alone', () => {
    render(<CountUp value="30% cost reduction target" duration={500} />)
    scrollIntoView()
    act(() => vi.advanceTimersByTime(900))
    expect(visible()).toBe('30% cost reduction target')
  })

  it('shows the real figure straight away with prefers-reduced-motion', () => {
    window.__reduceMotion = true
    render(<CountUp value="500+" />)
    expect(visible()).toBe('500+')
    scrollIntoView()
    act(() => vi.advanceTimersByTime(50))
    expect(visible()).toBe('500+')
  })

  it('renders plain text when there is no number to count', () => {
    const { container } = render(<CountUp value="Active" />)
    expect(container.textContent).toBe('Active')
    expect(container.querySelector('[data-count-up]')).toBeNull()
  })

  it('does not restart after it has finished', () => {
    render(<CountUp value="5" duration={200} />)
    scrollIntoView()
    act(() => vi.advanceTimersByTime(400))
    expect(visible()).toBe('5')
    act(() => {
      for (const o of ControlledObserver.instances) o.fire(false)
    })
    scrollIntoView()
    act(() => vi.advanceTimersByTime(16))
    expect(visible()).toBe('5')
  })
})
