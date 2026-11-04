export interface Service {
  id: string
  pillar: PillarId
  title: string
  /** Short name used in the footer. */
  shortTitle: string
  description: string
  details: readonly string[]
}

export const SERVICES = [
  {
    id: 'solar-renewables',
    pillar: 'sustainable-energy',
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
    id: 'green-industrial-value-chains',
    pillar: 'green-industries',
    title: 'Green Industrial Value Chains',
    shortTitle: 'Green Industrial Value Chains',
    description:
      'Supporting industrial decarbonization through business model innovation, technology, and process transitions to increase efficiency and reduce waste.',
    details: [
      'Energy and process audits that show where fossil fuels and waste can be displaced',
      'Zero-CAPEX solar and battery storage agreements for factories and processors',
      'Business model innovation and process transitions that raise efficiency and cut waste',
      'A phased path from solar savings to battery storage and green hydrogen',
    ],
  },
  {
    id: 'green-hydrogen',
    pillar: 'sustainable-energy',
    title: 'Green Hydrogen for Agriculture & Industry  & Applications',
    shortTitle: 'Green Hydrogen for Agriculture & Industry ',
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
    id: 'circular-economy',
    pillar: 'sustainable-agriculture',
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
    title: 'Biomass Gasification & Valorization',
    shortTitle: 'Biomass Gasification & Valorization',
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
    id: 'capacity-building',
    pillar: 'supporting',
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
  | 'sustainable-energy'
  | 'green-industries'
  | 'sustainable-agriculture'
  | 'supporting'

export interface Pillar {
  /** Also the URL hash on /services, e.g. /services#sustainable-energy. */
  id: PillarId
  title: string
  /** One line for cards; the existing write-ups carry the detail. */
  summary: string
  /** Short capability bullets, taken from the existing service write-ups. */
  highlights: readonly string[]
}

/**
 * Sustainable energy is the pathway, so it leads; green industries and
 * sustainable agriculture are the two areas it serves; training and research
 * support all three. Order is display order.
 */
export const PILLARS = [
  {
    id: 'sustainable-energy',
    title: 'Sustainable Energy',
    summary:
      'Solar PV, biomass gasification and green hydrogen that deliver reliable, affordable, low-carbon power for industries and farms.',
    highlights: [
      'Solar PV and hybrid systems, grid-tied and off-grid',
      'Biomass gasification turning crop residue into clean power',
      'Green hydrogen and green ammonia for fertilizer and industry',
    ],
  },
  {
    id: 'green-industries',
    title: 'Green Industries',
    summary:
      'Clean power and process change for factories and processors, so they cut energy costs, waste and emissions while staying competitive.',
    highlights: [
      'Industrial decarbonization through business model and process transitions',
      'Zero-CAPEX solar and storage for factories and processors',
      'A phased path from solar savings to green hydrogen',
    ],
  },
  {
    id: 'sustainable-agriculture',
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
    id: 'supporting',
    title: 'Training & Research',
    summary:
      'Capacity building and R&D that support integrating sustainable energy with green industries and sustainable agriculture, establishing long-term local energy solutions.',
    highlights: [
      'Technical and entrepreneurship training',
      'Feasibility studies, pilots and local adaptation',
    ],
  },
] as const satisfies readonly Pillar[]

export const getPillarServices = (pillar: PillarId) =>
  SERVICES.filter((s) => s.pillar === pillar)
