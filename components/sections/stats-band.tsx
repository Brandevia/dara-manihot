import { Stagger, StaggerItem } from '@/components/animations'
import { CountUp } from '@/components/count-up'

export interface Stat {
  value: string
  label: string
}

/**
 * Full-width band of headline figures that sits directly under the hero.
 * Two columns on phones, four from `lg`, with a hairline between neighbours.
 * Each figure counts up to its real value as it scrolls into view.
 */
export function StatsBand({ stats }: { stats: readonly Stat[] }) {
  return (
    <section aria-label="Dara-Manihot in numbers" className="bg-accent">
      <div className="page-container py-10 sm:py-12">
        <Stagger>
          <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="flex flex-col items-center px-4 text-center lg:border-l lg:border-border lg:first:border-l-0"
              >
                <dd className="order-1 font-display text-5xl text-canopy sm:text-6xl">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="order-2 mt-2 text-sm text-muted-foreground">
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
