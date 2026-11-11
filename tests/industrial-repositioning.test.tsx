import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage, { metadata as aboutMeta } from '@/app/(pages)/about/page'
import ContactPage, {
  metadata as contactMeta,
} from '@/app/(pages)/contact/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import ServicePage from '@/app/(pages)/services/[slug]/page'
import ServicesPage, {
  metadata as servicesMeta,
} from '@/app/(pages)/services/page'
import Home from '@/app/page'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/sections/home-hero'
import { PillarsSection } from '@/components/sections/pillars'
import { WhoWeAre } from '@/components/sections/who-we-are'
import { COMPANY_INFO, HERO_SLIDES, PAGE_HERO_IMAGES } from '@/lib/constants'
import { SERVICE_OPTIONS } from '@/lib/enquiry'
import { PHOTO_SLOTS } from '@/lib/imagery'
import { getPillarServices, PILLARS, SERVICES } from '@/lib/services'
import { listFiles, ROOT, readSource } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

/**
 * The "Website enhancement review": the site now leads with industry, and
 * sustainable energy is the pathway that serves green industries and
 * sustainable agriculture. These tests pin the new positioning so the old
 * agriculture-first copy and order cannot quietly come back.
 */

describe('hero', () => {
  it('leads with agribusiness and industries, powered by clean energy', () => {
    render(<HomeHero />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Empowering Africa’s Agribusiness and Industries with Clean Energy Innovations',
    )
  })

  it('introduces the company as transforming industry and agriculture', () => {
    const { container } = render(<HomeHero />)
    const intro = container.querySelector('p.text-on-photo') as HTMLElement
    expect(intro.textContent?.replace(/\s+/g, ' ')).toBe(
      'At Dara-Manihot Industries, we’re transforming industry and agriculture, creating competitive businesses, resilient communities, and a greener future for Africa and beyond.',
    )
  })

  it('names industries in the first carousel caption', () => {
    expect(HERO_SLIDES[0].caption).toBe(
      'Industries and Farms powered by clean energy',
    )
  })

  it('no longer says "Agro Industry" or "Nigeria and beyond"', () => {
    const { container } = render(<HomeHero />)
    expect(container.textContent).not.toMatch(
      /Agro Industry|Nigeria and beyond/,
    )
  })
})

describe('pillars: energy first, then the two areas it serves', () => {
  it('orders energy, green industries, agriculture, training and research', () => {
    expect(PILLARS.map((p) => p.id)).toEqual([
      'sustainable-energy',
      'green-industries',
      'sustainable-agriculture',
      'supporting',
    ])
    expect(PILLARS.map((p) => p.title)).toEqual([
      'Sustainable Energy',
      'Green Industries',
      'Sustainable Agriculture',
      'Training & Research',
    ])
  })

  it('has the new Training & Research summary', () => {
    const supporting = PILLARS.find((p) => p.id === 'supporting')
    expect(supporting?.summary).toBe(
      'Capacity building and R&D that support integrating sustainable energy with green industries and sustainable agriculture, establishing long-term local energy solutions.',
    )
  })

  it('gives every pillar at least one service, and every service a real pillar', () => {
    for (const pillar of PILLARS)
      expect(getPillarServices(pillar.id).length, pillar.id).toBeGreaterThan(0)
    const ids = new Set(PILLARS.map((p) => p.id))
    for (const s of SERVICES) expect(ids.has(s.pillar), s.id).toBe(true)
  })

  it('has a banner image for every pillar, including green industries', () => {
    for (const pillar of PILLARS)
      expect(PAGE_HERO_IMAGES.pillars[pillar.id], pillar.id).toBeTruthy()
  })

  it('gives every pillar highlights for its card', () => {
    for (const pillar of PILLARS)
      expect(pillar.highlights.length, pillar.id).toBeGreaterThanOrEqual(2)
  })
})

describe('home: the pillars section', () => {
  it('has the new heading and description', () => {
    render(<PillarsSection />)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Sustainable Energy for Green Industries and Sustainable Agriculture',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Two connected solution areas that together transform how industries and agriculture grow and power themselves sustainably.',
      ),
    ).toBeInTheDocument()
  })

  it('shows three cards in order: energy, green industries, agriculture', () => {
    render(<PillarsSection />)
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      'Sustainable Energy',
      'Green Industries',
      'Sustainable Agriculture',
    ])
  })

  it('gives each card its own photo slot, in the same order', () => {
    const { container } = render(<PillarsSection />)
    expect(
      [...container.querySelectorAll('[data-photo-slot]')].map((n) =>
        n.getAttribute('data-photo-slot'),
      ),
    ).toEqual(['home-energy', 'home-industry', 'home-agriculture'])
  })

  it('lays three cards across from lg, so none is orphaned', () => {
    const { container } = render(<PillarsSection />)
    const grid = container.querySelector('.grid') as HTMLElement
    expect(grid).toHaveClass('lg:grid-cols-3')
    expect(grid.className).not.toMatch(/lg:grid-cols-2/)
  })

  it('links each card to its section on /services', () => {
    render(<PillarsSection />)
    const hrefs = screen
      .getAllByRole('link', { name: /learn more/i })
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual([
      '/services#sustainable-energy',
      '/services#green-industries',
      '/services#sustainable-agriculture',
    ])
  })

  it('has a home-industry photo slot that points at a real illustration and describes it', () => {
    const slot = PHOTO_SLOTS.find((s) => s.id === 'home-industry')
    expect(slot?.page).toBe('home')
    expect(slot?.src).toMatch(/^\/images\/hero\/image\d+\.png$/)
    expect(slot?.alt.length).toBeGreaterThan(20)
  })
})

