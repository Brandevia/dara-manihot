import Image from 'next/image'
import { Reveal, StaggerList, StaggerListItem } from '@/components/animations'
import { SectionHeading } from '@/components/sections/section-heading'
import { SDG_GOALS, SDG_WHEEL } from '@/lib/constants'

export function SdgSection() {
  return (
    <section id="sdgs" aria-labelledby="sdg-title" className="section-y scroll-mt-header bg-muted">
      <div className="page-container grid items-start gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <Reveal>
            <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-card shadow-lift">
              <Image src={SDG_WHEEL.src} alt={SDG_WHEEL.alt} width={68} height={68} quality={85} className="size-[4.25rem]" />
            </div>
          </Reveal>
          <SectionHeading id="sdg-title" title="Aligned with the UN Sustainable Development Goals"
            description="Every project is designed to move the goals below forward, from clean energy on the farm to training the people who run it."
            className="mb-0" />
          <Reveal delay={0.1}>
            <p className="mt-6 text-sm text-muted-foreground">
              The Sustainable Development Goals are an initiative of the United Nations. This site has not been approved by the United Nations, and showing the icons does not imply UN endorsement.
            </p>
          </Reveal>
        </div>
        <StaggerList className="grid gap-4 sm:grid-cols-3">
          {SDG_GOALS.map((goal) => (
            <StaggerListItem key={goal.number} data-sdg={goal.number}
              className="flex gap-4 rounded-xl border border-border bg-card p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift sm:flex-col">
              <Image src={goal.icon} alt={`Sustainable Development Goal ${goal.number}: ${goal.title}`}
                width={96} height={96} sizes="80px" quality={85} className="size-20 shrink-0 rounded-lg" />
              <p className="text-sm leading-relaxed text-muted-foreground">{goal.contribution}</p>
            </StaggerListItem>
          ))}
        </StaggerList>
      </div>
    </section>
  )
}
