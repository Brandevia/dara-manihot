import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ContactPage from '@/app/(pages)/contact/page'
import PrivacyPage from '@/app/(pages)/privacy/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import ServicePage from '@/app/(pages)/services/[slug]/page'
import ServicesPage from '@/app/(pages)/services/page'
import TermsPage from '@/app/(pages)/terms/page'
import { PageHero } from '@/components/sections/page-hero'
import { PAGE_HERO_IMAGES } from '@/lib/constants'
import { SERVICES } from '@/lib/services'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

const hero = (container: HTMLElement) =>
  container.querySelector('[data-page-hero]') as HTMLElement | null

describe('PageHero', () => {
  it('with an image: shows the photo under a translucent green overlay', () => {
    const { container } = render(
      <PageHero
        title="T"
        description="D"
        image={{ src: '/images/hero/image1.png', position: '10% 20%' }}
      />,
    )
    const root = hero(container) as HTMLElement
    const img = root.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/images/hero/image1.png')
    expect(img.getAttribute('alt')).toBe('') // decorative
    expect(img.style.objectPosition).toBe('10% 20%')
    expect(root.querySelector('.bg-page-hero-overlay')).not.toBeNull()
    expect(root).toHaveAttribute('data-has-image', 'true')
  })

  it('with an image: the solid gradient background is gone, so the photo shows', () => {
    const { container } = render(
      <PageHero
        title="T"
        description="D"
        image={{ src: '/images/hero/image1.png' }}
      />,
    )
    expect(hero(container)).not.toHaveClass('bg-page-hero-gradient')
  })

  it('without an image: stays the solid green gradient, no img', () => {
    const { container } = render(<PageHero title="T" description="D" />)
    const root = hero(container) as HTMLElement
    expect(root).toHaveClass('bg-page-hero-gradient')
    expect(root.querySelector('img')).toBeNull()
    expect(root).not.toHaveAttribute('data-has-image')
  })

  it('keeps the heading, description and children above the image', () => {
    const { container } = render(
      <PageHero
        title="Heading"
        description="Lead"
        image={{ src: '/images/hero/image1.png' }}
      >
        <a href="/x">Go</a>
      </PageHero>,
    )
    expect(container.querySelector('h1')?.textContent).toBe('Heading')
    expect(container.textContent).toContain('Lead')
    expect(container.querySelector('a')?.textContent).toBe('Go')
    // The picture layers carry negative z-index; the text container does not.
    expect(container.querySelector('img')?.className).toContain('-z-20')
  })
})

describe('inner pages show a hero image, under the gradient', () => {
  const pages: [string, () => React.ReactElement, string][] = [
    ['/about', () => <AboutPage />, PAGE_HERO_IMAGES.about.src],
    ['/services', () => <ServicesPage />, PAGE_HERO_IMAGES.services.src],
    ['/projects', () => <ProjectsPage />, PAGE_HERO_IMAGES.projects.src],
    ['/privacy', () => <PrivacyPage />, PAGE_HERO_IMAGES.legal.src],
    ['/terms', () => <TermsPage />, PAGE_HERO_IMAGES.legal.src],
  ]

  it.each(pages)('%s', (_path, make, src) => {
    const { container } = render(make())
    const root = hero(container) as HTMLElement
    expect(root.querySelector('img')?.getAttribute('src')).toBe(src)
    expect(root.querySelector('.bg-page-hero-overlay')).not.toBeNull()
  })

  it.each(SERVICES.map((s) => [s.id, s.pillar]))(
    '/services/%s uses its pillar image',
    async (id, pillar) => {
      const { container } = render(
        await ServicePage({ params: Promise.resolve({ slug: id }) }),
      )
      const expected =
        PAGE_HERO_IMAGES.pillars[pillar as keyof typeof PAGE_HERO_IMAGES.pillars]
      expect(
        (hero(container) as HTMLElement)
          .querySelector('img')
          ?.getAttribute('src'),
      ).toBe(expected.src)
    },
  )

  it('/contact has no banner, so no hero image either', () => {
    const { container } = render(<ContactPage />)
    expect(hero(container)).toBeNull()
  })
})
