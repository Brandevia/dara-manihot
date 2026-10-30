import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ServicesPage from '@/app/(pages)/services/page'
import Home from '@/app/page'
import { PillarsSection } from '@/components/sections/pillars'
import { ProjectFeature } from '@/components/sections/project-feature'
import { StatsBand } from '@/components/sections/stats-band'
import { VisionMission } from '@/components/sections/vision-mission'
import { PROJECTS } from '@/lib/projects'
import { PILLARS, SERVICES } from '@/lib/services'
import { listFiles, readSource } from './helpers'

/** Source text of every component and page. */
const sources = () =>
  [...listFiles('components', ['.tsx']), ...listFiles('app', ['.tsx'])].map(
    (path) => ({
      path,
      src: readSource(path.slice(path.indexOf('/repo/') + 6)),
    }),
  )

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

/** Decorative glyphs that are not list ticks. */
const nonTickIcons = (root: Element) =>
  [...root.querySelectorAll('svg')].filter(
    (svg) => !svg.getAttribute('class')?.includes('lucide-circle-check'),
  )

describe('stats band (matches the phone screenshot)', () => {
  const stats = [
    { value: '500+', label: 'Farmers Empowered' },
    { value: '50+', label: 'Projects Delivered' },
    { value: '10+', label: 'Years of Experience' },
    { value: '5+', label: 'States Reached' },
  ]

  it('is one centred column on phones, two from sm, four from lg', () => {
    const { container } = render(<StatsBand stats={stats} />)
    const dl = container.querySelector('dl')
    expect(dl).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    expect(container.querySelector('section')).toHaveClass('bg-muted')
  })

  it('puts a purple plus after every figure, including 5+', () => {
    const { container } = render(<StatsBand stats={stats} />)
    const pluses = container.querySelectorAll('[data-plus]')
    expect(pluses).toHaveLength(4)
    for (const plus of pluses) expect(plus).toHaveClass('text-secondary')
  })

  it('the home page feeds it the four screenshot labels, each with a plus', () => {
    const { container } = render(<Home />)
    const band = container.querySelector('section[aria-label$="in numbers"]')
    expect(band).not.toBeNull()
    const text = band?.textContent ?? ''
    for (const label of [
      'Farmers Empowered',
      'Projects Delivered',
      'Years of Experience',
      'States Reached',
    ])
      expect(text).toContain(label)
    expect(band?.querySelectorAll('[data-plus]')).toHaveLength(4)
  })

  it('shows 5+ states on the About page too, with a purple plus', () => {
    const { container } = render(<AboutPage />)
    const plus = [...container.querySelectorAll('[data-plus]')]
    expect(plus.length).toBeGreaterThanOrEqual(1)
    for (const p of plus) expect(p).toHaveClass('text-secondary')
  })
})

describe('project feature (matches the phone screenshot)', () => {
  const project = PROJECTS[0]

  it('shows the date as a pale purple chip with purple text', () => {
    const { container } = render(<ProjectFeature project={project} />)
    const chip = container.querySelector('.bg-secondary-soft')
    expect(chip).not.toBeNull()
    expect(chip).toHaveClass('text-secondary', 'uppercase')
  })

  it('draws the "Ask about project" link in purple', () => {
    render(<ProjectFeature project={project} />)
    expect(
      screen.getByRole('link', { name: /ask about project/i }),
    ).toHaveClass('text-secondary')
  })
})

describe('icons removed, text is the centrepiece', () => {
  it('Our core impact areas: cards carry no icon, and the title is large', () => {
    const { container } = render(<Home />)
    const heading = screen.getByRole('heading', { name: /core impact areas/i })
    const section = heading.closest('section') as HTMLElement
    const cards = section.querySelectorAll('[data-slot="card"]')
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.querySelector('svg')).toBeNull()
      expect(card.querySelector('[data-slot="card-title"]')).toHaveClass(
        'text-2xl',
      )
    }
    expect(container).toBeTruthy()
  })

  it('Sustainable agriculture / energy cards: no icon chip, a large title', () => {
    const { container } = render(<PillarsSection />)
    const cards = container.querySelectorAll('[data-slot="card"]')
    // The home page shows the pillars that have a photograph.
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThanOrEqual(PILLARS.length)
    for (const card of cards) {
      expect(card.querySelector('.bg-secondary-soft')).toBeNull()
      expect(card.querySelector('h3')).toHaveClass('text-3xl')
      // Only list ticks and the "learn more" arrow remain.
      for (const svg of nonTickIcons(card))
        expect(svg.getAttribute('class')).toMatch(/arrow-right/)
    }
  })

  it('Services page: no icons in the jump links, pillar headers or cards', () => {
    const { container } = render(<ServicesPage />)
    for (const link of container.querySelectorAll('a[href^="#"]'))
      expect(link.querySelector('svg')).toBeNull()
    expect(container.querySelector('.bg-secondary-soft')).toBeNull()
    for (const card of container.querySelectorAll('[data-slot="card"]')) {
      expect(card.querySelector('h3')).toHaveClass('text-2xl')
      for (const svg of nonTickIcons(card))
        expect(svg.getAttribute('class')).toMatch(/arrow-right/)
    }
    // Every service is still there, as text.
    for (const service of SERVICES)
      expect(
        screen.getByRole('heading', { name: service.title }),
      ).toBeInTheDocument()
  })

  it('About: vision and mission have no icon, and the text is set large', () => {
    const { container } = render(<VisionMission />)
    for (const row of container.querySelectorAll('[data-row]')) {
      expect(row.querySelector('svg')).toBeNull()
      expect(row.querySelector('span[aria-hidden]')).toBeNull()
      expect(row.querySelector('h3')).toHaveClass('text-title')
      expect(row.querySelector('p')).toHaveClass('text-lead')
    }
  })

  it('the unused icon data is gone from lib/services', () => {
    for (const entry of [...PILLARS, ...SERVICES])
      expect(entry).not.toHaveProperty('icon')
    expect(readSource('lib/services.ts')).not.toMatch(/lucide-react/)
  })
})

describe('mobile motion', () => {
  it('no card lift names `transform` (Tailwind 4 lifts with `translate`, so it would snap)', () => {
    const offenders = sources().filter(({ src }) =>
      /transition-\[[^\]]*\btransform\b[^\]]*\][^"`]*-translate-y/.test(src),
    )
    expect(offenders.map((o) => o.path)).toEqual([])
  })

  it('the shared Button animates its press scale', () => {
    expect(readSource('components/ui/button.tsx')).toMatch(
      /transition-\[[^\]]*\bscale\b[^\]]*\]/,
    )
  })

  it('every button arrow that nudges on hover nudges on press too', () => {
    const missing = sources().filter(
      ({ src }) =>
        /group-hover\/button:translate-x-1/.test(src) &&
        !/group-active\/button:translate-x-1/.test(src),
    )
    expect(missing.map((m) => m.path)).toEqual([])
  })

  it('the pillar section stays reachable by its landmark', () => {
    render(<PillarsSection />)
    const cards = document.querySelectorAll('[data-slot="card"]')
    expect(
      within(document.body).getAllByRole('heading', { level: 3 }),
    ).toHaveLength(cards.length)
  })
})
