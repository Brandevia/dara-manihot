import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { Button } from '@/components/ui/button'
import { HERO_SLIDES } from '@/lib/constants'

/**
 * The page-load moment: headline, lead and CTAs rise in on a short CSS
 * sequence (no JS, so it runs before hydration and works without it).
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[max(34rem,calc(100svh-var(--header-h)))] items-center overflow-hidden"
    >
      <HeroCarousel slides={HERO_SLIDES} />

      <div className="page-container relative z-10 pt-12 pb-36 sm:pb-32">
        <div className="max-w-3xl text-canopy-foreground">
          <h1
            id="home-hero-title"
            className="animate-rise text-display motion-reduce:animate-none"
          >
            Empowering Africa’s{' '}
            <span className="whitespace-nowrap">agro-industry</span> with clean
            solutions
          </h1>
          <p className="animate-rise animation-delay-150 mt-6 max-w-xl text-lead text-canopy-foreground/90 motion-reduce:animate-none">
            At Dara-Manihot Industries &amp; Farms, we’re transforming
            agriculture and industry—creating resilient communities, competitive
            businesses, and a greener future for Nigeria and beyond.
          </p>
          <div className="animate-rise animation-delay-300 mt-9 flex flex-col gap-3 sm:flex-row motion-reduce:animate-none">
            <Button asChild variant="cta" size="lg">
              <Link href="/services">
                Explore our services
                <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <Link href="/projects">View our projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
