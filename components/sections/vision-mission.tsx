import { Globe, type LucideIcon, Target } from 'lucide-react'
import { Reveal } from '@/components/animations'
import { PhotoSlot } from '@/components/photo-slot'
import type { PhotoSlotId } from '@/lib/imagery'
import { cn } from '@/lib/utils'

interface Row {
  id: string
  icon: LucideIcon
  title: string
  text: string
  photo: PhotoSlotId
  /** Which side the photo sits on from `lg` up. Text comes first on mobile. */
  photoSide: 'left' | 'right'
}

// Vision first, then mission, as in the wireframe. Wording is unchanged.
const ROWS: readonly Row[] = [
  {
    id: 'vision',
    icon: Globe,
    title: 'Our vision',
    text: 'To be Africa’s leading catalyst for sustainable agro-industrial transformation, where farms and factories thrive with clean energy, waste becomes valuable resources, and communities lead the transition to a climate-smart economy.',
    photo: 'about-vision',
    photoSide: 'right',
  },
  {
    id: 'mission',
    icon: Target,
    title: 'Our mission',
    text: 'To transform Africa’s agricultural and industrial sectors through innovative clean technologies, creating sustainable value chains that empower communities, enhance productivity, and protect our environment for future generations.',
    photo: 'about-mission',
    photoSide: 'left',
  },
]

/**
 * Our mission and vision: one mint section, two alternating rows of text and
 * photograph. Each row has a round icon chip (the icon in the secondary
 * purple), a heading and a paragraph. The text and the photo each fade in as
 * they scroll into view (the Appear effect), the photo a beat later.
 */
export function VisionMission() {
  return (
    <section
      aria-labelledby="vision-mission-title"
      data-vision-mission
      className="bg-mint section-y"
    >
      <div className="page-container">
        <Reveal>
          <h2
            id="vision-mission-title"
            className="max-w-3xl text-title text-canopy"
          >
            Our mission &amp; vision
          </h2>
        </Reveal>

        <div className="mt-12 space-y-12 lg:mt-16 lg:space-y-20">
          {ROWS.map(({ id, icon: Icon, title, text, photo, photoSide }) => (
            <div
              key={id}
              data-row={id}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal
                className={cn(
                  'max-w-xl',
                  photoSide === 'left' && 'lg:order-2 lg:justify-self-start',
                )}
              >
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-background text-secondary"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 text-3xl text-canopy">{title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </Reveal>
              <Reveal
                delay={0.15}
                className={cn(photoSide === 'left' && 'lg:order-1')}
              >
                <PhotoSlot
                  id={photo}
                  sizes="(min-width: 1216px) 592px, (min-width: 1024px) 50vw, 100vw"
                  className="shadow-lift"
                />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
