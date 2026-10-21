import Image from 'next/image'
import type { ReactNode } from 'react'
import { ScrollFade } from '@/components/animations'
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
 * words fade in on top as you scroll.
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
          <>
            {/* Decorative: the message is the text, so the photo has empty alt. */}
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              style={{ objectPosition: image.position }}
              className="-z-20 object-cover"
            />
            <div
              aria-hidden
              className="bg-image-band-overlay absolute inset-0 -z-10"
            />
          </>
        )}
        <div className="px-6 py-20 sm:px-12 sm:py-28">
          <ScrollFade className="mx-auto max-w-3xl text-center">
            <h2 className="text-title">{title}</h2>
            <p className="mt-5 text-lead text-canopy-foreground/85">
              {description}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {children}
            </div>
          </ScrollFade>
        </div>
      </div>
    </section>
  )
}
