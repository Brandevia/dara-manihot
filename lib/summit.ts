/**
 * Everything the site says about Dara-Manihot's talk at the ABUAD
 * International Hydrogen Summit 2.0, and the people and photographs around it.
 *
 * Source of the facts: the summit flyer and the CEO's own presentation
 * ("ABUAD_International_Hydrogen_Summit_Presentation.pptx"). The figures are
 * the presenter's, shown as such on the page; nothing here is estimated.
 * To correct a name, a figure or a caption, change it here: components read
 * from this file only.
 */

/** Spelled as printed on the summit flyer and on the CEO's own slides. */
export const LEADER = {
  honorific: 'Mr.',
  name: 'Adekunle Olusile',
  title: 'Chief Executive Officer',
  company: 'Dara-Manihot Industries',
  photo: {
    src: '/images/leadership/ceo.jpg',
    width: 570,
    height: 779,
    alt: 'Adekunle Olusile speaking into a microphone during a panel session at the ABUAD International Hydrogen Summit 2.0',
    /** Keeps the face in frame when the card crops the photo. */
    position: '50% 20%',
  },
} as const

export const SUMMIT = {
  name: 'ABUAD International Hydrogen Summit 2.0',
  theme:
    'Nigeria’s Pathway to Clean Energy: The Science, Policy and Industry Nexus',
  organiser: 'ABUAD Institute of Hydrogen and Future Energy Systems',
  venue: 'Alfa Belgore Hall, Afe Babalola University, Ado-Ekiti',
  /** ISO date, formatted with `formatSummitDate`. */
  date: '2026-10-16',
  talkTitle:
    'Accelerating Industrial Decarbonization & Sustainable Manufacturing in Nigeria',
  talkSummary:
    'Actionable pathways for manufacturers: solar and battery storage, zero-CAPEX financing, and green hydrogen value chains.',
  /** The page and anchor that carry the full write-up. */
  href: '/projects#summit',
} as const

/** "2026-10-16" -> "16 October 2026". Fixed locale and zone, so server and client agree. */
export function formatSummitDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

/** Headline results of the ABUAD microgrid, as presented. `value` feeds CountUp. */
export interface SummitFigure {
  value: string
  label: string
  detail: string
}

export const SUMMIT_FIGURES: readonly SummitFigure[] = [
  {
    value: '19.4%',
    label: 'Year-1 cost reduction',
    detail: 'Electricity tariff relief against the grid and diesel baseline.',
  },
  {
    value: '₦351M',
    label: 'Year-1 direct savings',
    detail: 'Cash retained by the institution in its first twelve months.',
  },
  {
    value: '₦12.32B',
    label: '15-year savings',
    detail: 'Cumulative savings across the 15-year BOOT lease term.',
  },
  {
    value: '₦53.44B',
    label: '25-year projection',
    detail: 'Whole-life value over the 25-year operating life of the asset.',
  },
]

export const SUMMIT_SYSTEM = {
  capacity:
    '5.28 MWp ground-mounted solar PV with a 2 MW / 4 MWh battery energy storage system',
  developer:
    'Green Energy and Hydrogen Innovation Hub Limited, a vehicle of CrossAfrique Hydrogen Ltd and Dara-Manihot Industries Ltd',
  epc: 'Soventix GmbH (Germany), delivering engineering, procurement and quality assurance',
  financing:
    'Build-Own-Operate-Transfer (BOOT): developers fund 100% of upfront capital',
} as const

export interface SummitPhase {
  id: string
  step: string
  title: string
  summary: string
  mechanism: string
  impact: string
}

/** The three-phase transition model: solar savings first, hydrogen last. */
export const SUMMIT_PHASES: readonly SummitPhase[] = [
  {
    id: 'solar',
    step: 'Phase 1',
    title: 'Solar PV baseline',
    summary:
      'Ultra-low-cost daytime generation sets a predictable price floor.',
    mechanism: 'Captures low-cost daytime solar generation on site.',
    impact:
      'Immediately lowers daytime power bills and locks in predictable tariffs.',
  },
  {
    id: 'storage',
    step: 'Phase 2',
    title: 'Battery storage',
    summary: 'Round-the-clock power quality, with diesel pushed out.',
    mechanism: 'High-density lithium battery storage integrated with the grid.',
    impact:
      'Delivers 24/7 power quality, handles peak loads and removes diesel generation.',
  },
  {
    id: 'hydrogen',
    title: 'Green hydrogen',
    step: 'Phase 3',
    summary: 'Long-duration storage and a clean fuel for heavy industry.',
    mechanism:
      'Water electrolysis and chemical storage. Electricity is about 70% of green hydrogen’s production cost.',
    impact:
      'Enables long-duration energy storage and decarbonizes high-heat processes. Phases 1 and 2 generate the savings that fund Phase 3.',
  },
]

