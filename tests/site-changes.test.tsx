import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ContactPage from '@/app/(pages)/contact/page'
import PrivacyPage from '@/app/(pages)/privacy/page'
import ProjectPage, {
  generateStaticParams as projectParams,
} from '@/app/(pages)/projects/[slug]/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import ServicePage, {
  generateStaticParams as serviceParams,
} from '@/app/(pages)/services/[slug]/page'
import ServicesPage from '@/app/(pages)/services/page'
import TermsPage from '@/app/(pages)/terms/page'
import Home from '@/app/page'
import { Footer } from '@/components/footer'
import { OfficeMap } from '@/components/office-map'
import {
  IMPACT_GOALS,
  ImpactGoalsSection,
} from '@/components/sections/impact-goals'
import {
  PARTNERSHIPS,
  PartnershipsSection,
} from '@/components/sections/partnerships'
import { StatsBand } from '@/components/sections/stats-band'
import { VisionStatement } from '@/components/sections/vision-statement'
import { WhoWeAre } from '@/components/sections/who-we-are'
import { COMPANY_INFO } from '@/lib/constants'
import { mapDirectionsUrl, mapEmbedUrl, mapSearchUrl } from '@/lib/maps'
import { formatProjectDate, PROJECTS, type Project } from '@/lib/projects'
import { SERVICES } from '@/lib/services'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

/** Tiles keep their background; only what is inside them fades in. */
function expectContentFadesOntoStaticTiles(
  container: HTMLElement,
  count: number,
) {
  const tiles = container.querySelectorAll('[data-tile]')
  expect(tiles).toHaveLength(count)
  for (const tile of tiles) {
    expect(tile.hasAttribute('data-reveal'), 'tile itself must not fade').toBe(
      false,
    )
    expect(
      tile.querySelector('[data-reveal]'),
      'tile content must fade',
    ).not.toBeNull()
  }
}