describe('home: who we are', () => {
  it('uses the African, clean-energy-access statement', () => {
    const { container } = render(<WhoWeAre />)
    const text = container.querySelector('p.text-intro')?.textContent
    expect(text?.replace(/\s+/g, ' ')).toBe(
      'Dara-Manihot Industries & Farms is a leading African enterprise redefining clean energy access, green industry, and agriculture through advanced clean technologies. We combine decades of agricultural expertise with cutting-edge renewable energy, green hydrogen systems, and circular economy practices to unlock new opportunities for industries, processors, and farmers.',
    )
    expect(container.textContent).not.toMatch(/Nigerian enterprise/)
  })
})

describe('home: core impact areas', () => {
  const coreCards = () => {
    const { container } = render(<Home />)
    const heading = screen.getByRole('heading', { name: /core impact areas/i })
    const section = heading.closest('section') as HTMLElement
    return { container, cards: section.querySelectorAll('[data-slot="card"]') }
  }

  it('lists the five areas in the new order', () => {
    const { cards } = coreCards()
    expect(
      [...cards].map(
        (c) => c.querySelector('[data-slot="card-title"]')?.textContent,
      ),
    ).toEqual([
      'Renewable Energy Systems',
      'Green Industrial Value Chains',
      'Green Hydrogen for Agriculture & Industry',
      'Circular Economy Solutions',
      'Biomass Gasification & Valorization',
    ])
  })

  it('describes industrial decarbonization, and the hydrogen text now names industrial value chains', () => {
    const { cards } = coreCards()
    const text = [...cards].map((c) => c.textContent ?? '')
    expect(text[1]).toContain(
      'Supporting industrial decarbonization through business model innovation, technology, and process transitions to increase efficiency and reduce waste.',
    )
    expect(text[2]).toContain(
      'enable green fertilizer production, industrial value chains, and logistics decarbonization.',
    )
  })
})

describe('closing call to action', () => {
  const heading =
    'Join us in transforming Energy Access, Industry and Agriculture'
  const description =
    'Together, we can build a sustainable future where clean energy and innovative technologies power Africa’s industrial and agricultural transformation. Let’s create lasting impact for communities, businesses, and our planet.'

  it.each([
    ['home', () => <Home />],
    ['about', () => <AboutPage />],
  ])('%s page uses the new heading and description', (_n, make) => {
    const { container } = render(make())
    expect(
      screen.getByRole('heading', { level: 2, name: heading }),
    ).toBeInTheDocument()
    expect(container.textContent).toContain(description)
    expect(container.textContent).not.toMatch(/transforming agriculture/)
  })
})

