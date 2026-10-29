import { Award, Leaf, Target, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Reveal,
  Stagger,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from '@/components/animations'
import { CountUp } from '@/components/count-up'
import { PhotoSlot } from '@/components/photo-slot'
import { CtaBand } from '@/components/sections/cta-band'
import { LeaderProfile } from '@/components/sections/leader-profile'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeading } from '@/components/sections/section-heading'
import { VisionMission } from '@/components/sections/vision-mission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CORE_VALUES, PAGE_HERO_IMAGES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About us',
  description:
    'For over a decade, Dara-Manihot has been transforming Africa’s agricultural landscape through innovative clean technologies and sustainable practices.',
}

const companyMilestones = [
  {
    year: '2014',
    title: 'Foundation',
    description:
      'Established with a vision to transform African agriculture through innovation',
  },
  {
    year: '2018',
    title: 'First major project',
    description:
      'Launched our first renewable energy integration in agricultural processing',
  },
  {
    year: '2021',
    title: 'Expansion',
    description: 'Extended operations across multiple Nigerian states',
  },
  {
    year: '2024',
    title: 'Innovation hub',
    description:
      'Became a leading voice in sustainable agro-industrial transformation',
  },
]

const companyStats = [
  {
    icon: Users,
    number: '500+',
    label: 'Farmers empowered',
    description: 'Directly impacted through our programs and technologies',
  },
  {
    icon: Award,
    number: '50+',
    label: 'Projects completed',
    description: 'Successful implementations across Nigeria',
  },
  {
    icon: Target,
    number: '5',
    label: 'States reached',
    description: 'Expanding our impact across Nigeria',
  },
  {
    icon: Leaf,
    number: '10+',
    label: 'Years of experience',
    description: 'A decade of expertise in sustainable agriculture',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        image={PAGE_HERO_IMAGES.about}
        title="Pioneering sustainable agriculture in Nigeria"
        description="For over a decade, we’ve been at the forefront of transforming Africa’s agricultural landscape through innovative clean technologies and sustainable practices."
      />

      {/* Leadership */}
      <section className="section-y">
        <div className="page-container grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading title="Our leadership" className="mb-0" />
          <Reveal
            delay={0.1}
            className="space-y-5 text-lg leading-relaxed text-muted-foreground"
          >
            <p>
              Dara-Manihot Industries &amp; Farms is guided by visionary
              leadership with over 15 years of experience in agricultural
              innovation and sustainable development. Our company was founded
              with the mission to revolutionize Africa’s agricultural sector
              through clean technologies and circular economy principles.
            </p>
            <p>
              Our leadership team brings together decades of expertise in
              agricultural transformation, renewable energy systems, and
              community development, driving our commitment to creating
              sustainable value chains across Nigeria and Africa.
            </p>
            <ul className="flex flex-wrap gap-2 pt-2">
              {[
                'Agricultural Innovation',
                'Clean Technology',
                'Leadership',
                'Sustainability',
              ].map((tag) => (
                <li key={tag}>
                  <Badge variant="soft" className="px-3 py-1 text-sm">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <LeaderProfile />

      {/* Leadership and field photography */}
      <section aria-label="Our people" className="pb-[var(--section-y)]">
        <div className="page-container grid gap-6 sm:grid-cols-2">
          <Reveal>
            <PhotoSlot
              id="about-leadership"
              sizes="(min-width: 1216px) 592px, 50vw"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <PhotoSlot
              id="about-field"
              sizes="(min-width: 1216px) 592px, 50vw"
            />
          </Reveal>
        </div>
      </section>

      {/* Mission & vision */}
      <VisionMission />

      {/* Core values */}
      <section className="section-y">
        <div className="page-container">
          <SectionHeading
            title="Our core values"
            description="These values guide our every decision and shape our approach to sustainable transformation."
          />
          <StaggerList className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {CORE_VALUES.map((value) => (
              <StaggerListItem
                key={value}
                className="border-l-2 border-primary pl-4 font-display text-xl"
              >
                {value}
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Journey: a real sequence, so a timeline */}
      <section className="section-y bg-muted">
        <div className="page-container">
          <SectionHeading
            title="Our journey"
            description="A decade of innovation, growth, and impact in sustainable agriculture."
          />
          <ol className="relative max-w-3xl space-y-10 border-l-2 border-border pl-8 sm:pl-10">
            {companyMilestones.map((milestone) => (
              <li key={milestone.year} className="relative">
                <Reveal>
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[2.6rem] size-4 rounded-full border-4 border-muted bg-primary sm:-left-[3.1rem]"
                  />
                  <p className="font-display text-3xl text-primary">
                    {milestone.year}
                  </p>
                  <h3 className="mt-1 text-xl">{milestone.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {milestone.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stats */}
      <section className="section-y">
        <div className="page-container">
          <SectionHeading title="Our impact by numbers" />
          <Stagger className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {companyStats.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="border-t border-border pt-6"
              >
                <stat.icon className="mb-4 size-7 text-secondary" aria-hidden />
                <p className="font-display text-5xl text-foreground">
                  <CountUp value={stat.number} />
                </p>
                <p className="mt-2 font-medium">{stat.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CtaBand
        title="Join us in transforming agriculture"
        description="Together, we can build a sustainable future where clean technologies power Africa’s agricultural transformation. Let’s create lasting impact for communities, businesses, and our planet."
      >
        <Button asChild variant="cta" size="lg">
          <Link href="/contact">Get in touch</Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <Link href="/projects">See our projects</Link>
        </Button>
      </CtaBand>
    </>
  )
}
