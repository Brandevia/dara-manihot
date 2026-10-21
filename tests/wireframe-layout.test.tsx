import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContactPage from '@/app/(pages)/contact/page'
import Home from '@/app/page'
import { Footer } from '@/components/footer'
import { CtaBand } from '@/components/sections/cta-band'
import { StatsBand } from '@/components/sections/stats-band'
import { SiteHeader } from '@/components/site-header'
import {
  COMPANY_INFO,
  CTA_BAND_IMAGE,
  LEGAL_LINKS,
  NAVIGATION_LINKS,
} from '@/lib/constants'
import { SERVICES } from '@/lib/services'
import { readSource } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/contact',
  useSearchParams: () => new URLSearchParams(),
}))

describe('navbar', () => {
  it('uses the frosted-glass surface, firmed up once scrolled', () => {
    const { container } = render(<SiteHeader />)
    const pill = container.querySelector('header > div')
    expect(pill).toHaveClass('glass')
    expect(pill).toHaveAttribute('data-scrolled')
  })

  it('marks the active link with an outline, never an underline', () => {
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const active = within(nav).getByRole('link', { name: 'Contact' })
    expect(active).toHaveAttribute('aria-current', 'page')
    const cls = active.className
    expect(cls).toMatch(/ring-1/)
    expect(cls).toMatch(/data-\[active\]:ring-primary/)
    expect(cls).not.toMatch(/after:|underline/)
    // Idle links are fully opaque: translucent text fails AA on the glass.
    expect(cls).not.toMatch(/text-foreground\/\d+/)
  })

  it('has no underline classes or ::after underline left in the navigation-menu primitive', () => {
    // Match utility classes only, so an explanatory comment can say "underline".
    expect(readSource('components/ui/navigation-menu.tsx')).not.toMatch(
      /after:|hover:underline|underline-offset|\bdecoration-/,
    )
  })
})