describe('vision statement (wireframe image 5)', () => {
  it('shows the statement large and centred with "Our vision" beneath it', () => {
    const { container } = render(<VisionStatement />)
    const statement = container.querySelector('p') as HTMLElement
    expect(statement.textContent).toMatch(
      /^We envision an Africa where farms and factories thrive/,
    )
    expect(statement.textContent).toMatch(/forefront of this transformation\.$/)
    expect(statement).toHaveClass('font-display', 'text-statement')
    const label = screen.getByRole('heading', { level: 2, name: 'Our vision' })
    expect(
      statement.compareDocumentPosition(label) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(label.parentElement).toHaveClass('text-center')
  })

  it('replaces the old dark vision band on the landing page', () => {
    render(<Home />)
    expect(screen.queryByText('Our vision for the future')).toBeNull()
    expect(
      screen.getByRole('heading', { name: 'Our vision' }),
    ).toBeInTheDocument()
  })
})

describe('who we are (wireframe image 6)', () => {
  it('is a mint section with the label, the statement and five tiles', () => {
    const { container } = render(<WhoWeAre />)
    expect(container.querySelector('section')).toHaveClass('bg-mint')
    expect(
      screen.getByRole('heading', { name: 'Who we are' }),
    ).toBeInTheDocument()
    expect(container.textContent).toMatch(/leading Nigerian enterprise/)
    expect(container.querySelectorAll('[data-tile]')).toHaveLength(5)
  })

  it('keeps all five reasons from the old "Why choose us" list', () => {
    render(<WhoWeAre />)
    for (const text of [
      /proven track record/i,
      /deep understanding of nigeria/i,
      /renewable energy and hydrogen/i,
      /partnerships with leading universities/i,
      /empowering women and youth/i,
    ])
      expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('fades the content in onto cards that are already there', () => {
    const { container } = render(<WhoWeAre />)
    expectContentFadesOntoStaticTiles(container, 5)
  })

  it('lays out three equal tiles, then a wide and a narrow one', () => {
    const { container } = render(<WhoWeAre />)
    const spans = [...container.querySelectorAll('[data-tile]')].map(
      (t) => /md:col-span-(\d+)/.exec(t.className)?.[1],
    )
    expect(spans).toEqual(['4', '4', '4', '8', '4'])
  })

  it('is on the landing page, replacing the separate "Why choose" block', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { name: 'Who we are' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/why choose dara-manihot/i)).toBeNull()
  })
})

describe('projects (wireframe image 7)', () => {
  it('shows title, date chip, write-up and status/goal/impact for each project', () => {
    const { container } = render(<ProjectsPage />)
    for (const p of PROJECTS) {
      const article = container.querySelector(
        `article[aria-labelledby="${p.slug}-title"]`,
      ) as HTMLElement
      expect(
        within(article).getByRole('heading', { level: 2, name: p.title }),
      ).toBeInTheDocument()
      expect(article.textContent).toContain(p.description)
      expect(
        within(article).getByText('Status').nextElementSibling?.textContent,
      ).toBe(p.status)
      expect(
        within(article).getByText('Goal').nextElementSibling?.textContent,
      ).toBe(p.goal)
    }
  })

  it('only shows a date chip where a date is known', () => {
    const { container } = render(<ProjectsPage />)
    const chips = container.querySelectorAll('time')
    expect(chips).toHaveLength(PROJECTS.filter((p) => p.date).length)
    expect(chips[0]).toHaveAttribute('datetime', '2025-02-03')
    expect(chips[0].textContent).toBe('Feb 3, 2025')
    expect(chips[0]).toHaveClass('uppercase')
  })

  it('formats dates the same in every time zone', () => {
    expect(formatProjectDate('2025-02-03')).toBe('Feb 3, 2025')
    expect(formatProjectDate('2025-12-31')).toBe('Dec 31, 2025')
  })

  it('has unique, URL-safe slugs', () => {
    const slugs = PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
})

describe('strategic partnerships (wireframe image 8)', () => {
  it('has the label, the headline and the four current partner tiles on mint', () => {
    const { container } = render(<PartnershipsSection />)
    expect(container.querySelector('section')).toHaveClass('bg-mint')
    expect(screen.getByText('Strategic partnerships')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Collaborating with leading organizations to amplify our impact',
      }),
    ).toBeInTheDocument()
    expect(PARTNERSHIPS).toHaveLength(4)
    for (const p of PARTNERSHIPS) {
      expect(
        screen.getByRole('heading', { level: 3, name: p.title }),
      ).toBeInTheDocument()
      expect(screen.getByText(p.description)).toBeInTheDocument()
    }
  })

  it('fades the content in onto static tiles', () => {
    const { container } = render(<PartnershipsSection />)
    expectContentFadesOntoStaticTiles(container, 4)
  })
})

describe('impact goals (wireframe image 9)', () => {
  it('has the heading and intro, with the same four goals', () => {
    render(<ImpactGoalsSection />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Our impact goals' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/measurable, sustainable impact/),
    ).toBeInTheDocument()
    expect(IMPACT_GOALS.map((g) => g.title)).toEqual([
      '2030 vision',
      'Community impact',
      'Scale achievement',
      'Global alignment',
    ])
    for (const g of IMPACT_GOALS)
      expect(screen.getByText(g.description)).toBeInTheDocument()
  })

  it('makes the 2030 vision tile deep green and the others mint', () => {
    const { container } = render(<ImpactGoalsSection />)
    const tiles = [...container.querySelectorAll('[data-tile]')]
    expect(tiles[0]).toHaveClass('bg-canopy')
    for (const t of tiles.slice(1)) expect(t).toHaveClass('bg-mint')
  })

  it('fades the content in onto static tiles', () => {
    const { container } = render(<ImpactGoalsSection />)
    expectContentFadesOntoStaticTiles(container, 4)
  })
})

describe('counting figures (wireframe image 1)', () => {
  it('starts every stats figure at zero and keeps the real one for assistive tech', () => {
    const { container } = render(
      <StatsBand
        stats={[
          { value: '500+', label: 'a' },
          { value: '50+', label: 'b' },
          { value: '10+', label: 'c' },
          { value: '5', label: 'd' },
        ]}
      />,
    )
    const counters = [...container.querySelectorAll('[data-count-up]')].map(
      (n) => n.textContent,
    )
    expect(counters).toEqual(['0+', '0+', '0+', '0'])
    const real = [...container.querySelectorAll('dd .sr-only')].map(
      (n) => n.textContent,
    )
    expect(real).toEqual(['500+', '50+', '10+', '5'])
  })

  it('also counts on the About page and the project impact figure', () => {
    const about = render(<AboutPage />)
    expect(about.container.querySelectorAll('[data-count-up]').length).toBe(4)
    about.unmount()
    const projects = render(<ProjectsPage />)
    expect(projects.container.querySelectorAll('[data-count-up]').length).toBe(
      1,
    )
  })
})

describe('white before the footer (wireframe image 3)', () => {
  const pages: [string, () => React.ReactElement][] = [
    ['/', () => <Home />],
    ['/about', () => <AboutPage />],
    ['/services', () => <ServicesPage />],
    ['/projects', () => <ProjectsPage />],
    ['/contact', () => <ContactPage />],
    ['/privacy', () => <PrivacyPage />],
    ['/terms', () => <TermsPage />],
  ]

  it.each(pages)(
    '%s: the last section is not a full-bleed colour band',
    (_p, make) => {
      const { container } = render(make())
      const sections = container.querySelectorAll('section')
      const last = sections[sections.length - 1]
      expect(last.className).not.toMatch(
        /bg-(band-gradient|canopy|primary|mint|muted|accent|page-hero|hero)/,
      )
    },
  )

  it('the footer sits in a page-background wrapper so its corners meet white', () => {
    const { container } = render(<Footer />)
    const wrapper = container.firstElementChild
    expect(wrapper).toHaveClass('bg-background')
    expect(wrapper?.querySelector('footer')).toHaveClass('rounded-t-3xl')
  })
})

describe('footer (logo and dedicated pages)', () => {
  it('shows the logo image, not the old icon and wordmark', () => {
    const { container } = render(<Footer />)
    const logo = screen.getByRole('img', { name: `${COMPANY_INFO.name} logo` })
    expect(logo.getAttribute('src')).toMatch(/logo\.png/)
    expect(container.querySelector('img[src*="icon.png"]')).toBeNull()
  })

  it('links each service to its own page and the address to the map', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    for (const s of SERVICES)
      expect(
        within(footer).getByRole('link', { name: s.shortTitle }),
      ).toHaveAttribute('href', `/services/${s.id}`)
    expect(
      within(footer).getByRole('link', { name: COMPANY_INFO.address }),
    ).toHaveAttribute('href', '/contact#map')
  })
})

