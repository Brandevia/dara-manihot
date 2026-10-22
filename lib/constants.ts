export const COMPANY_INFO = {
  name: 'Dara-Manihot Industries & Farms',
  shortName: 'Dara-Manihot',
  tagline: 'Transforming Agriculture and Industry through Clean Technologies',
  description:
    'Leading Nigerian enterprise redefining sustainable agriculture and industry through advanced clean technologies.',
  founded: '2014',
  location: 'Nigeria',
  email: 'info@daramanihot.com.ng',
  phones: [
    { display: '+234 802 340 0557', tel: '+2348023400557' },
    { display: '+234 706 141 2439', tel: '+2347061412439' },
  ],
  address: 'Ketu, Lagos, Nigeria',
  hours: 'Mon - Fri: 8:00 AM - 6:00 PM',
} as const

/** Absolute site address, used where a relative URL cannot work (emails). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.daramanihot.com.ng'
).replace(/\/+$/, '')

// `as const` keeps each href a literal type, so `typedRoutes` checks every
// link here against the real routes at compile time.
export const NAVIGATION_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
] as const

export const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
] as const

export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/dara-manihot',
  twitter: 'https://twitter.com/dara_manihot',
  facebook: 'https://facebook.com/dara.manihot',
}

export const CORE_VALUES = [
  'Sustainability',
  'Innovation',
  'Community Empowerment',
  'Gender Inclusion',
  'Excellence',
]

export interface SdgGoal { number: number; title: string; icon: string; contribution: string }

export const SDG_GOALS = [
  { number: 1,  title: 'No Poverty', icon: '/images/sdg/sdg-01.png', contribution: 'Lower-cost clean energy and locally made fertilizer make farming more profitable for smallholders.' },
  { number: 2,  title: 'Zero Hunger', icon: '/images/sdg/sdg-02.png', contribution: 'Climate-smart farming and green ammonia fertilizer to raise yields and cut input costs.' },
  { number: 4,  title: 'Quality Education', icon: '/images/sdg/sdg-04.png', contribution: 'Training for farmers, cooperatives and enterprises in renewable energy and sustainable practice.' },
  { number: 7,  title: 'Affordable and Clean Energy', icon: '/images/sdg/sdg-07.png', contribution: 'Solar PV, biomass gasification and green hydrogen for farms, agro-processors and rural industry.' },
  { number: 8,  title: 'Decent Work and Economic Growth', icon: '/images/sdg/sdg-08.png', contribution: 'Green jobs and enterprise opportunities, with a strong focus on women and youth.' },
  { number: 9,  title: 'Industry, Innovation and Infrastructure', icon: '/images/sdg/sdg-09.png', contribution: 'Agro-industrial hubs and clean-technology infrastructure across Nigeria and West Africa.' },
  { number: 12, title: 'Responsible Consumption and Production', icon: '/images/sdg/sdg-12.png', contribution: 'Circular, waste-to-value models that turn crop residue into energy, biochar and fertilizer.' },
  { number: 13, title: 'Climate Action', icon: '/images/sdg/sdg-13.png', contribution: 'Replacing fossil fuels in agricultural operations and cutting emissions along value chains.' },
  { number: 17, title: 'Partnerships for the Goals', icon: '/images/sdg/sdg-17.png', contribution: 'Working with universities, technical partners, industry and government agencies.' },
] as const satisfies readonly SdgGoal[]

export const SDG_WHEEL = { src: '/images/sdg/wheel.png', alt: 'The Sustainable Development Goals colour wheel' } as const

export function formatSdgNumbers(goals: readonly { number: number }[] = SDG_GOALS): string {
  const n = goals.map((g) => String(g.number))
  if (n.length < 3) return n.join(' and ')
  return `${n.slice(0, -1).join(', ')}, and ${n[n.length - 1]}`
}

export const HERO_SLIDES = [
  { src: '/images/hero/image5.png', alt: 'A tractor working crop rows between solar panels, with a green processing plant and a river behind', caption: 'Farms powered by clean energy', position: '55% 50%' },
  { src: '/images/hero/image3.png', alt: 'Rows of solar panels across a green field under a bright sky', caption: 'Solar power for farms and agro-processors', position: '50% 50%' },
  { src: '/images/hero/image6.png', alt: 'A green manufacturing hub with a solar array, hydrogen storage tanks and wind turbines beside farmland', caption: 'Green manufacturing hubs for agro-industry', position: '60% 50%' },
  { src: '/images/hero/image9.png', alt: 'A hydrogen energy storage unit and white storage tanks on grass, with wind turbines and a city skyline behind', caption: 'Green hydrogen for fertilizer and industry', position: '60% 50%' },
] as const

/**
 * Photo behind the closing call-to-action on the landing page. Decorative (the
 * band's text carries the message). To use a different photograph, drop it in
 * public/images/ and change `src`; `tests/site-data.test.ts` checks it exists.
 */
export const CTA_BAND_IMAGE = {
  src: '/images/hero/image5.png',
  position: '50% 60%',
} as const

export interface PageHeroImage {
  src: string
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string
}

/**
 * Photo behind the banner of each inner page (`PageHero`). Decorative: the
 * banner's own text carries the message, so the image has an empty alt. A
 * translucent green overlay (`--page-hero-overlay`) always sits on top, so
 * any photograph is safe for the white text. The Contact page has no banner.
 * `pillars` is keyed by `Service.pillar`, for the service detail pages.
 * To change one, drop a file in public/images/ and change `src`;
 * `tests/site-data.test.ts` checks every file exists.
 */
export const PAGE_HERO_IMAGES = {
  about: { src: '/images/hero/image2.png', position: '50% 70%' },
  services: { src: '/images/hero/image1.png', position: '50% 50%' },
  projects: { src: '/images/hero/image10.png', position: '50% 50%' },
  legal: { src: '/images/hero/image9.png', position: '40% 50%' },
  pillars: {
    'sustainable-agriculture': {
      src: '/images/hero/image5.png',
      position: '55% 50%',
    },
    'sustainable-energy': {
      src: '/images/hero/image3.png',
      position: '50% 55%',
    },
    supporting: { src: '/images/hero/image7.png', position: '30% 50%' },
  },
} as const satisfies {
  about: PageHeroImage
  services: PageHeroImage
  projects: PageHeroImage
  legal: PageHeroImage
  pillars: Record<
    'sustainable-agriculture' | 'sustainable-energy' | 'supporting',
    PageHeroImage
  >
}

export const LEGAL_LAST_UPDATED = '21 October 2026'