describe('Footer', () => {
  it('shows Dara-Manihot content and no template leftovers', () => {
    const { container } = render(<Footer />)
    const text = container.textContent ?? ''
    expect(text).toContain(COMPANY_INFO.description)
    expect(text).toContain(COMPANY_INFO.email)
    expect(text).toContain(COMPANY_INFO.address)
    expect(text).toContain(`© ${new Date().getFullYear()} ${COMPANY_INFO.name}`)
    expect(text).not.toMatch(/wayfare|travel co/i)
  })

  it('has the three wireframe column headings', () => {
    render(<Footer />)
    for (const name of ['Quick links', 'Our services', 'Talk to us'])
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  })

  it('links every nav page, every service’s own page and both legal pages', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    const hrefs = within(footer)
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
    for (const l of NAVIGATION_LINKS) expect(hrefs).toContain(l.href)
    for (const l of LEGAL_LINKS) expect(hrefs).toContain(l.href)
    for (const s of SERVICES) expect(hrefs).toContain(`/services/${s.id}`)
    for (const p of COMPANY_INFO.phones) expect(hrefs).toContain(`tel:${p.tel}`)
    expect(hrefs).toContain(`mailto:${COMPANY_INFO.email}`)
  })

  it('hides the decorative wordmark from assistive tech', () => {
    const { container } = render(<Footer />)
    const mark = [...container.querySelectorAll('p')].find(
      (p) => p.textContent === COMPANY_INFO.shortName,
    )
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('StatsBand', () => {
  const stats = [
    { value: '10+', label: 'Years of experience' },
    { value: '5', label: 'States reached' },
  ]

  it('renders every figure as a term/definition pair', () => {
    const { container } = render(<StatsBand stats={stats} />)
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    expect(container.querySelectorAll('dd')).toHaveLength(2)
    expect(container.textContent).toContain('10+')
    expect(container.textContent).toContain('States reached')
  })

  it('is a labelled landmark region', () => {
    render(<StatsBand stats={stats} />)
    expect(
      screen.getByRole('region', { name: 'Dara-Manihot in numbers' }),
    ).toBeInTheDocument()
  })
})

describe('CtaBand', () => {
  it('renders the plain gradient card when no image is given', () => {
    const { container } = render(
      <CtaBand title="T" description="D">
        <a href="/contact">Go</a>
      </CtaBand>,
    )
    expect(container.querySelector('img')).toBeNull()
    const card = container.querySelector('section > div')
    expect(card).toHaveClass('bg-band-gradient')
    // Never a full-bleed colour band: the section itself carries no colour.
    expect(container.querySelector('section')?.className).not.toMatch(/bg-/)
  })

  it('renders an inset photo card with a decorative image and a veil when given one', () => {
    const { container } = render(
      <CtaBand title="T" description="D" image={CTA_BAND_IMAGE}>
        <a href="/contact">Go</a>
      </CtaBand>,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
    expect(container.querySelector('.bg-image-band-overlay')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'T' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument()
  })
})

describe('landing page', () => {
  it('puts the stats band under the hero and the photo CTA last, before the footer', () => {
    const { container } = render(<Home />)
    const sections = [...container.querySelectorAll('section')]
    const stats = container.querySelector(
      'section[aria-label="Dara-Manihot in numbers"]',
    )
    const hero = container.querySelector(
      'section[aria-labelledby="home-hero-title"]',
    )
    expect(hero?.nextElementSibling).toBe(stats)
    const last = sections.at(-1)
    expect(
      within(last as HTMLElement).getByRole('heading', {
        name: 'Join us in transforming agriculture',
      }),
    ).toBeInTheDocument()
    expect(last?.querySelector('img')).not.toBeNull()
  })

  it('shows the real figures once, in the band (not duplicated in "Who we are")', () => {
    const { container } = render(<Home />)
    expect(container.querySelectorAll('dl')).toHaveLength(1)
  })

  it('keeps the primary closing CTA in the secondary (CTA) colour', () => {
    render(<Home />)
    const last = screen
      .getAllByRole('link', { name: /explore our services/i })
      .at(-1)
    expect(last?.className).toMatch(/bg-secondary/)
  })
})

describe('contact page', () => {
  it('has the wireframe heading as the single h1', () => {
    render(<ContactPage />)
    expect(
      screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent),
    ).toEqual(['Let’s build the future together'])
  })

  it('lists email, phone, hours and office, with copy buttons for email and phones', () => {
    render(<ContactPage />)
    for (const label of ['Email', 'Phone', 'Hours', 'Office'])
      expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getAllByText(COMPANY_INFO.hours).length).toBeGreaterThan(0)
    expect(screen.getAllByText(COMPANY_INFO.address).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Copy email address' }),
    ).toBeInTheDocument()
    for (const p of COMPANY_INFO.phones)
      expect(
        screen.getByRole('button', { name: `Copy phone number ${p.display}` }),
      ).toBeInTheDocument()
  })

  it('hosts the enquiry form on the dark surface, keeping #enquiry as the anchor', () => {
    const { container } = render(<ContactPage />)
    expect(container.querySelector('#enquiry')).not.toBeNull()
    const card = screen
      .getByRole('form', { name: 'Enquiry form' })
      .closest('[data-slot="card"]')
    expect(card).toHaveClass('surface-canopy')
    expect(card).toHaveClass('bg-canopy')
  })

  it('keeps every form label visible (accessibility), even on the dark card', () => {
    render(<ContactPage />)
    for (const name of [
      /full name/i,
      /email address/i,
      /service of interest/i,
      /how can we help/i,
    ])
      expect(screen.getAllByLabelText(name).length).toBeGreaterThan(0)
  })

  it('has no gradient: it stays on the page background down to the footer', () => {
    const { container } = render(<ContactPage />)
    expect(container.innerHTML).not.toMatch(/gradient/)
  })

  it('has no template leftovers', () => {
    const { container } = render(<ContactPage />)
    expect(container.textContent).not.toMatch(
      /jane smith|late september|wayfare/i,
    )
  })
})

describe('closing CTA photo', () => {
  it('points at a file that exists in /public', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const { ROOT } = await import('./helpers')
    expect(
      fs.existsSync(path.join(ROOT, 'public', CTA_BAND_IMAGE.src)),
      `${CTA_BAND_IMAGE.src} missing`,
    ).toBe(true)
  })
})
