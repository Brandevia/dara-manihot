import {
  BookOpen,
  Droplets,
  Flame,
  Lightbulb,
  type LucideIcon,
  Recycle,
  Sun,
} from 'lucide-react'

export interface Service {
  id: string
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
