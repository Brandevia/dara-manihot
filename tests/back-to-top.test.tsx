import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BackToTop } from '@/components/back-to-top'

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('BackToTop', () => {
  beforeEach(() => {
    window.__reduceMotion = false
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.mocked(window.scrollTo).mockClear()
  })

  it('is hidden at the top of the page', () => {
    render(<BackToTop />)
    expect(
      screen.queryByRole('button', { name: 'Back to top' }),
    ).not.toBeInTheDocument()
  })

  it('appears after scrolling past the threshold and hides again', async () => {
    render(<BackToTop />)
    scrollTo(900)
    expect(
      await screen.findByRole('button', { name: 'Back to top' }),
    ).toBeInTheDocument()
    scrollTo(100)
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Back to top' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('scrolls smoothly to the top when clicked', async () => {
    render(<BackToTop />)
    scrollTo(900)
    await userEvent.click(
      await screen.findByRole('button', { name: 'Back to top' }),
    )
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jumps instead of animating under prefers-reduced-motion', async () => {
    window.__reduceMotion = true
    render(<BackToTop />)
    scrollTo(900)
    await userEvent.click(
      await screen.findByRole('button', { name: 'Back to top' }),
    )
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('is visible straight away when the page loads already scrolled', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 1500,
      configurable: true,
    })
    render(<BackToTop />)
    expect(
      screen.getByRole('button', { name: 'Back to top' }),
    ).toBeInTheDocument()
  })
})
