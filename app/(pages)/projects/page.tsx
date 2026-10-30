import { Mail, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { StaggerList, StaggerListItem } from '@/components/animations'
import { CtaBand } from '@/components/sections/cta-band'
import { ImpactGoalsSection } from '@/components/sections/impact-goals'
import { PageHero } from '@/components/sections/page-hero'
import { PartnershipsSection } from '@/components/sections/partnerships'
import { ProjectFeature } from '@/components/sections/project-feature'
import { SectionHeading } from '@/components/sections/section-heading'
import { SummitSection } from '@/components/sections/summit-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO, PAGE_HERO_IMAGES } from '@/lib/constants'
import { PROJECTS } from '@/lib/projects'
import { TEAM } from '@/lib/team'

export const metadata: Metadata = {
  title: 'Projects & impact',
  description:
    'Flagship projects, strategic partnerships and impact goals driving Nigeria’s green agro-industrial transition.',
}

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        image={PAGE_HERO_IMAGES.projects}
        title="Our projects & impact"
        description="Discover how we’re transforming agriculture across Nigeria through innovative projects, strategic partnerships, and community-focused initiatives that create lasting change."
      />

      {/* Key projects */}
      <section aria-labelledby="key-projects-title" className="section-y">
        <div className="page-container">
          <SectionHeading
            id="key-projects-title"
            title="Key projects"
            description="Our flagship projects demonstrate the practical application of sustainable technologies in real-world agricultural settings."
          />
          <div className="space-y-24 sm:space-y-32">
            {PROJECTS.map((project) => (
              <ProjectFeature key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <SummitSection />

      <PartnershipsSection />

      <ImpactGoalsSection />

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