describe('services: new order and the Green Industrial Value Chains service', () => {
  it('orders services so the footer reads energy, industry, hydrogen, circular, biomass, training, R&D', () => {
    expect(SERVICES.map((s) => s.id)).toEqual([
      'solar-renewables',
      'green-industrial-value-chains',
      'green-hydrogen',
      'circular-economy',
      'biomass-gasification',
      'capacity-building',
      'research-development',
    ])
  })

  it('defines the new service under green industries with the review wording', () => {
    const service = SERVICES.find(
      (s) => s.id === 'green-industrial-value-chains',
    )
    expect(service?.pillar).toBe('green-industries')
    expect(service?.title).toBe('Green Industrial Value Chains')
    expect(service?.shortTitle).toBe('Green Industrial Value Chains')
    expect(service?.description).toBe(
      'Supporting industrial decarbonization through business model innovation, technology, and process transitions to increase efficiency and reduce waste.',
    )
    expect(service?.details).toHaveLength(4)
  })

  it('renames biomass gasification to include valorization, keeping its URL', () => {
    const service = SERVICES.find((s) => s.id === 'biomass-gasification')
    expect(service?.title).toBe('Biomass Gasification & Valorization')
    expect(service?.shortTitle).toBe('Biomass Gasification & Valorization')
    expect(service?.pillar).toBe('sustainable-energy')
  })

  it('keeps the other service URLs unchanged, so existing links and footer links still work', () => {
    for (const id of [
      'solar-renewables',
      'green-hydrogen',
      'circular-economy',
      'biomass-gasification',
      'capacity-building',
      'research-development',
    ])
      expect(
        SERVICES.some((s) => s.id === id),
        id,
      ).toBe(true)
  })

  it('renders a section per pillar on /services, energy first', () => {
    const { container } = render(<ServicesPage />)
    const ids = [...container.querySelectorAll('section[id]')]
      .map((s) => s.id)
      .filter((id) => PILLARS.some((p) => p.id === id))
    expect(ids).toEqual([
      'sustainable-energy',
      'green-industries',
      'sustainable-agriculture',
      'supporting',
    ])
  })

  it('lists the pillars as jump links in the same order', () => {
    render(<ServicesPage />)
    const nav = screen.getByRole('navigation', { name: 'Service areas' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual([
      '#sustainable-energy',
      '#green-industries',
      '#sustainable-agriculture',
      '#supporting',
    ])
  })

  it('shows the new service card with an enquiry link that preselects it', () => {
    const { container } = render(<ServicesPage />)
    const card = container.querySelector(
      '#green-industrial-value-chains',
    ) as HTMLElement
    expect(card).not.toBeNull()
    expect(
      within(card)
        .getByRole('link', { name: /enquire about this service/i })
        .getAttribute('href'),
    ).toBe('/contact?service=green-industrial-value-chains#enquiry')
    expect(
      within(card)
        .getByRole('link', { name: /service details/i })
        .getAttribute('href'),
    ).toBe('/services/green-industrial-value-chains')
  })

  it('has its own page with one h1, its details and the green industries banner', async () => {
    const { container } = render(
      await ServicePage({
        params: Promise.resolve({ slug: 'green-industrial-value-chains' }),
      }),
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Green Industrial Value Chains',
    )
    const service = SERVICES.find(
      (s) => s.id === 'green-industrial-value-chains',
    )
    for (const d of service?.details ?? [])
      expect(container.textContent).toContain(d)
    expect(
      container.querySelector('[data-page-hero] img')?.getAttribute('src'),
    ).toBe(PAGE_HERO_IMAGES.pillars['green-industries'].src)
  })

  it('offers the new service in the enquiry form under Green Industries', () => {
    const option = SERVICE_OPTIONS.find(
      (o) => o.value === 'green-industrial-value-chains',
    )
    expect(option).toMatchObject({
      label: 'Green Industrial Value Chains',
      group: 'Green Industries',
    })
  })
})

describe('footer', () => {
  it('describes the company with the new statement', () => {
    const { container } = render(<Footer />)
    expect(COMPANY_INFO.description).toBe(
      'Dara-Manihot, a leading enterprise redefining sustainable energy in the green industry and sustainable agriculture through advanced innovation, processes, and clean technologies in Africa.',
    )
    expect(container.textContent).toContain(COMPANY_INFO.description)
  })

  it('lists services in the review order', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    const links = [
      ...footer.querySelectorAll<HTMLAnchorElement>('a[href^="/services/"]'),
    ]
    expect(links.map((a) => a.textContent)).toEqual([
      'Renewable Energy Systems',
      'Green Industrial Value Chains',
      'Green Hydrogen for Agriculture & Industry ',
      'Circular Economy Solutions',
      'Biomass Gasification & Valorization',
      'Capacity Building',
      'Research & Development',
    ])
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/services/solar-renewables',
      '/services/green-industrial-value-chains',
      '/services/green-hydrogen',
      '/services/circular-economy',
      '/services/biomass-gasification',
      '/services/capacity-building',
      '/services/research-development',
    ])
  })

  it('shows the Ikosi address and links it to the map', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: '40, Aladelola Street, Ikosi, Lagos, Nigeria' })
    expect(link).toHaveAttribute('href', '/contact#map')
  })
})

describe('address: Ikosi, Lagos', () => {
  it('is the one published address, with the city kept so the map search is specific', () => {
    expect(COMPANY_INFO.address).toBe('40, Aladelola Street, Ikosi, Lagos, Nigeria')
  })

  it('leaves no stale "Ketu" in the site source or the photo request', () => {
    const files = [
      ...listFiles('app', ['.ts', '.tsx']),
      ...listFiles('components', ['.ts', '.tsx']),
      ...listFiles('lib', ['.ts', '.tsx']),
    ]
    const offenders = files.filter((f) =>
      /\bKetu\b/.test(readSource(f.slice(ROOT.length + 1))),
    )
    expect(offenders).toEqual([])
    expect(readSource('docs/PHOTO-REQUEST.md')).not.toMatch(/\bKetu\b/)
  })
})

