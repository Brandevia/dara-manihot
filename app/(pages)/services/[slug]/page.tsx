import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Stagger,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from '@/components/animations'
import { CtaBand } from '@/components/sections/cta-band'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO, PAGE_HERO_IMAGES } from '@/lib/constants'
import { getPillarServices, PILLARS, SERVICES } from '@/lib/services'

type Props = { params: Promise<{ slug: string }> }

const findService = (slug: string) => SERVICES.find((s) => s.id === slug)

// Only the services in lib/services.ts exist; any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = findService((await params).slug)
  if (!service) return {}
  return { title: service.title, description: service.description }
}

export default async function ServicePage({ params }: Props) {
  const service = findService((await params).slug)
  if (!service) notFound()

  const pillar = PILLARS.find((p) => p.id === service.pillar)
  const related = getPillarServices(service.pillar).filter(
    (s) => s.id !== service.id,
  )
  const enquiry = {
    pathname: '/contact',
    query: { service: service.id },
    hash: 'enquiry',
  } as const

  return (
    <>
      <PageHero
        title={service.title}
        description={service.description}
        image={PAGE_HERO_IMAGES.pillars[service.pillar]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="cta" size="lg">
            <Link href={enquiry}>
              Enquire about this service
              <ArrowRight className="transition-transform group-hover/button:translate-x-1 group-active/button:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="onDark" size="lg">
            <Link href="/services">
              <ArrowLeft />
              All services
            </Link>
          </Button>
        </div>
      </PageHero>

      <section aria-labelledby="deliver-title" className="section-y">
        <div className="page-container">
          <SectionHeading
            id="deliver-title"
            title="What we deliver"
            description={
              pillar
                ? `Part of our ${pillar.title.toLowerCase()} work. ${pillar.summary}`
                : undefined
            }
          />
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {service.details.map((detail) => (
              <StaggerItem
                key={detail}
                className="flex gap-3 rounded-xl border border-border bg-card p-6"
              >
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-secondary"
                />
                <p className="leading-relaxed">{detail}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="pb-(--section-y)">
          <div className="page-container">
            <SectionHeading
              id="related-title"
              title={`More in ${pillar?.title ?? 'this area'}`}
            />
            <StaggerList className="grid gap-4 sm:grid-cols-2">
              {related.map((other) => (
                <StaggerListItem key={other.id}>
                  <Link
                    href={`/services/${other.id}`}
                    className="group/more flex h-full items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 outline-none transition-[translate,scale,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span>
                      <span className="block font-display text-xl">
                        {other.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {other.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-5 shrink-0 text-secondary transition-transform duration-200 group-hover/more:translate-x-0.5 group-hover/more:-translate-y-0.5 group-active/more:translate-x-0.5 group-active/more:-translate-y-0.5"
                    />
                  </Link>
                </StaggerListItem>
              ))}
            </StaggerList>
          </div>
        </section>
      )}

      <CtaBand
        title={`Talk to us about ${service.shortTitle.toLowerCase()}`}
        description="Tell us about your farm, plant or project and we’ll recommend where to start."
      >
        <Button asChild variant="cta" size="lg">
          <Link href={enquiry}>Enquire about this service</Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <a href={`tel:${COMPANY_INFO.phones[0].tel}`}>
            Call {COMPANY_INFO.phones[0].display}
          </a>
        </Button>
      </CtaBand>
    </>
  )
}
