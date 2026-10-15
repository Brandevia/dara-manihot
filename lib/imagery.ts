export type PhotoPage = 'home' | 'about' | 'services' | 'projects' | 'contact'

/** The image themes called for in the project plan (Phase 1, task 3). */
export type PhotoCategory =
  | 'people'
  | 'field'
  | 'energy'
  | 'technology'
  | 'community'
  | 'project'

export interface PhotoSlotDef {
  id: string
  page: PhotoPage
  category: PhotoCategory
  /** What to photograph. This text is the source for docs/PHOTO-REQUEST.md. */
  brief: string
  /** Alt text used once the slot has an image. */
  alt: string
  /**
   * Image path under /public. Leave unset until the client supplies a photo:
   * the slot then renders a branded panel instead of a picture. Paths under
   * /images/hero/ are the generated illustrations, not real photography, and
   * still count as "pending" in `pnpm launch:check`.
   */
  src?: string
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string
}

/**
 * Single manifest for every image slot on the site. To use a real photo, put
 * the file in `public/images/` and set `src` here; no component changes.
 */
export const PHOTO_SLOTS = [
  {
    id: 'home-agriculture',
    page: 'home',
    category: 'field',
    brief: 'Farmers or field staff at work in a Dara-Manihot supported farm.',
    alt: 'Cassava fields stretching toward a sunrise',
    src: '/images/hero/dawn.jpg',
  },
  {
    id: 'home-energy',
    page: 'home',
    category: 'energy',
    brief: 'A completed solar PV or biomass installation, ideally with staff.',
    alt: 'Rows of solar panels across a green field',
    src: '/images/hero/solar.jpg',
  },
  {
    id: 'home-people',
    page: 'home',
    category: 'people',
    brief: 'The team with farmers or community members on site, smiling.',
    alt: 'Dara-Manihot team working with farmers and community members',
  },
  {
    id: 'about-leadership',
    page: 'about',
    category: 'people',
    brief: 'Leadership: a portrait of the founder plus one group photo.',
    alt: 'The Dara-Manihot leadership team',
  },
  {
    id: 'about-field',
    page: 'about',
    category: 'field',
    brief: 'The team in the field: planting, harvesting, residue processing.',
    alt: 'Dara-Manihot staff working in the field',
  },
  {
    id: 'services-agriculture',
    page: 'services',
    category: 'field',
    brief: 'Farm and processing activity: cassava, rice, composting, biochar.',
    alt: 'Cassava fields stretching toward a sunrise',
    src: '/images/hero/dawn.jpg',
  },
  {
    id: 'services-energy',
    page: 'services',
    category: 'energy',
    brief:
      'Sustainable energy installations: solar arrays, inverters, storage.',
    alt: 'Rows of solar panels across a green field',
    src: '/images/hero/solar.jpg',
  },
  {
    id: 'services-equipment',
    page: 'services',
    category: 'technology',
    brief: 'Equipment close-ups: gasifier, electrolyser, control panels.',
    alt: 'A biomass gasification plant at dusk beside piles of crop residue',
    src: '/images/hero/biomass.jpg',
  },
  {
    id: 'projects-green-energy-hub',
    page: 'projects',
    category: 'project',
    brief: 'Covenant University Green Energy Hub: the site, kit and partners.',
    alt: 'Wind turbines and green hydrogen storage on green hills',
    src: '/images/hero/hydrogen.jpg',
  },
  {
    id: 'projects-circular-fertilizer',
    page: 'projects',
    category: 'project',
    brief: 'Fertilizer production or agricultural residue processing.',
    alt: 'Crop residue being processed into organic fertilizer',
  },
  {
    id: 'projects-community',
    page: 'projects',
    category: 'community',
    brief:
      'Training sessions and community impact: cooperatives, women, youth.',
    alt: 'A Dara-Manihot training session with local farmers',
  },
  {
    id: 'contact-office',
    page: 'contact',
    category: 'people',
    brief: 'The team at the Ketu office, or a welcoming reception shot.',
    alt: 'The Dara-Manihot team at the Ketu office',
  },
] as const satisfies readonly PhotoSlotDef[]

export type PhotoSlotId = (typeof PHOTO_SLOTS)[number]['id']

export function getPhotoSlot(id: PhotoSlotId): PhotoSlotDef {
  const slot = PHOTO_SLOTS.find((s) => s.id === id)
  if (!slot) throw new Error(`Unknown photo slot: ${id}`)
  return slot
}

/** True once a slot points at real photography rather than an illustration. */
export function hasRealPhoto(slot: PhotoSlotDef): boolean {
  return Boolean(slot.src) && !slot.src?.startsWith('/images/hero/')
}