/**
 * Consistency pass: the review's wording only covered some sections. These
 * are the places that still led with agriculture, now ordered industry first.
 * History and the client's own vision and mission statements are deliberately
 * left alone (see the guard at the end).
 */
describe('consistency pass: metadata and share text lead with industry', () => {
  const layout = readSource('app/layout.tsx')

  it('has a default title and description for search and link previews', () => {
    expect(layout).toContain(
      "'Dara-Manihot Industries & Farms - Sustainable Energy for Green Industry & Agriculture'",
    )
    expect(layout).toContain(
      "'Sustainable energy for green industries and agriculture: clean technologies, circular economy, renewable energy and green hydrogen solutions in Nigeria and West Africa.'",
    )
    expect(layout).not.toMatch(/Sustainable Agriculture & Clean Energy/)
    expect(layout).not.toMatch(/Transforming Agriculture and Industry/)
  })

  it('has an industry-first tagline', () => {
    expect(COMPANY_INFO.tagline).toBe(
      'Transforming Industry and Agriculture through Clean Technologies',
    )
  })

  it('describes the Services, Contact and About pages with industry before agriculture', () => {
    expect(servicesMeta.description).toBe(
      'Renewable energy, green industrial value chains, green hydrogen, biomass gasification, circular economy solutions and training for green industry and sustainable agriculture.',
    )
    expect(contactMeta.description).toMatch(
      /renewable energy, green industry, sustainable agriculture and green hydrogen/,
    )
    expect(aboutMeta.description).toBe(
      'For over a decade, Dara-Manihot has been transforming Africa’s agricultural landscape, and today brings the same clean technologies to industry.',
    )
  })
})

describe('consistency pass: page copy', () => {
  it('about: the headline leads with clean energy for industry and agriculture, and keeps its history', () => {
    const { container } = render(<AboutPage />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Pioneering clean energy for industry and agriculture in Africa',
    )
    expect(container.textContent).toContain(
      'today we bring the same innovative clean technologies and sustainable practices to industry',
    )
    // The company's agricultural past is true and stays.
    expect(container.textContent).toContain(
      'Established with a vision to transform African agriculture through innovation',
    )
  })

  it('services: the intro, value-chain text and CTA put industry first', () => {
    const { container } = render(<ServicesPage />)
    const text = container.textContent?.replace(/\s+/g, ' ') ?? ''
    expect(text).toContain(
      'transform industrial processes and agricultural operations for sustainability and profitability',
    )
    expect(text).toContain(
      'so factories and farms draw on one clean supply chain',
    )
    expect(text).not.toMatch(/farms and factories draw/)
  })

  it('services detail page: the CTA says plant, farm or project', async () => {
    const { container } = render(
      await ServicePage({
        params: Promise.resolve({ slug: 'solar-renewables' }),
      }),
    )
    expect(container.textContent).toContain(
      'Tell us about your plant, farm or project',
    )
  })

  it('contact: leads with energy, names industrial operators, and trains industries first', () => {
    const { container } = render(<ContactPage />)
    const text = container.textContent?.replace(/\s+/g, ' ') ?? ''
    expect(text).toContain(
      'Ready to transform your industrial or agricultural operations with sustainable solutions?',
    )
    expect(text).toContain(
      'Whether you’re an industrial operator looking to cut energy costs, an agro-processor seeking renewable energy solutions, a farmer looking to adopt sustainable practices',
    )
    const reasons = [
      ...container.querySelectorAll('svg.lucide-circle-check ~ p'),
    ].map((p) => p.textContent)
    expect(reasons[0]).toBe(
      'Custom renewable energy system design and implementation',
    )
    expect(reasons).toContain(
      'Expert consultation on green industry and sustainable agriculture solutions',
    )
    expect(reasons).toContain(
      'Training programs for industries, agro-processors and farmers',
    )
  })

  it('projects: the intro and closing CTA name industry as well as agriculture', () => {
    const { container } = render(<ProjectsPage />)
    const text = container.textContent ?? ''
    expect(text).toContain(
      'transforming industry and agriculture across Nigeria',
    )
    expect(text).toContain(
      'sustainable future for Nigeria’s industry and agriculture',
    )
  })

  it('home: the core-areas intro, SDG intro and second slide caption follow suit', () => {
    const { container } = render(<Home />)
    expect(container.textContent).toContain(
      'sustainable transformation across industry and agriculture',
    )
    expect(container.textContent).toContain(
      'from clean energy in factories and on farms',
    )
    expect(HERO_SLIDES[1].caption).toBe(
      'Solar power for industries, farms and agro-processors',
    )
  })

  it('the energy pillar summary reads industries before farms', () => {
    expect(PILLARS[0].summary).toMatch(/for industries and farms\.$/)
  })
})
