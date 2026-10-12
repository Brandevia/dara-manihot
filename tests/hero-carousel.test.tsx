import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { HeroCarousel } from '@/components/hero-carousel'

const slides = [
  { src: '/a.jpg', alt: 'Alpha scene', caption: 'Alpha' },
  { src: '/b.jpg', alt: 'Bravo scene', caption: 'Bravo' },
  { src: '/c.jpg', alt: 'Charlie scene', caption: 'Charlie' },
]

const activeIndex = () =>
  screen
    .getAllByRole('img', { hidden: true })
    .findIndex((img) => img.getAttribute('data-active') === 'true')

// Under jsdom (which has no AnimationEvent) React listens for the
// vendor-prefixed event name; real browsers use `animationend`, which the
// Playwright autoplay test covers.
const endSlide = () =>
  fireEvent(
    screen.getByTestId('hero-progress'),
    new Event('webkitAnimationEnd', { bubbles: true }),
  )

describe('HeroCarousel', () => {
  beforeEach(() => {
    window.__reduceMotion = false
  })

  it('renders every slide and starts on the first', () => {
    render(<HeroCarousel slides={slides} />)
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(3)
    expect(activeIndex()).toBe(0)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('exposes carousel semantics and hides inactive slides from assistive tech', () => {
    render(<HeroCarousel slides={slides} />)
    expect(
      screen.getByRole('region', { name: 'Featured work' }),
    ).toHaveAttribute('aria-roledescription', 'carousel')
    const groups = screen.getAllByRole('group', { hidden: true })
    expect(groups.map((g) => g.getAttribute('aria-hidden'))).toEqual([
      'false',
      'true',
      'true',
    ])
  })

  it('advances when the active progress bar finishes, and wraps around', () => {
    render(<HeroCarousel slides={slides} />)
    endSlide()
    expect(activeIndex()).toBe(1)
    endSlide()
    expect(activeIndex()).toBe(2)
    endSlide()
    expect(activeIndex()).toBe(0)
  })

  it('goes to a slide from its indicator', async () => {
    render(<HeroCarousel slides={slides} />)
    await userEvent.click(
      screen.getByRole('button', { name: /show slide 3: charlie/i }),
    )
    expect(activeIndex()).toBe(2)
    expect(
      screen.getByRole('button', { name: /show slide 3/i }),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('supports previous/next, wrapping at both ends', async () => {
    render(<HeroCarousel slides={slides} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous slide' }),
    )
    expect(activeIndex()).toBe(2)
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(activeIndex()).toBe(0)
  })

  it('pauses and resumes the progress animation', async () => {
    render(<HeroCarousel slides={slides} />)
    const bar = () => screen.getByTestId('hero-progress')
    expect(bar().style.animationPlayState).toBe('running')
    await userEvent.click(
      screen.getByRole('button', { name: 'Pause slideshow' }),
    )
    expect(bar().style.animationPlayState).toBe('paused')
    await userEvent.click(
      screen.getByRole('button', { name: 'Play slideshow' }),
    )
    expect(bar().style.animationPlayState).toBe('running')
  })

  it('does not autoplay under prefers-reduced-motion until the visitor opts in', async () => {
    window.__reduceMotion = true
    render(<HeroCarousel slides={slides} />)
    expect(screen.getByTestId('hero-progress').style.animationPlayState).toBe(
      'paused',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Play slideshow' }),
    )
    expect(screen.getByTestId('hero-progress').style.animationPlayState).toBe(
      'running',
    )
  })

  it('renders no controls for a single slide', () => {
    render(<HeroCarousel slides={[slides[0]]} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
