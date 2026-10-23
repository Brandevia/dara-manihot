import {
  CloudLightning,
  HandHeart,
  Handshake,
  Lightbulb,
  type LucideIcon,
  TrendingUp,
} from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { cn } from '@/lib/utils'

interface Reason {
  icon: LucideIcon
  text: string
  /** Column span on the 12-column grid from `md`. */
  span: string
}

// Two rows: three equal cards, then a wide one beside a narrow one.
const REASONS: readonly Reason[] = [
  {
    icon: TrendingUp,
    text: 'Proven track record in agricultural transformation and project delivery.',
    span: 'md:col-span-4',
  },
  {
    icon: Lightbulb,
    text: 'Deep understanding of Nigeria’s agro-industrial challenges—and solutions that work.',
    span: 'md:col-span-4',
  },
  {
    icon: CloudLightning,
    text: 'Hands-on experience with renewable energy and hydrogen systems.',
    span: 'md:col-span-4',
  },
  {
    icon: Handshake,
    text: 'Partnerships with leading universities, technical partners, and government agencies.',
    span: 'md:col-span-8',
  },
  {
    icon: HandHeart,
    text: 'Commitment to empowering women and youth in green value chains.',
    span: 'md:col-span-4',
  },
]

/**
 * Who we are, and why to choose us: one mint section with the company
 * statement and five reasons on white tiles. The tiles are part of the page;
 * only their contents fade in as you scroll, so they arrive onto the card.
 * Each tile lifts and casts a soft shadow on hover (hover-capable devices only).
 */
export function WhoWeAre() {
  return (
    <section aria-labelledby="who-we-are-title" className="bg-mint section-y">
      <div className="page-container">
        <Reveal>
          <h2
            id="who-we-are-title"
            className="font-sans text-2xl font-bold text-secondary sm:text-3xl"
          >
            Who we are
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-4xl text-intro font-semibold text-muted-foreground sm:mt-12">
            Dara-Manihot Industries &amp; Farms is a leading Nigerian enterprise
            redefining sustainable agriculture and industry through advanced
            clean technologies. We combine decades of agricultural expertise
            with cutting-edge renewable energy, green hydrogen systems, and
            circular economy practices to unlock new opportunities for farmers,
            processors, and industries.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-3 md:grid-cols-12">
          {REASONS.map(({ icon: Icon, text, span }) => (
            <div
              key={text}
              data-tile
              className={cn(
                'flex min-h-64 flex-col bg-background p-6 transition-[box-shadow,translate] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-float motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                span,
              )}
            >
              <StaggerItem className="flex flex-1 flex-col justify-between gap-8">
                <Icon
                  aria-hidden
                  className="size-20 self-center text-secondary sm:size-24"
                />
                <p className="text-lg leading-snug text-muted-foreground">
                  {text}
                </p>
              </StaggerItem>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
