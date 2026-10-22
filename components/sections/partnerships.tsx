import {
  Building2,
  Globe,
  GraduationCap,
  type LucideIcon,
  Users,
} from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'

interface Partnership {
  icon: LucideIcon
  title: string
  description: string
}

export const PARTNERSHIPS: readonly Partnership[] = [
  {
    icon: GraduationCap,
    title: 'Academic & research institutions',
    description:
      'Providing technical expertise, research support, and training capacity',
  },
  {
    icon: Building2,
    title: 'Technical & development organizations',
    description:
      'Contributing specialized knowledge in renewable energy, water systems, and circular economy practices',
  },
  {
    icon: Users,
    title: 'Industrial partners',
    description:
      'Ensuring pathways for market adoption, scale-up, and commercialization',
  },
  {
    icon: Globe,
    title: 'Government & community stakeholders',
    description:
      'Enabling regulatory alignment, local engagement, and shared ownership of outcomes',
  },
]

/**
 * Strategic partnerships: a mint section, a label and a headline, then four
 * white tiles. The tiles stay put; their contents fade in on scroll.
 */
export function PartnershipsSection() {
  return (
    <section aria-labelledby="partnerships-title" className="bg-mint section-y">
      <div className="page-container">
        <Reveal className="mb-12 max-w-4xl">
          <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Strategic partnerships
          </p>
          <h2 id="partnerships-title" className="mt-4 text-title text-canopy">
            Collaborating with leading organizations to amplify our impact
          </h2>
        </Reveal>

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {PARTNERSHIPS.map(({ icon: Icon, title, description }) => (
            <div key={title} data-tile className="bg-background p-6 sm:p-8">
              <StaggerItem>
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-secondary-soft text-secondary"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-9 font-sans text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-muted-foreground">{description}</p>
              </StaggerItem>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
