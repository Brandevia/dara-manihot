import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomeHero } from '@/components/sections/home-hero'
import { readSource } from './helpers'

describe('landing hero (green gradient over the carousel)', () => {
  it('lays the green gradient over the carousel photos', () => {
    const { container } = render(<HomeHero />)
    expect(container.querySelector('.bg-hero-gradient')).not.toBeNull()
    expect(container.querySelector('.bg-hero-gradient-bottom')).not.toBeNull()
  })

  it('puts the legibility shadow on the headline and the intro', () => {
    const { container } = render(<HomeHero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveClass('text-on-photo')
    expect(container.querySelector('p.text-on-photo')).not.toBeNull()
  })

  it('keeps the carousel caption legible too', () => {
    const { container } = render(<HomeHero />)
    expect(container.querySelector('p[class*="text-on-photo"]')).not.toBeNull()
  })

  it('defines the hero gradient tokens and the utilities that paint them', () => {
    const css = readSource('app/globals.css')
    expect(css).toMatch(/--hero-gradient:/)
    expect(css).toMatch(/@utility bg-hero-gradient \{/)
    expect(css).toMatch(/@utility bg-hero-gradient-bottom \{/)
    expect(css).toMatch(/@utility text-on-photo/)
  })
})
