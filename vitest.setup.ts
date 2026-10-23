import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

// next/image reads its config from the build; in unit tests render a plain
// <img> and drop the Next-only props.
vi.mock('next/image', async () => {
  const { createElement } = await import('react')
  return {
    default: ({
      fill: _fill,
      priority: _priority,
      quality: _quality,
      ...props
    }: Record<string, unknown>) => createElement('img', props),
  }
})

// jsdom has no matchMedia; tests flip `window.__reduceMotion` to simulate the
// OS "reduce motion" setting, and `window.__finePointer` to simulate a desktop
// mouse (the default is a touch device, which keeps the native <select>).
declare global {
  interface Window {
    __reduceMotion?: boolean
    __finePointer?: boolean
  }
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion')
      ? Boolean(window.__reduceMotion)
      : query.includes('pointer: fine')
        ? Boolean(window.__finePointer)
        : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }),
})

// motion's whileInView needs IntersectionObserver.
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// jsdom doesn't implement scrollTo.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
