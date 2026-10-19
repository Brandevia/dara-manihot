import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Droplets,
  Flame,
  Recycle,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { PhotoSlot } from '@/components/photo-slot'
import { CtaBand } from '@/components/sections/cta-band'
import { HomeHero } from '@/components/sections/home-hero'
import { PillarsSection } from '@/components/sections/pillars'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SdgSection } from '@/components/sections/sdg-section'

const stats = [
  { value: '500+', label: 'Farmers empowered' },
  { value: '50+', label: 'Projects delivered' },
  { value: '10+', label: 'Years of experience' },
  { value: '5', label: 'States reached' },
]

const coreImpactAreas = [
  {
    icon: Recycle,
    title: 'Circular Economy Solutions',
    description:
      'Closing the loop in agro-industrial value chains by turning waste into valuable resources—reducing costs, boosting productivity, and minimizing environmental impact.',
  },
  {
    icon: Flame,
    title: 'Biomass Gasification & Biochar',
    description:
      'Converting agricultural residues into clean syngas for power and biochar for soil restoration, enhancing yields while cutting fossil fuel dependence.',
  },
  {
    icon: Sun,
    title: 'Renewable Energy Systems',
    description:
      'Designing and deploying solar PV and hybrid solutions that deliver reliable, affordable, and low-carbon power for farms, agro-processors, and rural industries.',
  },
  {
    icon: Droplets,
    title: 'Green Hydrogen for Agriculture & Industry',
    description:
      'Integrating hydrogen production from renewable energy to power processes, enable green fertilizer production, and decarbonize logistics.',
  },
  {
    icon: BookOpen,
    title: 'Capacity Building & Training',
    description:
      'Equipping communities, cooperatives, and enterprises with the knowledge and skills to adopt and scale sustainable practices, with a strong focus on gender inclusion.',
  },
]

const whyChooseUs = [
  'Proven track record in agricultural transformation and project delivery.',
  'Deep understanding of Nigeria’s agro-industrial challenges—and solutions that work.',
  'Hands-on experience with renewable energy and hydrogen systems.',
  'Commitment to empowering women and youth in green value chains.',
  'Partnerships with leading universities, technical partners, and government agencies.',
]

export default function Home() {
  return (
    <>
      <HomeHero />

      <PillarsSection />

      {/* Who we are */}
      <section className="section-y">
        <div className="page-container grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading title="Who we are" className="mb-6" />
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Dara-Manihot Industries &amp; Farms is a leading Nigerian
                enterprise redefining sustainable agriculture and industry
                through advanced clean technologies. We combine decades of
                agricultural expertise with cutting-edge renewable energy, green
                hydrogen systems, and circular economy practices to unlock new
                opportunities for farmers, processors, and industries.
              </p>
            </Reveal>
          </div>

          <Stagger>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-8">
              {stats.map((stat) => (
                <StaggerItem key={stat.label} className="flex flex-col">
                  <dt className="order-2 mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-5xl text-primary">
                    {stat.value}
                  </dd>
                </StaggerItem>
              ))}
            </dl>
          </Stagger>
        </div>
      </section>

      {/* Core impact areas */}
      <section className="section-y bg-muted">
        <div className="page-container">
          <SectionHeading
            title="Our core impact areas"
            description="We focus on five key areas that drive sustainable transformation across agriculture and industry."
          />
          <Stagger className="grid gap-6 md:grid-cols-6">
            {coreImpactAreas.map((area, i) => (
              <StaggerItem
                key={area.title}
                // Two wide cards on top, three across below: no orphan card.
                className={cn('md:col-span-3', i >= 2 && 'lg:col-span-2')}
              >
                <Card className="h-full gap-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <CardHeader>
                    <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                      <area.icon className="size-6" aria-hidden />
                    </span>
                    <CardTitle className="font-display text-xl font-normal">
                      {area.title}
                    </CardTitle>
                  </CardHeader>
                  <CardDescription className="px-6 text-base leading-relaxed">
                    {area.description}
                  </CardDescription>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-y">
        <div className="page-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading title="Why choose Dara-Manihot?" className="mb-8" />
            <Stagger className="space-y-5">
              {whyChooseUs.map((reason) => (
                <StaggerItem key={reason} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-6 shrink-0 text-primary"
                    aria-hidden
                  />
                  <p className="leading-relaxed text-muted-foreground">
                    {reason}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal>
            <PhotoSlot id="home-people" className="shadow-lift" />
          </Reveal>
        </div>
      </section>

      <SdgSection />

      {/* Vision */}
      <section className="bg-band-gradient section-y text-canopy-foreground">
        <div className="page-container">
          <Reveal className="max-w-4xl">
            <h2 className="text-title">Our vision for the future</h2>
            <p className="mt-6 font-display text-2xl leading-snug text-canopy-foreground/95 sm:text-3xl">
              An Africa where farms and factories thrive on clean, affordable
              energy, agricultural waste becomes a resource, not a burden, and
              farmers and entrepreneurs gain the tools to lead in a
              climate-smart economy.
            </p>
            <p className="mt-6 max-w-2xl text-lead text-canopy-foreground/80">
              At Dara-Manihot, we are proud to stand at the forefront of this
              transformation.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Ready to learn more?"
        description="Join us in transforming agriculture and industry through sustainable, innovative solutions."
      >
        <Button asChild variant="cta" size="lg">
          <Link href="/services">
            Explore our services
            <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <Link href="/contact">Contact us today</Link>
        </Button>
      </CtaBand>
    </>
  )
}
