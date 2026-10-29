'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import Image from 'next/image'
import { type KeyboardEvent, useCallback, useRef, useState } from 'react'
import { EASE_OUT_EXPO } from '@/lib/motion'
import type { GalleryImage } from '@/lib/summit'
import { cn } from '@/lib/utils'

/**
 * Tile placement for five photos. Mobile: one wide tile, then two pairs, so
 * no tile is left alone in a row. From `lg`: a six-column bento. Changing the
 * number of photos means revisiting this list.
 */
const TILE_LAYOUT = [
  'col-span-2 aspect-[4/3] lg:col-span-4 lg:row-span-2 lg:aspect-auto',
  'aspect-square lg:col-span-2 lg:row-span-2 lg:aspect-auto',
  'aspect-square lg:col-span-2 lg:row-span-2 lg:aspect-auto',
  'aspect-square lg:col-span-2 lg:row-span-2 lg:aspect-auto',
  'aspect-square lg:col-span-2 lg:row-span-2 lg:aspect-auto',
] as const

const SWIPE_DISTANCE = 60

/**
 * Photo gallery: a bento grid of tiles that opens into a lightbox.
 *
 * - The grid is plain markup, so photos and captions exist without JS.
 * - The lightbox is a Radix Dialog: focus trap, Escape, scroll lock and focus
 *   return to the tile that opened it come for free.
 * - Next/previous by button, by arrow keys, or by swiping on a touch screen.
 * - The idea (a tile that opens up into a larger view) is taken from
 *   useLayouts' Expandable Gallery, simplified: no shared-element morph, so
 *   it stays reliable inside a portal and with reduced motion.
 */
export function SummitGallery({
  images,
  className,
}: {
  images: readonly GalleryImage[]
  className?: string
}) {
  const [index, setIndex] = useState<number | null>(null)
  // The tile that opened the lightbox: focus goes back to it on close.
  const opener = useRef<HTMLButtonElement | null>(null)
  // +1 when moving forward, -1 backward: the photo enters from that side.
  const [direction, setDirection] = useState(1)
  const open = index !== null

  const go = useCallback(
    (step: number) => {
      setDirection(step)
      setIndex((current) =>
        current === null
          ? current
          : (current + step + images.length) % images.length,
      )
    },
    [images.length],
  )

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_DISTANCE) go(1)
    else if (info.offset.x >= SWIPE_DISTANCE) go(-1)
  }

  const current = index === null ? null : images[index]

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setIndex(null)
      }}
    >
      <ul
        className={cn(
          'grid grid-cols-2 gap-3 lg:auto-rows-[11rem] lg:grid-cols-6',
          className,
        )}
      >
        {images.map((image, i) => (
          <li
            key={image.id}
            className={cn(
              'group/tile relative',
              TILE_LAYOUT[i % TILE_LAYOUT.length],
            )}
          >
            <button
              type="button"
              onClick={(event) => {
                opener.current = event.currentTarget
                setDirection(1)
                setIndex(i)
              }}
              aria-label={`Open photo: ${image.caption}`}
              className="relative block size-full overflow-hidden rounded-2xl bg-muted outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1216px) 592px, (min-width: 1024px) 50vw, 100vw"
                style={{ objectPosition: image.position }}
                className="size-full object-cover outline -outline-offset-1 outline-black/10 transition-transform duration-500 ease-out-expo group-hover/tile:scale-105 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
              />
              <span
                aria-hidden
                className="bg-hero-gradient-bottom pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100"
              />
              <span
                aria-hidden
                className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-float backdrop-blur-sm transition-transform duration-300 ease-bounce group-hover/tile:scale-110 motion-reduce:transition-none"
              >
                <Expand className="size-4" />
              </span>
              <span
                aria-hidden
                className="text-on-photo pointer-events-none absolute inset-x-4 bottom-4 hidden translate-y-2 text-start text-sm font-medium text-canopy-foreground opacity-0 transition-[opacity,translate] duration-300 ease-out-expo group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-within/tile:translate-y-0 group-focus-within/tile:opacity-100 sm:block motion-reduce:transition-none"
              >
                {image.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open && current && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 bg-canopy/90 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              onKeyDown={onKeyDown}
              onCloseAutoFocus={(event) => {
                event.preventDefault()
                opener.current?.focus()
              }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none sm:p-8"
            >
              <Dialog.Title className="sr-only">
                {`Summit photo ${(index ?? 0) + 1} of ${images.length}`}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {current.alt}
              </Dialog.Description>

              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close gallery"
                  className="absolute end-3 top-3 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-canopy-foreground outline-none transition-colors duration-150 hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/60 sm:end-6 sm:top-6"
                >
                  <X aria-hidden className="size-6" />
                </button>
              </Dialog.Close>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.35, ease: EASE_OUT_EXPO },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.15 },
                }}
                className="flex w-full max-w-5xl flex-col items-center gap-4"
              >
                <div className="relative flex w-full items-center justify-center">
                  <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={direction}
                  >
                    <motion.figure
                      key={current.id}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 40 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3, ease: EASE_OUT_EXPO },
                      }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={onDragEnd}
                      className="m-0 flex touch-pan-y flex-col items-center gap-4"
                    >
                      <Image
                        src={current.src}
                        alt={current.alt}
                        width={current.width}
                        height={current.height}
                        sizes="(min-width: 1024px) 960px, 100vw"
                        draggable={false}
                        className="max-h-[70dvh] w-auto max-w-full select-none rounded-2xl object-contain outline -outline-offset-1 outline-white/10"
                      />
                      <figcaption className="max-w-2xl text-center text-canopy-foreground">
                        {current.caption}
                      </figcaption>
                    </motion.figure>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous photo"
                    className="flex size-12 items-center justify-center rounded-full bg-white/10 text-canopy-foreground outline-none transition-colors duration-150 hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/60"
                  >
                    <ChevronLeft
                      aria-hidden
                      className="size-6 rtl:rotate-180"
                    />
                  </button>
                  <p
                    aria-hidden
                    className="min-w-14 text-center text-sm tabular-nums text-canopy-muted"
                  >
                    {(index ?? 0) + 1} / {images.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next photo"
                    className="flex size-12 items-center justify-center rounded-full bg-white/10 text-canopy-foreground outline-none transition-colors duration-150 hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/60"
                  >
                    <ChevronRight
                      aria-hidden
                      className="size-6 rtl:rotate-180"
                    />
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