describe('dedicated pages', () => {
  it('generates a page for every service and every project', () => {
    expect(serviceParams()).toEqual(SERVICES.map((s) => ({ slug: s.id })))
    expect(projectParams()).toEqual(PROJECTS.map((p) => ({ slug: p.slug })))
  })

  it.each(SERVICES.map((s) => s.id))(
    '/services/%s renders with one h1, its details and a way to enquire',
    async (id) => {
      const service = SERVICES.find(
        (s) => s.id === id,
      ) as (typeof SERVICES)[number]
      const { container } = render(
        await ServicePage({ params: Promise.resolve({ slug: id }) }),
      )
      expect(container.querySelectorAll('h1')).toHaveLength(1)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
        service.title,
      )
      for (const d of service.details)
        expect(container.textContent).toContain(d)
      const enquire = screen.getAllByRole('link', {
        name: /enquire about this service/i,
      })
      expect(enquire[0].getAttribute('href')).toBe(
        `/contact?service=${id}#enquiry`,
      )
    },
  )

  it.each(PROJECTS.map((p) => p.slug))(
    '/projects/%s renders as the project page',
    async (slug) => {
      const project = PROJECTS.find((p) => p.slug === slug) as Project
      const { container } = render(
        await ProjectPage({ params: Promise.resolve({ slug }) }),
      )
      expect(container.querySelectorAll('h1')).toHaveLength(1)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
        project.title,
      )
      expect(
        screen.getByRole('link', { name: /all projects/i }),
      ).toHaveAttribute('href', '/projects')
      expect(
        screen.queryByRole('link', { name: /ask about project/i }),
      ).toBeNull()
    },
  )

  it('404s for a slug that does not exist', async () => {
    await expect(
      ServicePage({ params: Promise.resolve({ slug: 'nope' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(
      ProjectPage({ params: Promise.resolve({ slug: 'nope' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('the services page links to every service’s page', () => {
    const { container } = render(<ServicesPage />)
    for (const s of SERVICES)
      expect(
        container.querySelector(`a[href="/services/${s.id}"]`),
      ).not.toBeNull()
  })
})

describe('office map (contact page)', () => {
  it('builds Google Maps URLs from the one published address', () => {
    const q = encodeURIComponent(COMPANY_INFO.address)
    expect(mapEmbedUrl(COMPANY_INFO.address)).toBe(
      `https://www.google.com/maps?q=${q}&output=embed`,
    )
    expect(mapSearchUrl(COMPANY_INFO.address)).toContain(`query=${q}`)
    expect(mapDirectionsUrl(COMPANY_INFO.address)).toContain(`destination=${q}`)
    expect(COMPANY_INFO.address).toMatch(/Lagos/) // "Ketu" alone is also a town in Ogun State
  })

  it('shows a placeholder first and loads Google only when asked', async () => {
    const { container } = render(<OfficeMap />)
    expect(container.querySelector('iframe')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: /load interactive map/i }),
    )
    const frame = container.querySelector('iframe') as HTMLIFrameElement
    expect(frame.src).toBe(mapEmbedUrl(COMPANY_INFO.address))
    expect(frame.title).toMatch(/office/i)
    expect(frame).toHaveAttribute('loading', 'lazy')
  })

  it('is on the contact page under #map with working directions links', () => {
    const { container } = render(<ContactPage />)
    expect(container.querySelector('section#map')).not.toBeNull()
    const directions = screen.getByRole('link', { name: /get directions/i })
    expect(directions).toHaveAttribute(
      'href',
      mapDirectionsUrl(COMPANY_INFO.address),
    )
    expect(directions).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('is disclosed in the privacy policy', () => {
    const { container } = render(<PrivacyPage />)
    expect(container.textContent).toMatch(/map/i)
    expect(container.textContent).toMatch(/google/i)
  })
})

describe('closing CTA (landing page)', () => {
  it('fades its content in on scroll, over the photo', () => {
    const { container } = render(<Home />)
    const fade = container.querySelector('[data-scroll-fade]')
    expect(fade).not.toBeNull()
    expect(fade?.textContent).toMatch(/join us in transforming agriculture/i)
    const card = fade?.closest('section > div') as HTMLElement
    expect(card.querySelector('img')).not.toBeNull()
  })

  it('shows the content straight away with reduced motion', () => {
    window.__reduceMotion = true
    const { container } = render(<Home />)
    const fade = container.querySelector('[data-scroll-fade]') as HTMLElement
    expect(fade.style.opacity).toBe('1')
    window.__reduceMotion = false
  })
})

describe('no stale content', () => {
  it('keeps act() quiet', async () => {
    await act(async () => {})
  })
})
