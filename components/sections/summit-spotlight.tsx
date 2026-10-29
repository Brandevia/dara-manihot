import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { CountUp } from '@/components/count-up'
import { Button } from '@/components/ui/button'
import {
  formatSummitDate,
  SUMMIT,
  SUMMIT_FIGURES,
  SUMMIT_GALLERY,
} from '@/lib/summit'

// The three figures that fit a teaser; the full set lives on /projects#summit.
const TEASER = SUMMIT_FIGURES.slice(0, 3)
const COVER = SUMMIT_GALLERY[0]

/**
 * Landing-page teaser for the summit talk: a photo beside the headline
 * results, with one primary action that leads to the full write-up.
 */
export function SummitSpotlight() {
  return (
    <section
      aria-labelledby="summit-spotlight-title"
      className="section-y bg-muted"
    >
      <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <figure className="rounded-[2rem] bg-background p-3 shadow-lift">
            <Image
              src={COVER.src}
              alt={COVER.alt}
              width={COVER.width}
              height={COVER.height}
              sizes="(min-width: 1216px) 584px, (min-width: 1024px) 45vw, 100vw"
              style={{ objectPosition: COVER.position }}
              className="aspect-[4/3] w-full rounded-2xl object-cover outline -outline-offset-1 outline-black/10"
            />
            <figcaption className="px-3 pt-3 pb-1 text-sm text-muted-foreground">
              {SUMMIT.name} · {formatSummitDate(SUMMIT.date)}
            </figcaption>
          </figure>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
              In the spotlight
            </p>
            <h2 id="summit-spotlight-title" className="mt-3 text-title">
              Taking clean industry to the hydrogen summit
            </h2>
            <p className="mt-4 text-lead text-muted-foreground">
              Our CEO presented a practical path from solar savings to green
              hydrogen for Nigerian manufacturers, backed by a working
              microgrid.
            </p>
          </Reveal>

          <Stagger className="mt-8 grid gap-x-6 gap-y-6 min-[480px]:grid-cols-3">
            {TEASER.map((figure) => (
              <StaggerItem
                key={figure.label}
                className="border-t border-border pt-4"
              >
                <p className="font-display text-3xl text-primary sm:text-4xl">
                  <CountUp value={figure.value} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {figure.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <Button
              asChild
              variant="cta"
              size="lg"
              className="mt-9 rounded-full"
            >
              <Link href={SUMMIT.href}>
                See the roadmap and photos
                <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
