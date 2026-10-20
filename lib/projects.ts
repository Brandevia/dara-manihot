import { type LucideIcon, Recycle, Zap } from 'lucide-react'
import type { PhotoSlotId } from '@/lib/imagery'

export type ProjectStatus = 'Active' | 'Development'

export interface Project {
  /** URL segment: /projects/<slug>. Lower-case letters, digits and hyphens. */
  slug: string
  icon: LucideIcon
  title: string
  /** The project's goal, in one line. */
  goal: string
  description: string
  details: string
  status: ProjectStatus
  photo: PhotoSlotId
  /** A headline impact figure. Omitted when there is none to claim. */
  impact?: string
  /** ISO date (YYYY-MM-DD) shown on the project. Omitted when unknown. */
  date?: string
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'covenant-university-green-energy-hub',
    icon: Zap,
    title: 'Covenant University Green Energy Hub',
    goal: 'Advancing clean power for agriculture',
    description:
      'As a core partner in the CU green energy hub, we are driving the adoption of advanced renewable energy systems that replace fossil-fuel dependence in agricultural operations.',
    details:
      'Our role includes designing circular business models for green ammonia production, developing training programs, and supporting regulatory compliance to make sustainable energy a reality for farmers and agro-processors.',
    status: 'Active',
    photo: 'projects-green-energy-hub',
    date: '2025-02-03',
  },
  {
    slug: 'circular-fertilizer-initiatives',
    icon: Recycle,
    title: 'Circular Fertilizer Initiatives',
    goal: 'Reducing costs & emissions in farming',
    description:
      'We are developing innovative approaches to produce organic and green ammonia-based fertilizers locally, using agricultural residues and renewable hydrogen.',
    details:
      'These projects aim to reduce reliance on imported fertilizers, improve soil health, and make farming more profitable and sustainable for smallholders.',
    status: 'Development',
    photo: 'projects-circular-fertilizer',
    impact: '30% cost reduction target',
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

/** "2025-02-03" -> "Feb 3, 2025". Fixed locale and zone: same text on server and client. */
export function formatProjectDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}
