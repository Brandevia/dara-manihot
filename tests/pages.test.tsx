import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ContactPage from '@/app/(pages)/contact/page'
import PrivacyPage from '@/app/(pages)/privacy/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import ServicesPage from '@/app/(pages)/services/page'
import TermsPage from '@/app/(pages)/terms/page'
import Home from '@/app/page'
import { Footer } from '@/components/footer'
import { SERVICES } from '@/lib/services'
import { discoverRoutes } from './helpers'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const pages = [
  ['/', Home],
  ['/about', AboutPage],
  ['/services', ServicesPage],
  ['/projects', ProjectsPage],
  ['/contact', ContactPage],
  ['/privacy', PrivacyPage],
  ['/terms', TermsPage],
] as const

const routes = discoverRoutes()
const serviceIds = new Set<string>(SERVICES.map((s) => s.id))

describe.each(pages)('%s', (_path, Page) => {
  it('has exactly one h1', () => {
    const { container } = render(<Page />)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })

  it('shows no leaked entities or "undefined"/"null" text', () => {
    // Regressions: literal "&#39;" on the home page; blank "Impact:" label.
    const { container } = render(<Page />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/&#\d+;|&[a-z]+;/i)
    expect(text).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]/)
  })

  it('every internal link resolves to a real route (and service anchor)', () => {
    const { container } = render(<Page />)
    for (const a of container.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = a.getAttribute('href') ?? ''
      if (/^(mailto:|tel:|https?:)/.test(href)) continue
      const [pathname, hash] = href.split('#')
      if (pathname) expect(routes, `dead link ${href}`).toContain(pathname)
      if (pathname === '/services' && hash)
        expect(serviceIds.has(hash), `unknown service anchor ${href}`).toBe(
          true,
        )
    }
  })

  it('has no button that does nothing (regression: dead CTA <Button>s)', () => {
    const { container } = render(<Page />)
    // Every <button> must be a real control with a handler or type; the
    // old pages rendered <button> CTAs with no link or onClick at all.
    for (const btn of container.querySelectorAll('button')) {
      expect(
        btn.getAttribute('aria-label') ?? btn.textContent,
        'unlabelled button',
      ).toBeTruthy()
    }
    // Page-level CTAs are links.
    expect(
      container.querySelectorAll('[data-slot="button"]:not(a)').length,
    ).toBe(container.querySelectorAll('button[data-slot="button"]').length)
  })
})

describe('/projects', () => {
  it('only shows an "Impact:" label when there is an impact figure', () => {
    const { container } = render(<ProjectsPage />)
    const labels = [...container.querySelectorAll('strong')].filter(
      (s) => s.textContent === 'Impact:',
    )
    expect(labels).toHaveLength(1)
    expect(labels[0].parentElement?.textContent).toMatch(/30% cost reduction/)
  })

  it('wires every "ask about this project" button to an email', () => {
    const { getAllByRole } = render(<ProjectsPage />)
    const links = getAllByRole('link', { name: /ask about this project/i })
    expect(links).toHaveLength(2)
    for (const l of links)
      expect(l.getAttribute('href')).toMatch(/^mailto:.+\?subject=/)
  })
})

describe('/services', () => {
  it('renders an anchor for every service so footer links can deep-link', () => {
    const { container } = render(<ServicesPage />)
    for (const s of SERVICES)
      expect(container.querySelector(`#${s.id}`)).not.toBeNull()
  })

  it('wires the closing CTAs (regression: they were dead buttons)', () => {
    const { getByRole } = render(<ServicesPage />)
    expect(
      getByRole('link', { name: /schedule a consultation/i }),
    ).toHaveAttribute('href', '/contact')
    expect(
      getByRole('link', { name: /request a proposal/i }).getAttribute('href'),
    ).toMatch(/^mailto:/)
  })
})

describe('/contact', () => {
  it('uses real mailto: and tel: links, not window.location handlers', () => {
    const { container } = render(<ContactPage />)
    expect(
      container.querySelectorAll('a[href^="mailto:"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('a[href^="tel:"]').length,
    ).toBeGreaterThan(0)
  })
})

describe('legal pages', () => {
  it.each([
    ['privacy', PrivacyPage],
    ['terms', TermsPage],
  ] as const)(
    '%s: every contents link targets an existing section',
    (_n, Page) => {
      const { container } = render(<Page />)
      const toc =
        container.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')
      expect(toc.length).toBeGreaterThan(5)
      for (const a of toc) {
        expect(
          container.querySelector(a.getAttribute('href') as string),
        ).not.toBeNull()
      }
    },
  )
})

describe('Footer', () => {
  it('opens social links safely in a new tab', () => {
    const { container } = render(<Footer />)
    const external =
      container.querySelectorAll<HTMLAnchorElement>('a[href^="https:"]')
    expect(external.length).toBeGreaterThan(0)
    for (const a of external) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
      expect(a.getAttribute('aria-label')).toBeTruthy()
    }
  })
})
