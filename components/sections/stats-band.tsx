import { Stagger, StaggerItem } from '@/components/animations'
import { CountUp } from '@/components/count-up'

export interface Stat {
  value: string
  label: string
}

/**
 * Full-width band of headline figures that sits directly under the hero.
 * One centred column on phones (each figure gets the room to count up in
 * view), two from `sm`, four from `lg`, with a hairline between neighbours.
 * Each figure counts up to its real value as it scrolls into view; the "+"
 * after it is purple (see `CountUp`).
 */
export function StatsBand({ stats }: { stats: readonly Stat[] }) {
  return (
    <section aria-label="Dara-Manihot in numbers" className="bg-muted">
      <div className="page-container py-12">
        <Stagger>
          <dl className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="flex flex-col items-center px-4 text-center lg:border-l lg:border-border lg:first:border-l-0"
              >
                <dd className="order-1 font-display text-5xl text-canopy sm:text-6xl">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="order-2 mt-2 text-base text-muted-foreground">
                  {stat.label}
                </dt>
              </StaggerItem>
            ))}
          </dl>
        </Stagger>
      </div>
    </section>
  )
}
