import {
  BookOpen,
  Droplets,
  Flame,
  Handshake,
  Lightbulb,
  type LucideIcon,
  Recycle,
  Sprout,
  Sun,
  Zap,
} from 'lucide-react'

export interface Service {
  id: string
  pillar: PillarId
  icon: LucideIcon
  title: string
  /** Short name used in the footer. */
  shortTitle: string
  description: string
  details: readonly string[]
}

export const SERVICES = [
  {
    id: 'circular-economy',
    pillar: 'sustainable-agriculture',
    icon: Recycle,
    title: 'Circular Economy & Waste-to-Value Solutions',
    shortTitle: 'Circular Economy Solutions',
    description:
      'We help agro-enterprises transform agricultural residues and by-products into valuable resources.',
    details: [
      'Design of circular business models for cassava, rice, and other crop value chains',
      'Biochar production systems for soil enhancement and carbon sequestration',
      'Organic fertilizer development from agricultural waste',
      'Zero-waste processing facility design and implementation',
    ],
  },
  {
    id: 'biomass-gasification',
    pillar: 'sustainable-energy',
    icon: Flame,
    title: 'Biomass Gasification & Energy Systems',
    shortTitle: 'Biomass Gasification',
    description:
      'Advanced biomass gasification technologies that convert agricultural waste into clean energy.',
    details: [
      'Small-scale biomass gasifiers for rural communities and farms',
      'Syngas production for heating, power generation, and industrial processes',
      'Integration with existing agricultural operations',
      'Training on operation, maintenance, and safety protocols',
    ],
  },
  {
    id: 'solar-renewables',
    pillar: 'sustainable-energy',
    icon: Sun,
    title: 'Solar PV & Renewable Energy Solutions',
    shortTitle: 'Renewable Energy Systems',
    description:
      'Comprehensive renewable energy systems tailored for agricultural and industrial applications.',
    details: [
      'Solar PV system design, installation, and commissioning',
      'Hybrid renewable energy systems (solar + biomass + storage)',
      'Grid-tied and off-grid solutions for rural areas',
      'Energy audits and efficiency optimization',
    ],
  },
  {
    id: 'green-hydrogen',
    pillar: 'sustainable-energy',
    icon: Droplets,
    title: 'Green Hydrogen Production & Applications',
    shortTitle: 'Green Hydrogen Production',
    description:
      'Cutting-edge green hydrogen solutions for agriculture and industry decarbonization.',
    details: [
      'Electrolysis systems powered by renewable energy',
      'Green ammonia production for fertilizer manufacturing',
      'Hydrogen storage and distribution systems',
      'Integration with agricultural processing facilities',
    ],
  },
  {
    id: 'capacity-building',
    pillar: 'supporting',
    icon: BookOpen,
    title: 'Capacity Building & Training Programs',
    shortTitle: 'Capacity Building',
    description:
      'Comprehensive training and education programs to build local expertise in sustainable technologies.',
    details: [
      'Technical training on renewable energy systems',
      'Sustainable agriculture practices and climate-smart farming',
      'Entrepreneurship development for green businesses',
      'Gender-inclusive training programs for women and youth',
    ],
  },
  {
    id: 'research-development',
    pillar: 'supporting',
    icon: Lightbulb,
    title: 'Research & Development Services',
    shortTitle: 'Research & Development',
    description:
      'Innovation-driven R&D services to develop context-specific solutions for local challenges.',
    details: [
      'Feasibility studies for new technologies and business models',
      'Pilot project development and testing',
      'Technology adaptation and localization',
      'Partnership with universities and research institutions',
    ],
  },
] as const satisfies readonly Service[]

export type PillarId =
  | 'sustainable-agriculture'
  | 'sustainable-energy'
  | 'supporting'

export interface Pillar {
  /** Also the URL hash on /services, e.g. /services#sustainable-energy. */
  id: PillarId
  icon: LucideIcon
  title: string
  /** One line for cards; the existing write-ups carry the detail. */
  summary: string
  /** Short capability bullets, taken from the existing service write-ups. */
  highlights: readonly string[]
}

/**
 * The two headline offerings, plus the services that support both. Order is
 * display order. Agriculture and energy are deliberately equal in weight.
 */
export const PILLARS = [
  {
    id: 'sustainable-agriculture',
    icon: Sprout,
    title: 'Sustainable Agriculture',
    summary:
      'Circular, waste-to-value practices that cut costs and restore soil across crop value chains.',
    highlights: [
      'Circular business models for cassava, rice and other crops',
      'Biochar and organic fertilizer from agricultural residues',
      'Climate-smart farming and zero-waste processing',
    ],
  },
  {
    id: 'sustainable-energy',
    icon: Zap,
    title: 'Sustainable Energy',
    summary:
      'Solar PV, biomass gasification and green hydrogen that deliver reliable, affordable, low-carbon power for farms and industry.',
    highlights: [
      'Solar PV and hybrid systems, grid-tied and off-grid',
      'Biomass gasification turning crop residue into clean power',
      'Green hydrogen and green ammonia for fertilizer and industry',
    ],
  },
  {
    id: 'supporting',
    icon: Handshake,
    title: 'Training & Research',
    summary:
      'Capacity building and R&D that help both agriculture and energy solutions take root locally.',
    highlights: [
      'Technical and entrepreneurship training',
      'Feasibility studies, pilots and local adaptation',
    ],
  },
] as const satisfies readonly Pillar[]

export const getPillarServices = (pillar: PillarId) =>
  SERVICES.filter((s) => s.pillar === pillar)
