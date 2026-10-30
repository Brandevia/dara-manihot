import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ContactPage from '@/app/(pages)/contact/page'
import { Footer } from '@/components/footer'
import { CtaBand } from '@/components/sections/cta-band'
import { VisionMission } from '@/components/sections/vision-mission'
import { VisionStatement } from '@/components/sections/vision-statement'
import { WhoWeAre } from '@/components/sections/who-we-are'
import { readSource } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

describe('About: mission and vision (mint, alternating rows)', () => {
  it('is a mint section with vision first, then mission, wording unchanged', () => {
    const { container } = render(<VisionMission />)
    const section = container.querySelector('section[data-vision-mission]')
    expect(section).toHaveClass('bg-mint')
    const rows = [...container.querySelectorAll('[data-row]')]
    expect(rows.map((r) => r.getAttribute('data-row'))).toEqual([
      'vision',
      'mission',
    ])
    expect(rows[0].textContent).toMatch(
      /leading catalyst for sustainable agro-industrial transformation/,
    )
    expect(rows[1].textContent).toMatch(
      /transform Africa’s agricultural and industrial sectors/,
    )
  })

  it('names the section and gives each row a heading and a photo', () => {
    render(<VisionMission />)
    expect(
      screen.getByRole('region', { name: /our mission & vision/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Our vision' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Our mission' }),
    ).toBeInTheDocument()
  })

  it('alternates the photo side: right for vision, left for mission', () => {
    const { container } = render(<VisionMission />)
    const [vision, mission] = [...container.querySelectorAll('[data-row]')]
    const photoOrder = (row: Element) =>
      row.querySelector('[data-photo-slot]')?.closest('[data-reveal]')
        ?.className
    expect(photoOrder(vision)).not.toMatch(/lg:order-1/)
    expect(photoOrder(mission)).toMatch(/lg:order-1/)
  })

  it('has two rows and no icon in either (the words are the centrepiece)', () => {
    const { container } = render(<VisionMission />)
    const rows = container.querySelectorAll('[data-row]')
    expect(rows).toHaveLength(2)
    for (const row of rows) expect(row.querySelector('svg')).toBeNull()
  })

  it('fades text and photo in with the Appear effect', () => {
    const { container } = render(<VisionMission />)
    expect(
      container.querySelectorAll('[data-reveal]').length,
    ).toBeGreaterThanOrEqual(5)
  })

  it('replaces the old cards on the About page', () => {
    const { container } = render(<AboutPage />)
    expect(container.querySelector('[data-vision-mission]')).not.toBeNull()
  })
})

describe('landing page purple accents', () => {
  it('sets “clean, affordable energy” in the secondary purple', () => {
    const { container } = render(<VisionStatement />)
    const accent = container.querySelector('[data-accent]')
    expect(accent?.textContent).toBe('clean, affordable energy')
    expect(accent).toHaveClass('text-secondary')
    expect(container.textContent).toMatch(
      /thrive with clean, affordable energy; agricultural waste/,
    )
  })

  it('sets the “Who we are” label in purple and its tile icons in purple', () => {
    const { container } = render(<WhoWeAre />)
    expect(screen.getByRole('heading', { name: 'Who we are' })).toHaveClass(
      'text-secondary',
    )
    const icons = container.querySelectorAll('[data-tile] svg')
    expect(icons.length).toBe(5)
    for (const icon of icons) expect(icon).toHaveClass('text-secondary')
  })
})

describe('icons use the secondary purple', () => {
  const files = [
    'app/page.tsx',
    'app/(pages)/contact/page.tsx',
    'app/(pages)/services/page.tsx',
    'app/(pages)/projects/page.tsx',
    'components/sections/pillars.tsx',
    'components/sections/impact-goals.tsx',
    'components/sections/partnerships.tsx',
    'components/cookie-banner.tsx',
  ]

  it('has no green icon chips left (bg-accent text-primary)', () => {
    for (const f of files)
      expect(readSource(f), f).not.toMatch(/bg-accent text-primary/)
  })

  it('defines the pale purple chip token for light and dark', () => {
    const css = readSource('app/globals.css')
    expect(css).toMatch(/--secondary-soft: var\(--brand-purple-100\)/)
    expect(css).toMatch(/\.dark \{[\s\S]*--secondary-soft:/)
    expect(css).toMatch(/--color-secondary-soft: var\(--secondary-soft\)/)
  })
})

describe('contact page', () => {
  it('shows every contact icon in purple', () => {
    const { container } = render(<ContactPage />)
    const list = container.querySelector('#enquiry ul') as HTMLElement
    const chips = list.querySelectorAll(':scope > li > span[aria-hidden]')
    expect(chips.length).toBe(4)
    for (const chip of chips) {
      expect(chip).toHaveClass('bg-secondary-soft')
      expect(chip).toHaveClass('text-secondary')
    }
  })

  it('reveals the contact rows one after another with the Appear effect', () => {
    const { container } = render(<ContactPage />)
    const list = container.querySelector('#enquiry ul') as HTMLElement
    const rows = list.querySelectorAll(':scope > li')
    expect(rows.length).toBe(4)
    for (const row of rows) expect(row).toHaveAttribute('data-reveal')
    const intro = container
      .querySelector('#contact-title')
      ?.closest('[data-reveal]')
    expect(intro).not.toBeNull()
  })

  it('keeps the enquiry form card revealed too', () => {
    const { container } = render(<ContactPage />)
    expect(
      container.querySelector('.surface-canopy')?.closest('[data-reveal]'),
    ).not.toBeNull()
  })
})

describe('closing CTA band without a photo', () => {
  it('still reveals its content, with no delay', () => {
    const { container } = render(
      <CtaBand title="T" description="D">
        <a href="/x">Go</a>
      </CtaBand>,
    )
    expect(container.querySelector('[data-cta-image]')).toBeNull()
    expect(container.querySelector('[data-cta-content]')).toHaveAttribute(
      'data-reveal',
    )
  })
})

describe('footer wordmark', () => {
  it('sits a cursor height above the bottom edge instead of being cropped', () => {
    const { container } = render(<Footer />)
    const wordmark = [...container.querySelectorAll('p[aria-hidden]')].find(
      (p) => /dara/i.test(p.textContent ?? ''),
    )
    expect(wordmark).toBeDefined()
    expect(wordmark).toHaveClass('mb-5')
    expect(wordmark?.className).not.toMatch(/-mb-/)
  })
})

describe('page hero gradients', () => {
  it('every inner page hero with a photo paints the translucent green overlay', async () => {
    const css = readSource('app/globals.css')
    expect(css).toMatch(
      /@utility bg-page-hero-overlay \{\s*background-image: var\(--page-hero-overlay\)/,
    )
    const { container } = render(<AboutPage />)
    const hero = container.querySelector('[data-page-hero][data-has-image]')
    expect(hero?.querySelector('.bg-page-hero-overlay')).not.toBeNull()
    expect(
      within(hero as HTMLElement).getByRole('heading', { level: 1 }),
    ).toBeInTheDocument()
  })
})

describe('enquiry fields (dark card look and placeholders)', () => {
  it('shows the placeholders from the design', async () => {
    const { EnquiryForm } = await import('@/components/enquiry-form')
    render(<EnquiryForm />)
    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+234 800 000 0000')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Tell us about your project or enquiry…'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Select a service' }),
    ).toBeInTheDocument()
  })
})
