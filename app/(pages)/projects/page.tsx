import {
  Award,
  Building2,
  Globe,
  GraduationCap,
  Mail,
  Recycle,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Stagger,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from '@/components/animations'
import { PhotoSlot } from '@/components/photo-slot'
import { CtaBand } from '@/components/sections/cta-band'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeading } from '@/components/sections/section-heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'
import type { PhotoSlotId } from '@/lib/imagery'
import { TEAM } from '@/lib/team'

export const metadata: Metadata = {
  title: 'Projects & impact',
  description:
    'Flagship projects, strategic partnerships and impact goals driving Nigeria’s green agro-industrial transition.',
}

const keyProjects = [
  {
    icon: Zap,
    title: 'Covenant University Green Energy Hub',
    subtitle: 'Advancing clean power for agriculture',
    description:
      'As a core partner in the CU green energy hub, we are driving the adoption of advanced renewable energy systems that replace fossil-fuel dependence in agricultural operations.',
    details:
      'Our role includes designing circular business models for green ammonia production, developing training programs, and supporting regulatory compliance to make sustainable energy a reality for farmers and agro-processors.',
    status: 'Active',
    photo: 'projects-green-energy-hub' as PhotoSlotId,
    impact: undefined as string | undefined,
  },
  {
    icon: Recycle,
    title: 'Circular Fertilizer Initiatives',
    subtitle: 'Reducing costs & emissions in farming',
    description:
      'We are developing innovative approaches to produce organic and green ammonia-based fertilizers locally, using agricultural residues and renewable hydrogen.',
    details:
      'These projects aim to reduce reliance on imported fertilizers, improve soil health, and make farming more profitable and sustainable for smallholders.',
    status: 'Development',
    photo: 'projects-circular-fertilizer' as PhotoSlotId,
    impact: '30% cost reduction target' as string | undefined,
  },
]

const partnerships = [
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

const impactGoals = [
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

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        title="Our projects & impact"
        description="Discover how we’re transforming agriculture across Nigeria through innovative projects, strategic partnerships, and community-focused initiatives that create lasting change."
      />

      {/* Key projects */}
      <section className="section-y">
        <div className="page-container">
          <SectionHeading
            title="Key projects"
            description="Our flagship projects demonstrate the practical application of sustainable technologies in real-world agricultural settings."
          />
          <Stagger className="space-y-6">
            {keyProjects.map((project) => (
              <StaggerItem key={project.title}>
                <Card className="gap-0 overflow-hidden p-0 transition-shadow duration-300 hover:shadow-lift">
                  <PhotoSlot
                    id={project.photo}
                    sizes="(min-width: 1280px) 1216px, 100vw"
                    className="aspect-[16/7] rounded-none"
                  />
                  <div className="grid lg:grid-cols-[1fr_17rem]">
                    <div className="space-y-4 p-7 sm:p-9">
                      <div className="flex items-center gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                          <project.icon className="size-6" aria-hidden />
                        </span>
                        <div>
                          <h3 className="text-2xl">{project.title}</h3>
                          <p className="font-medium text-primary">
                            {project.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed">
                        {project.description}
                      </p>
                      <p className="leading-relaxed text-muted-foreground">
                        {project.details}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-4 border-t border-border bg-muted p-7 lg:border-t-0 lg:border-l">
                      <Badge
                        variant={
                          project.status === 'Active' ? 'default' : 'soft'
                        }
                      >
                        {project.status}
                      </Badge>
                      {/* Only shown when there is an impact figure. */}
                      {project.impact && (
                        <p className="text-sm text-muted-foreground">
                          <strong className="font-semibold text-foreground">
                            Impact:
                          </strong>{' '}
                          {project.impact}
                        </p>
                      )}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-auto"
                      >
                        <a
                          href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(`Enquiry: ${project.title}`)}`}
                        >
                          <Mail />
                          Ask about this project
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Partnerships */}
      <section className="section-y bg-muted">
        <div className="page-container">
          <SectionHeading
            title="Strategic partnerships"
            description="We collaborate with leading organizations to amplify our impact and ensure sustainable solutions reach every corner of Nigeria."
          />
          <StaggerList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {partnerships.map((partnership) => (
              <StaggerListItem
                key={partnership.title}
                className="rounded-xl border border-border bg-card p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <partnership.icon
                  className="mb-4 size-8 text-primary"
                  aria-hidden
                />
                <h3 className="text-lg">{partnership.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {partnership.description}
                </p>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Impact goals */}
      <section className="section-y">
        <div className="page-container grid items-start gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionHeading title="Our impact goals" className="mb-6" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              We’re committed to creating measurable, sustainable impact that
              transforms communities and drives Nigeria’s green transition
              forward.
            </p>
            <PhotoSlot
              id="projects-community"
              sizes="(min-width: 1024px) 440px, 100vw"
              className="mt-8"
            />
          </div>
          <StaggerList className="grid gap-6 sm:grid-cols-2">
            {impactGoals.map((goal) => (
              <StaggerListItem
                key={goal.title}
                className="border-t-2 border-primary pt-5"
              >
                <goal.icon className="mb-3 size-6 text-primary" aria-hidden />
                <h3 className="text-xl">{goal.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {goal.description}
                </p>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Team */}
      <section className="section-y bg-muted">
        <div className="page-container">
          <SectionHeading
            title="Meet our team"
            description="Our diverse team brings together decades of experience in agriculture, renewable energy, and sustainable development."
          />
          <StaggerList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <StaggerListItem
                key={member.name}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={`Portrait of ${member.name}`}
                    width={160}
                    height={160}
                    className="mx-auto mb-4 size-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-accent text-primary">
                    <Users className="size-9" aria-hidden />
                  </span>
                )}
                <h3 className="text-lg">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  {member.role}
                </p>
                <p className="mt-2 mb-4 text-sm text-muted-foreground">
                  {member.description}
                </p>
                <Badge variant="soft">{member.expertise}</Badge>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <CtaBand
        title="Partner with us"
        description="Join us in building a sustainable future for Nigeria’s agriculture. Let’s discuss how we can work together to create lasting impact."
      >
        <Button asChild variant="cta" size="lg">
          <Link href="/contact">
            <Mail />
            Get in touch
          </Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <a href={`tel:${COMPANY_INFO.phones[0].tel}`}>Schedule a call</a>
        </Button>
      </CtaBand>
    </>
  )
}
