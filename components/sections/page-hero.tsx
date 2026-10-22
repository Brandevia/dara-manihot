import Image from 'next/image'
import type { ReactNode } from 'react'
import type { PageHeroImage } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Banner at the top of every inner page except Contact.
 *
 * With an `image` the photo fills the banner under a translucent green
 * gradient (`--page-hero-overlay`), so the picture shows and the white text
 * stays AA. Without one it is the solid green gradient. The photo is
 * decorative (empty alt): the heading and description say what the page is.
 */
export function PageHero({
  title,
  description,
  image,
  children,
}: {
  title: string
  description: string
  image?: PageHeroImage
  children?: ReactNode
}) {
  return (
    <section
      data-page-hero
      data-has-image={image ? 'true' : undefined}
      className={cn(
        'relative isolate overflow-hidden text-canopy-foreground',
        image ? 'bg-canopy' : 'bg-page-hero-gradient',
      )}
    >
      {image && (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: image.position }}
            className="-z-20 object-cover"
          />
          <div
            aria-hidden
            className="bg-page-hero-overlay absolute inset-0 -z-10"
          />
        </>
      )}
      {/* A soft wash of the secondary colour ties the banner to the CTAs. */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-secondary/25 blur-3xl"
      />
      <div className="page-container pt-[calc(var(--header-h)+4rem)] pb-16 sm:pt-[calc(var(--header-h)+5rem)] sm:pb-20 lg:pt-[calc(var(--header-h)+6rem)] lg:pb-24">
        <div className="max-w-3xl">
          <h1 className="animate-rise text-display motion-reduce:animate-none">
            {title}
          </h1>
          <p className="animate-rise animation-delay-150 mt-6 max-w-2xl text-lead text-canopy-foreground/85 motion-reduce:animate-none">
            {description}
          </p>
          {children && (
            <div className="animate-rise animation-delay-300 mt-8 motion-reduce:animate-none">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
