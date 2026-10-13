'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  src: string
  alt: string
  caption: string
  position?: string
}

/**
 * Full-bleed background carousel: crossfade + slow push-in (CSS, see
 * `hero-slide` in globals.css) under a green gradient, with indicators,
 * prev/next and a pause button (WCAG 2.2.2: auto-advancing content needs a
 * way to pause it).
 *
 * Timing: the active indicator's fill runs a CSS animation of
 * `--hero-interval`; its `animationend` advances the slide. So the progress
 * bar and the slide change can never drift apart, pausing is just
 * `animation-play-state`, background tabs pause for free, and with
 * prefers-reduced-motion the animation is off so nothing auto-advances.
 */
export function HeroCarousel({ slides }: { slides: readonly HeroSlide[] }) {
  const reduceMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  // null = follow the OS setting; true/false = the visitor's explicit choice.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null)
  const playing = userPlaying ?? !reduceMotion

  const count = slides.length
  const go = (to: number) => setIndex((to + count) % count)
  const active = slides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured work"
      className="absolute inset-0"
    >
      <div
        aria-live={playing ? 'off' : 'polite'}
        className="absolute inset-0 overflow-hidden bg-canopy"
      >
        {slides.map((slide, i) => (
          // biome-ignore lint/a11y/useSemanticElements: the WAI-ARIA carousel pattern requires role="group" on each slide.
          <div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className="absolute inset-0"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={85}
              data-active={i === index}
              style={{ objectPosition: slide.position }}
              className="hero-slide object-cover"
            />
          </div>
        ))}
        {/* The site colour, as a gradient over every photo. */}
        <div className="bg-hero-gradient absolute inset-0" aria-hidden />
        <div className="bg-hero-gradient-bottom absolute inset-0" aria-hidden />
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="page-container flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6 sm:pb-8">
            <div className="min-w-0">
              <p
                key={index}
                className="animate-rise mb-3 text-sm text-canopy-foreground/90 motion-reduce:animate-none"
              >
                {active.caption}
              </p>
              <ol className="flex items-center gap-1.5">
                {slides.map((slide, i) => (
                  <li key={slide.src}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Show slide ${i + 1}: ${slide.caption}`}
                      aria-current={i === index ? 'true' : undefined}
                      className="group flex h-6 w-10 items-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-white/60 sm:w-14"
                    >
                      <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/30 transition-[height] duration-200 group-hover:h-1.5">
                        <span
                          data-testid={
                            i === index ? 'hero-progress' : undefined
                          }
                          onAnimationEnd={
                            i === index ? () => go(index + 1) : undefined
                          }
                          style={{
                            animationPlayState: playing ? 'running' : 'paused',
                          }}
                          className={cn(
                            'absolute inset-0 origin-left rounded-full bg-white',
                            i < index && 'scale-x-100',
                            i > index && 'scale-x-0',
                            i === index &&
                              'animate-hero-progress motion-reduce:scale-x-100 motion-reduce:animate-none',
                          )}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="onDark"
                size="icon"
                className="rounded-full"
                onClick={() => setUserPlaying(!playing)}
                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              >
                {playing ? <Pause /> : <Play />}
              </Button>
              <Button
                type="button"
                variant="onDark"
                size="icon"
                className="rounded-full"
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="onDark"
                size="icon"
                className="rounded-full"
                onClick={() => go(index + 1)}
                aria-label="Next slide"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
