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
    alt: 'A farmer checking her crops on a tablet beside solar panels, with a green manufacturing plant behind her',
    src: '/images/hero/image2.png',
    position: '50% 100%',
  },
  {
    id: 'home-energy',
    page: 'home',
    category: 'energy',
    brief: 'A completed solar PV or biomass installation, ideally with staff.',
    alt: 'Aerial view of a renewable-powered industrial site with solar fields, wind turbines and a hydro dam',
    src: '/images/hero/image1.png',
  },
  {
    id: 'home-people',
    page: 'home',
    category: 'people',
    brief: 'The team with farmers or community members on site, smiling.',
    alt: 'Engineers in hard hats at a green hydrogen plant beside a port terminal',
    src: '/images/hero/image7.png',
    position: '12% 50%',
  },
  {
    id: 'about-leadership',
    page: 'about',
    category: 'people',
    brief: 'Leadership: a portrait of the founder plus one group photo.',
    alt: 'Speakers and guests standing in a line on the stage at the ABUAD International Hydrogen Summit 2.0',
    src: '/images/summit/stage-group.jpg',
    position: '50% 55%',
  },
  {
    id: 'about-field',
    page: 'about',
    category: 'people',
    brief: 'Leadership: a portrait of the founder plus one group photo.',
    alt: 'A farmer checking her crops on a tablet beside solar panels, with a green manufacturing plant behind her',
    src: '/images/hero/image4.png',
    position: '25% 60%',
  },
  {
    id: 'about-vision',
    page: 'about',
    category: 'field',
    brief: 'Our vision: farmland powered by clean energy, wide and bright.',
    alt: 'Rows of solar panels across a green field under a bright sky',
    src: '/images/hero/image3.png',
    position: '50% 50%',
  },
  {
    id: 'about-mission',
    page: 'about',
    category: 'people',
    brief:
      'Our mission: farm workers and community members at work in the field.',
    alt: 'A tractor working crop rows between solar panels, with a green processing plant and a river behind',
    src: '/images/hero/image5.png',
    position: '55% 50%',
  },
  {
    id: 'services-agriculture',
    page: 'services',
    category: 'field',
    brief: 'Farm and processing activity: cassava, rice, composting, biochar.',
    alt: 'A tractor working crop rows between solar panels, with a green processing plant and a river behind',
    src: '/images/hero/image5.png',
  },
  {
    id: 'services-energy',
    page: 'services',
    category: 'energy',
    brief:
      'Sustainable energy installations: solar arrays, inverters, storage.',
    alt: 'Rows of solar panels across a green field',
    src: '/images/hero/image3.png',
    position: '40% 60%',
  },
  {
    id: 'services-equipment',
    page: 'services',
    category: 'technology',
    brief: 'Equipment close-ups: gasifier, electrolyser, control panels.',
    alt: 'A hydrogen energy storage unit and white storage tanks on a grass field',
    src: '/images/hero/image9.png',
    position: '28% 50%',
  },
  {
    id: 'projects-green-energy-hub',
    page: 'projects',
    category: 'project',
    brief: 'Covenant University Green Energy Hub: the site, kit and partners.',
    alt: 'Concept illustration of a green hydrogen hub: solar and wind power, water electrolysis, ammonia and methanol synthesis, and a port',
    src: '/images/hero/image8.png',
    position: '50% 65%',
  },
  {
    id: 'projects-circular-fertilizer',
    page: 'projects',
    category: 'project',
    brief: 'Fertilizer production or agricultural residue processing.',
    alt: 'Concept illustration of an African green industry hub: a fertilizer warehouse, ammonia and methanol plants, farmland and a port',
    src: '/images/hero/image11.png',
    position: '50% 70%',
  },
  {
    id: 'projects-community',
    page: 'projects',
    category: 'community',
    brief:
      'Training sessions and community impact: cooperatives, women, youth.',
    alt: 'A Dara-Manihot training session with local farmers',
    src: '/images/hero/image10.png',
  },
  {
    id: 'contact-office',
    page: 'contact',
    category: 'people',
    brief: 'The team at the Ketu office, or a welcoming reception shot.',
    alt: 'The Dara-Manihot team at the Ketu office',
    src: '/images/hero/image7.png',
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
