import { Award, type LucideIcon, Target, TrendingUp, Users } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { cn } from '@/lib/utils'

interface ImpactGoal {
  icon: LucideIcon
  title: string
  description: string
}

export const IMPACT_GOALS: readonly ImpactGoal[] = [
  {
    icon: Target,
    title: '2030 vision',
    description:
      'Establish a network of sustainable agro-industrial hubs across Nigeria and West Africa',
  },
  {
    icon: Users,
    title: 'Community impact',
    description:
      'Create green jobs and empower women and youth in sustainable practices',
  },
  {
    icon: TrendingUp,
    title: 'Scale achievement',
    description:
      'Enable thousands of farmers and agro-enterprises to adopt climate-smart practices',
  },
  {
    icon: Award,
    title: 'Global alignment',
    description:
      'Projects designed to align with global and national sustainability goals (SDGs 1, 7, 9, and 13)',
  },
]

/**
 * Impact goals: heading and intro on the left, four tiles on the right. The
 * first tile (the 2030 vision) is the deep-green one. The tiles stay put and
 * their contents fade in on scroll.
 */
export function ImpactGoalsSection() {
  return (
    <section aria-labelledby="impact-title" className="section-y">
      <div className="page-container grid items-center gap-12 lg:grid-cols-[1fr_1.75fr] lg:gap-16">
        <Reveal>
          <h2 id="impact-title" className="text-title text-canopy">
            Our impact goals
          </h2>
          <p className="mt-5 max-w-md text-lead text-muted-foreground">
            We’re committed to creating measurable, sustainable impact that
            transforms communities and drives Nigeria’s green transition
            forward.
          </p>
        </Reveal>

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {IMPACT_GOALS.map(({ icon: Icon, title, description }, i) => {
            const featured = i === 0
            return (
              <div
                key={title}
                data-tile
                data-featured={featured || undefined}
                className={cn(
                  'min-h-64 p-6 sm:p-8',
                  featured
                    ? 'bg-canopy text-canopy-foreground'
                    : 'bg-mint text-foreground',
                )}
              >
                <StaggerItem>
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-secondary-soft text-secondary"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-9 font-sans text-xl font-semibold">
                    {title}
                  </h3>
                  <p
                    className={cn(
                      'mt-2',
                      featured ? 'text-canopy-muted' : 'text-muted-foreground',
                    )}
                  >
                    {description}
                  </p>
                </StaggerItem>
              </div>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
