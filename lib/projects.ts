import {
  Factory,
  GraduationCap,
  type LucideIcon,
  Recycle,
  Sun,
  Zap,
} from 'lucide-react'
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
  {
    slug: 'abuad-green-energy-hub-development-plan',
    icon: GraduationCap,
    title: 'ABUAD Green Energy Hub Development Plan',
    goal: 'Planning a green energy hub at Afe Babalola University',
    description:
      'We are contributing to the development plan for a green energy hub at Afe Babalola University, Ado-Ekiti: the home of the Institute of Hydrogen and Future Energy Systems.',
    details:
      'The plan sets out the clean energy infrastructure, the phasing of works and the partners the hub needs, so that research, training and industry can draw on one shared energy platform.',
    status: 'Development',
    photo: 'projects-abuad-green-energy-hub',
  },
  {
    slug: 'ekiti-knowledge-zone-green-energy-industrial-hub',
    icon: Factory,
    title: 'Ekiti Knowledge Zone Green Energy and Industrial Hub',
    goal: 'Powering an industrial hub with clean energy',
    description:
      'A green energy and industrial hub for the Ekiti Knowledge Zone, pairing on-site solar power and a microgrid with agro-processing and manufacturing.',
    details:
      'Locating processing plants beside their own clean power cuts energy costs for the factories, keeps value-adding work close to the farms that supply it, and gives the zone a base for future green hydrogen.',
    status: 'Development',
    photo: 'projects-ekiti-knowledge-zone',
  },
  {
    slug: 'mesmo-africa-solar-pv-integrated-energy-systems',
    icon: Sun,
    title: 'MESMO Africa Ltd Solar PV Integrated Energy Systems',
    goal: 'Sustaining industrial capacity',
    description:
      'Solar PV integrated energy systems for MESMO Africa Ltd, designed to keep its processing plant running on clean, predictable power.',
    details:
      'Rooftop solar, battery storage and an energy management system work together so production capacity holds steady and power costs stay under control.',
    status: 'Development',
    photo: 'projects-mesmo-solar-pv',
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
