import { CalendarDays, Landmark, MapPin } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { CountUp } from '@/components/count-up'
import { SummitGallery } from '@/components/summit-gallery'
import { SummitPathway } from '@/components/summit-pathway'
import { AnimatedAccordion } from '@/components/ui/animated-accordion'
import {
  formatSummitDate,
  STAKEHOLDER_ASKS,
  SUMMIT,
  SUMMIT_FIGURES,
  SUMMIT_GALLERY,
  SUMMIT_SYSTEM,
} from '@/lib/summit'

const META = [
  { icon: CalendarDays, text: formatSummitDate(SUMMIT.date) },
  { icon: MapPin, text: SUMMIT.venue },
  { icon: Landmark, text: SUMMIT.organiser },
] as const

const SYSTEM_ROWS = [
  ['The system', SUMMIT_SYSTEM.capacity],
  ['Financing', SUMMIT_SYSTEM.financing],
  ['Developer', SUMMIT_SYSTEM.developer],
  ['Engineering partner', SUMMIT_SYSTEM.epc],
] as const

const subheading = 'text-2xl sm:text-3xl'

/**
 * /projects#summit: the CEO's talk at the ABUAD International Hydrogen Summit
 * 2.0, in the pattern peers in clean industrial energy use for a conference
 * recap: the headline results first, then the method, then what each audience
 * should do, then the photos.
 */
export function SummitSection() {
  const accordion = STAKEHOLDER_ASKS.map((ask) => ({
    id: ask.id,
    heading: ask.who,
    meta: `${ask.actions.length} priorities`,
    content: (
      <ul className="space-y-2 text-muted-foreground">
        {ask.actions.map((action) => (
          <li key={action} className="flex gap-3">
            <span
              aria-hidden
              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-secondary"
            />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    ),
  }))

  return (
    <section
      id="summit"
      aria-labelledby="summit-title"
      className="section-y scroll-mt-header bg-muted"
    >
      <div className="page-container">
        <Reveal className="max-w-4xl">
          <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Thought leadership · {SUMMIT.name}
          </p>
          <h2 id="summit-title" className="mt-4 text-title">
            {SUMMIT.talkTitle}
          </h2>
          <p className="mt-4 text-lead text-muted-foreground">
            {SUMMIT.talkSummary}
          </p>
          <ul className="mt-6 flex flex-col gap-x-8 gap-y-3 text-muted-foreground sm:flex-row sm:flex-wrap">
            {META.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <Icon
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-secondary"
                />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Results */}
        <div className="mt-14">
          <Reveal>
            <h3 className={subheading}>The proof: a working microgrid</h3>
          </Reveal>
          <Stagger className="mt-8 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {SUMMIT_FIGURES.map((figure) => (
              <div key={figure.label} data-tile className="bg-background p-6 ring-1 ring-border">
                <StaggerItem>
                  <p className="font-display text-4xl break-words text-primary sm:text-5xl">
                    <CountUp value={figure.value} />
                  </p>
                  <p className="mt-3 font-medium">{figure.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {figure.detail}
                  </p>
                </StaggerItem>
              </div>
            ))}
          </Stagger>
          <Reveal>
            <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {SYSTEM_ROWS.map(([term, detail]) => (
                <div key={term} className="border-t border-border pt-4">
                  <dt className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {term}
                  </dt>
                  <dd className="mt-2">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">
              Figures are those presented by Dara-Manihot at the summit for the
              ABUAD microgrid; the 25-year figure is a financial projection.
            </p>
          </Reveal>
        </div>

        {/* Method + audience */}
        <div className="mt-20 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <h3 className={`${subheading} mb-8`}>
                From solar savings to green hydrogen
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <SummitPathway />
            </Reveal>
          </div>
          <div>
            <Reveal>
              <h3 className={`${subheading} mb-4`}>
                What each partner can do next
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <AnimatedAccordion entries={accordion} />
            </Reveal>
          </div>
        </div>

        {/* Photos */}
        <div className="mt-20">
          <Reveal>
            <h3 className={`${subheading} mb-8`}>The summit in pictures</h3>
          </Reveal>
          <Reveal delay={0.1}>
            <SummitGallery images={SUMMIT_GALLERY} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
