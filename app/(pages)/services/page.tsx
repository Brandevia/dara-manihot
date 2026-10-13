import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Reveal,
  Stagger,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from '@/components/animations'
import { CtaBand } from '@/components/sections/cta-band'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'
import { SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Renewable energy, biomass gasification, green hydrogen, circular economy solutions and training for sustainable agriculture and industry.',
}

const processSteps = [
  {
    title: 'Assessment & planning',
    description:
      'We conduct thorough assessments of your current operations, energy needs, and waste streams to develop tailored solutions.',
  },
  {
    title: 'Design & engineering',
    description:
      'Our team designs comprehensive systems that integrate seamlessly with your existing operations.',
  },
  {
    title: 'Implementation & installation',
    description:
      'We handle all aspects of system installation, commissioning, and initial operation.',
  },
  {
    title: 'Training & handover',
    description:
      'Comprehensive training ensures your team can operate and maintain systems effectively.',
  },
  {
    title: 'Ongoing support',
    description:
      'We provide continuous technical support, maintenance services, and system optimization.',
  },
]

const projectSupport = [
  {
    title: 'Feasibility assessments',
    description: 'Technical, financial, and regulatory analysis',
  },
  {
    title: 'Permitting assistance',
    description: 'Liaising with authorities to secure necessary approvals',
  },
  {
    title: 'Stakeholder engagement',
    description:
      'Facilitating alignment with communities, partners, and government agencies',
  },
  {
    title: 'Monitoring & evaluation',
    description: 'Tracking performance, social impact, and carbon savings',
  },
  {
    title: 'Financial structuring',
    description:
      'Support in accessing financing and developing viable business models',
  },
  {
    title: 'Policy & regulatory support',
    description:
      'Guidance on compliance and engagement with regulatory frameworks',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Our services"
        description="From renewable energy systems to circular economy solutions, we provide end-to-end services that transform agricultural operations and industrial processes for sustainability and profitability."
      />

      <section className="section-y">
        <div className="page-container">
          <SectionHeading
            title="What we offer"
            description="Our comprehensive suite of services covers every aspect of sustainable agricultural and industrial transformation."
          />
          <Stagger className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <StaggerItem key={service.id}>
                <Card
                  id={service.id}
                  className="scroll-mt-header h-full gap-5 p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <service.icon className="size-6" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl">{service.title}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-auto space-y-2.5 border-t border-border pt-5">
                    {service.details.map((detail) => (
                      <li key={detail} className="flex gap-2.5 text-sm">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Process: a real sequence, so numbered */}
      <section className="section-y bg-muted">
        <div className="page-container">
          <SectionHeading
            title="Our process"
            description="We follow a proven methodology to ensure successful project delivery and sustainable outcomes."
          />
          <ol className="max-w-3xl space-y-8">
            {processSteps.map((step, i) => (
              <li key={step.title}>
                <Reveal className="flex gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl">{step.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Project support */}
      <section className="section-y">
        <div className="page-container grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionHeading title="Project support services" className="mb-6" />
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Beyond technical implementation, we provide comprehensive
                project support to ensure successful outcomes and long-term
                sustainability.
              </p>
              <Button asChild variant="cta" size="lg" className="mt-8">
                <Link href="/contact">Get started today</Link>
              </Button>
            </Reveal>
          </div>

          <StaggerList className="grid gap-4 sm:grid-cols-2">
            {projectSupport.map((support) => (
              <StaggerListItem
                key={support.title}
                className="h-full rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40"
              >
                <h3 className="font-display text-lg">{support.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {support.description}
                </p>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <CtaBand
        title="Ready to transform your operations?"
        description="Let us help you build a more sustainable, profitable, and resilient business with our proven solutions and expertise."
      >
        <Button asChild variant="cta" size="lg">
          <Link href="/contact">Schedule a consultation</Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <a href={`mailto:${COMPANY_INFO.email}?subject=Proposal%20request`}>
            Request a proposal
          </a>
        </Button>
      </CtaBand>
    </>
  )
}
