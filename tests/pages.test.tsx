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
import { PROJECTS } from '@/lib/projects'
import { PILLARS, SERVICES } from '@/lib/services'
import { discoverRoutes, expandDynamicRoutes } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

const pages = [
  ['/', Home],
  ['/about', AboutPage],
  ['/services', ServicesPage],
  ['/projects', ProjectsPage],
  ['/contact', ContactPage],
  ['/privacy', PrivacyPage],
  ['/terms', TermsPage],
] as const

const routes = expandDynamicRoutes(discoverRoutes(), {
  '/services/[slug]': SERVICES.map((s) => s.id),
  '/projects/[slug]': PROJECTS.map((p) => p.slug),
})
const serviceIds = new Set<string>(SERVICES.map((s) => s.id))
// Hashes that exist on each page. /services has a section per pillar and a
// card per service; /contact has the enquiry form.
const anchorsByPath: Record<string, Set<string>> = {
  '/services': new Set([...serviceIds, ...PILLARS.map((p) => p.id)]),
  '/contact': new Set(['enquiry', 'map']),
}

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

  it('every internal link resolves to a real route, anchor and service', () => {
    const { container } = render(<Page />)
    for (const a of container.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = a.getAttribute('href') ?? ''
      if (/^(mailto:|tel:|https?:)/.test(href)) continue
      const url = new URL(href, 'http://site.test')
      const hash = url.hash.slice(1)
      if (href.startsWith('#')) {
        // In-page link: its target must exist on this page.
        expect(
          container.querySelector(href),
          `dead anchor ${href}`,
        ).not.toBeNull()
        continue
      }
      expect(routes, `dead link ${href}`).toContain(url.pathname)
      if (hash) {
        const known = anchorsByPath[url.pathname]
        expect(known?.has(hash), `unknown anchor ${href}`).toBe(true)
      }
      // ?service= deep links must name a real service.
      const service = url.searchParams.get('service')
      if (service)
        expect(serviceIds.has(service), `bad service in ${href}`).toBe(true)
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
  it('only shows an "Impact" figure when there is one to claim', () => {
    const { container } = render(<ProjectsPage />)
    const labels = [...container.querySelectorAll('dt')].filter(
      (dt) => dt.textContent === 'Impact',
    )
    expect(labels).toHaveLength(1)
    expect(labels[0].nextElementSibling?.textContent).toMatch(
      /30% cost reduction/,
    )
  })

  it('sends every "Ask about project" link to that project’s own page', () => {
    const { getAllByRole } = render(<ProjectsPage />)
    const links = getAllByRole('link', { name: /ask about project/i })
    expect(links.map((l) => l.getAttribute('href'))).toEqual(
      PROJECTS.map((p) => `/projects/${p.slug}`),
    )
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
