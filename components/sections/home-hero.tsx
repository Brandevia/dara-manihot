import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { Button } from '@/components/ui/button'
import { HERO_SLIDES } from '@/lib/constants'

/** Full-bleed from the top of the page; the floating navbar sits over it. */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[max(34rem,100svh)] items-center overflow-hidden"
    >
      <HeroCarousel slides={HERO_SLIDES} />

      <div className="relative z-10 w-full px-(--hero-pad) pt-[calc(var(--header-h)+3rem)] pb-36 sm:pt-[calc(var(--header-h)+6rem)] sm:pb-32">
        <div className="text-canopy-foreground">
          <h1
            id="home-hero-title"
            className="animate-rise text-on-photo max-w-3xl text-hero text-wrap motion-reduce:animate-none"
          >
            Empowering Africa’s Agro Industry with Clean Solutions
          </h1>
          <p className="animate-rise animation-delay-150 text-on-photo mt-5 max-w-200 text-[1.1rem] text-canopy-foreground leading-[1.55] motion-reduce:animate-none">
            At Dara-Manihot Industries &amp; Farms, we’re transforming
            agriculture and industry—creating resilient communities, competitive
            businesses, and a greener future for Nigeria and beyond.
          </p>
          <div className="animate-rise animation-delay-300 mt-8 flex flex-col gap-3 sm:flex-row motion-reduce:animate-none">
            <Button asChild variant="leaf" size="lg" className="rounded-full font-semibold text-lg">
              <Link href="/services">Explore Our Services</Link>
            </Button>
            <Button asChild variant="onDark" size="lg" className="rounded-full">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
