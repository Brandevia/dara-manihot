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

export const SDG_GOALS = [
  { number: 1, title: 'No Poverty' },
  { number: 7, title: 'Affordable and Clean Energy' },
  { number: 9, title: 'Industry, Innovation and Infrastructure' },
  { number: 13, title: 'Climate Action' },
]

/**
 * Hero carousel slides. To use real photography, drop the files in
 * `public/images/hero/` and change `src` (and `alt`). Keep the focal point
 * of each photo near the horizontal centre: on phones the image is cropped
 * to the middle third. `position` tunes that crop per slide.
 */
export const HERO_SLIDES = [
  {
    src: '/images/hero/dawn.jpg',
    alt: 'Rows of cassava plants stretching toward a sunrise over rolling hills',
    caption: 'Cassava fields at first light',
    position: '55% 50%',
  },
  {
    src: '/images/hero/solar.jpg',
    alt: 'Rows of solar panels across a green field under a bright sky',
    caption: 'Solar power for farms and agro-processors',
    position: '50% 50%',
  },
  {
    src: '/images/hero/biomass.jpg',
    alt: 'A biomass gasification plant at dusk surrounded by piles of crop residue',
    caption: 'Turning crop residue into clean energy',
    position: '52% 50%',
  },
  {
    src: '/images/hero/hydrogen.jpg',
    alt: 'Wind turbines and green hydrogen storage tanks on green hills',
    caption: 'Green hydrogen for fertilizer and industry',
    position: '60% 50%',
  },
] as const

export const LEGAL_LAST_UPDATED = '14 October 2026'