export interface StakeholderAsk {
  id: string
  who: string
  actions: readonly string[]
}

/** The implementation roadmap: one set of priorities per audience. */
export const STAKEHOLDER_ASKS: readonly StakeholderAsk[] = [
  {
    id: 'manufacturers',
    who: 'Manufacturers',
    actions: [
      'Audit facility power use to chart a detailed energy profile.',
      'Identify where fossil fuels can be displaced.',
      'Look for efficiency, integration and value-chain opportunities.',
      'Adopt zero-CAPEX BOOT solar agreements.',
    ],
  },
  {
    id: 'policymakers',
    who: 'Policymakers',
    actions: [
      'Streamline microgrid licensing rules.',
      'Standardize grid interconnection protocols.',
      'Extend import duty waivers on hardware.',
      'Fund in-country capacity building.',
    ],
  },
  {
    id: 'financiers',
    who: 'Financiers',
    actions: [
      'Structure credit guarantee mechanisms.',
      'Expand low-cost funding opportunities and public-private partnerships.',
      'Deploy long-tenor local-currency credit.',
      'Incentivize ESG-compliant industrial loans.',
    ],
  },
  {
    id: 'academia',
    who: 'Academia',
    actions: [
      'Expand technical certification programs.',
      'Advance energy management and integration.',
      'Advance pilot electrolyzer research.',
      'Build local hydrogen engineering talent.',
    ],
  },
]

export interface GalleryImage {
  id: string
  src: string
  /** Pixel size of the file: reserves the space, so nothing jumps as it loads. */
  width: number
  height: number
  /** Describes the scene. Does not name anyone who is not named in the source. */
  alt: string
  caption: string
  /** CSS object-position, for the cropped grid tile. */
  position?: string
}

/**
 * Photographs from the summit. Order is display order; the first is the
 * largest tile. Frames that were too small, blurred or a weaker copy of
 * another were left out on purpose rather than shown soft.
 */
export const SUMMIT_GALLERY: readonly GalleryImage[] = [
  {
    id: 'stage-group',
    src: '/images/summit/stage-group.jpg',
    width: 1080,
    height: 754,
    alt: 'Speakers and guests standing in a line on the Alfa Belgore Hall stage, each holding a navy gift bag, beneath the summit banner',
    caption: 'Speakers and guests together on the Alfa Belgore Hall stage.',
    position: '50% 55%',
  },
  {
    id: 'banner-group',
    src: '/images/summit/banner-group.jpg',
    width: 1080,
    height: 1048,
    alt: 'Ten delegates in front of the 2026 International Hydrogen Summit banner on the lawn outside the venue',
    caption: 'Delegates outside the venue before the sessions began.',
    position: '50% 40%',
  },
  {
    id: 'panel-session',
    src: '/images/summit/panel-session.jpg',
    width: 1080,
    height: 834,
    alt: 'Five panellists seated in white chairs on stage under the banner reading Nigeria’s Pathway to Clean Energy',
    caption: 'A panel session on Nigeria’s pathway to clean energy.',
    position: '50% 70%',
  },
  {
    id: 'speakers-line',
    src: '/images/summit/speakers-line.jpg',
    width: 1080,
    height: 1043,
    alt: 'Seven summit speakers and guests standing in front of the stage curtains, wearing blue lanyards',
    caption: 'Summit speakers and guests ahead of the programme.',
    position: '50% 60%',
  },
  {
    id: 'bogoro-visit',
    src: '/images/summit/bogoro-visit.jpg',
    width: 1035,
    height: 720,
    alt: 'A group of delegates standing on the steps of the S.E. Bogoro Research Centre',
    caption: 'Delegates outside the S.E. Bogoro Research Centre.',
    position: '50% 45%',
  },
]
