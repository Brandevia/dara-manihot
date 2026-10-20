import { ArrowLeft, ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Stagger, StaggerItem } from '@/components/animations'
import { CtaBand } from '@/components/sections/cta-band'
import { ProjectFeature } from '@/components/sections/project-feature'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO } from '@/lib/constants'
import { getProject, PROJECTS } from '@/lib/projects'

type Props = { params: Promise<{ slug: string }> }

// Only the projects in lib/projects.ts exist; any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  if (!project) return {}
  return { title: project.title, description: project.description }
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project) notFound()

  const others = PROJECTS.filter((p) => p.slug !== project.slug)

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2rem)] pb-(--section-y)">
        <div className="page-container">
          <Link
            href="/projects"
            className="mb-10 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden className="size-4" />
            All projects
          </Link>
          <ProjectFeature project={project} asPage />
        </div>
      </section>

      {others.length > 0 && (
        <section
          aria-labelledby="more-projects-title"
          className="pb-(--section-y)"
        >
          <div className="page-container">
            <SectionHeading id="more-projects-title" title="More projects" />
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {others.map((other) => (
                <StaggerItem key={other.slug}>
                  <Link
                    href={`/projects/${other.slug}`}
                    className="group/more flex h-full items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 outline-none transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span>
                      <span className="block font-display text-xl">
                        {other.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {other.goal}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-5 shrink-0 text-primary transition-transform duration-200 group-hover/more:translate-x-0.5 group-hover/more:-translate-y-0.5"
                    />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <CtaBand
        title="Interested in this project?"
        description="Tell us what you would like to know, or how you could take part. We’ll get back to you with the details."
      >
        <Button asChild variant="cta" size="lg">
          <Link href="/contact#enquiry">
            <Mail />
            Get in touch
            <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <a href={`tel:${COMPANY_INFO.phones[0].tel}`}>Schedule a call</a>
        </Button>
      </CtaBand>
    </>
  )
}
