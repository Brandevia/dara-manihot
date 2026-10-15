import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Stagger, StaggerItem } from '@/components/animations'
import { PhotoSlot } from '@/components/photo-slot'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { PhotoSlotId } from '@/lib/imagery'
import { PILLARS } from '@/lib/services'

const IMAGE: Record<string, PhotoSlotId> = {
  'sustainable-agriculture': 'home-agriculture',
  'sustainable-energy': 'home-energy',
}

/**
 * The two headline offerings at equal weight, straight under the hero, so a
 * visitor sees both within the first scroll. The "supporting" group is left
 * out here; it has its own section on /services.
 */
export function PillarsSection() {
  const headline = PILLARS.filter((p) => p.id in IMAGE)
  return (
    <section aria-labelledby="pillars-title" className="section-y">
      <div className="page-container">
        <SectionHeading
          id="pillars-title"
          title="Sustainable agriculture and sustainable energy"
          description="Two connected solution areas that together transform how Nigerian farms and industries grow and power themselves."
        />
        <Stagger className="grid gap-6 lg:grid-cols-2">
          {headline.map((pillar) => (
            <StaggerItem key={pillar.id}>
              <Card className="h-full gap-0 overflow-hidden p-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                <PhotoSlot
                  id={IMAGE[pillar.id]}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="aspect-[16/9] rounded-none"
                />
                <div className="flex flex-1 flex-col gap-5 p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                      <pillar.icon className="size-6" aria-hidden />
                    </span>
                    <h3 className="text-2xl">{pillar.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{pillar.summary}</p>
                  <ul className="space-y-2.5">
                    {pillar.highlights.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="cta" className="mt-auto w-fit">
                    <Link href={`/services#${pillar.id}`}>
                      Learn more
                      <span className="sr-only"> about {pillar.title}</span>
                      <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
