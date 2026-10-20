import {
  ArrowRight,
  BookOpen,
  Droplets,
  Flame,
  Recycle,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import { Stagger, StaggerItem } from '@/components/animations'
import { CtaBand } from '@/components/sections/cta-band'
import { HomeHero } from '@/components/sections/home-hero'
import { PillarsSection } from '@/components/sections/pillars'
import { SdgSection } from '@/components/sections/sdg-section'
import { SectionHeading } from '@/components/sections/section-heading'
import { StatsBand } from '@/components/sections/stats-band'
import { VisionStatement } from '@/components/sections/vision-statement'
import { WhoWeAre } from '@/components/sections/who-we-are'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CTA_BAND_IMAGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

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

export default function Home() {
  return (
    <>
      <HomeHero />

      <StatsBand stats={stats} />

      <PillarsSection />

      <WhoWeAre />

      {/* Core impact areas */}
      <section className="section-y">
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

      <SdgSection />

      <VisionStatement />

      <CtaBand
        title="Join us in transforming agriculture"
        description="Together, we can build a sustainable future where clean technologies power Africa’s agricultural transformation. Let’s create lasting impact for communities, businesses, and our planet."
        image={CTA_BAND_IMAGE}
      >
        <Button asChild variant="cta" size="lg" className="rounded-full">
          <Link href="/services">
            Explore our services
            <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="onDark" size="lg" className="rounded-full">
          <Link href="/contact">Contact us</Link>
        </Button>
      </CtaBand>
    </>
  )
}
