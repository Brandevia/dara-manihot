import Image from 'next/image'
import type { ReactNode } from 'react'
import { FadeIn, Reveal } from '@/components/animations'
import { CTA_CONTENT_DELAY, CTA_IMAGE_DURATION } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface CtaBandImage {
  src: string
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string
}

/**
 * Closing call-to-action. Put CTA buttons in `children`.
 *
 * It is always an inset, rounded card that sits on the page background, never
 * a full-bleed colour band, so the footer's rounded top corners meet white
 * rather than a second dark block. Without `image` the card is the green
 * gradient; with `image` it is a photo under a deep-green veil. Either way the
 * words appear on scroll. With a photo, the photo fades in first and the words
 * follow a beat later, so they arrive onto a picture that is already there.
 */
export function CtaBand({
  title,
  description,
  image,
  children,
}: {
  title: string
  description: string
  image?: CtaBandImage
  children: ReactNode
}) {
  return (
    <section className="px-(--container-pad) pb-(--section-y)">
      <div
        className={cn(
          'relative isolate mx-auto max-w-[calc(var(--container-max)+4rem)] overflow-hidden rounded-3xl text-canopy-foreground sm:rounded-[2rem]',
          image ? 'bg-canopy' : 'bg-band-gradient',
        )}
      >
        {image && (
          <FadeIn
            duration={CTA_IMAGE_DURATION}
            className="absolute inset-0 -z-10"
            data-cta-image
          >
            {/* Decorative: the message is the text, so the photo has empty alt. */}
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              style={{ objectPosition: image.position }}
              className="object-cover"
            />
            <div
              aria-hidden
              className="bg-image-band-overlay absolute inset-0"
            />
          </FadeIn>
        )}
        <div className="px-6 py-20 sm:px-12 sm:py-28">
          <Reveal
            delay={image ? CTA_CONTENT_DELAY : 0}
            className="mx-auto max-w-3xl text-center"
            data-cta-content
          >
            <h2 className="text-title">{title}</h2>
            <p className="mt-5 text-lead text-canopy-foreground/85">
              {description}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {children}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
