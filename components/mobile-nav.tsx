'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { isActivePath } from '@/components/nav-utils'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { COMPANY_INFO, NAVIGATION_LINKS } from '@/lib/constants'
import { EASE_STANDARD } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Matches Tailwind's `lg` breakpoint, where the desktop nav takes over. The
// desktop bar needs about 800px (logo, five links, the call to action and the
// side padding, none of which can shrink), so `md` (768px) is too narrow and
// `lg` is the next step up. If a link or label makes the bar wider, raise this
// rather than squeezing the spacing. Keep this, the `lg:` classes in
// site-header.tsx and the `lg:hidden` below in step (tests/header-breakpoint).
const DESKTOP_QUERY = '(min-width: 64rem)'

/**
 * Timings (seconds). Opening is the slower half so the eye can follow the
 * panel down; closing is quicker because the visitor already knows where it
 * goes (DESIGN.md: exits are shorter than entrances). The panel stays under
 * 300ms; the links trail it by a 40ms stagger.
 */
const OPEN = {
  panel: 0.28,
  item: 0.24,
  stagger: 0.04,
  itemDelay: 0.06,
} as const
const CLOSE = {
  panel: 0.2,
  item: 0.1,
  stagger: 0.015,
  panelDelay: 0.04,
} as const

// `clip-path` insets, always written with `%` on every side so Motion can
// interpolate between them. Folded = nothing visible, revealed = everything.
const FOLDED = 'inset(0% 0% 100% 0%)'
const REVEALED = 'inset(0% 0% 0% 0%)'

/**
 * The panel hangs from the bottom edge of the header bar. It is laid out at
 * full height straight away and revealed top-down with `clip-path` while the
 * links fade and slide in one after another. On close the links lift away in
 * reverse order and the panel folds back up under the bar. `clip-path` runs
 * off the main thread and never reflows the page, unlike animating `height`.
 *
 * With `prefers-reduced-motion` nothing moves: the panel only cross-fades.
 */
function panelVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      closed: { opacity: 0, transition: { duration: 0.15 } },
      open: { opacity: 1, transition: { duration: 0.15 } },
    }
  }
  return {
    closed: {
      clipPath: FOLDED,
      transition: {
        staggerChildren: CLOSE.stagger,
        staggerDirection: -1,
        clipPath: {
          duration: CLOSE.panel,
          delay: CLOSE.panelDelay,
          ease: EASE_STANDARD,
        },
      },
    },
    open: {
      clipPath: REVEALED,
      transition: {
        delayChildren: OPEN.itemDelay,
        staggerChildren: OPEN.stagger,
        clipPath: { duration: OPEN.panel, ease: EASE_STANDARD },
      },
    },
  }
}

function itemVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      closed: { opacity: 0, transition: { duration: 0.1 } },
      open: { opacity: 1, transition: { duration: 0.15 } },
    }
  }
  return {
    closed: {
      opacity: 0,
      y: -8,
      transition: { duration: CLOSE.item, ease: EASE_STANDARD },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: OPEN.item, ease: EASE_STANDARD },
    },
  }
}

const bar =
  'block h-0.5 w-5 rounded-full bg-current motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-standard'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const reduced = usePrefersReducedMotion()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panel = useMemo(() => panelVariants(reduced), [reduced])
  const item = useMemo(() => itemVariants(reduced), [reduced])

  // Navigating anywhere (a link, back/forward) closes the menu. Done while
  // rendering, which is React's recommended way to reset state on a change.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  // If the viewport grows past the mobile layout (rotation, resize) while the
  // menu is open, close it: its trigger is hidden at that size.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Two lines that rotate into an X. Radix supplies aria-expanded,
          aria-controls and aria-haspopup; the label says what a press does. */}
      <Dialog.Trigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className="-me-2 size-11 rounded-full transition-[background-color,scale] duration-150 ease-out active:scale-[0.96] lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span
            aria-hidden
            className="flex size-6 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={cn(bar, open && 'translate-y-[3.5px] rotate-45')}
            />
            <span
              className={cn(bar, open && '-translate-y-[3.5px] -rotate-45')}
            />
          </span>
        </Button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Under the header bar (z-40), so the toggle stays pressable. Any
                press on it, or anywhere outside the panel, closes the menu. */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-30 bg-canopy/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby="mobile-nav-desc"
              // Focus the panel itself, without scrolling: while it is still
              // being revealed, focusing a link inside would scroll the box.
              onOpenAutoFocus={(e) => {
                e.preventDefault()
                panelRef.current?.focus({ preventScroll: true })
              }}
              // Pressing the toggle again must close the menu, not be
              // swallowed as an "outside click" that then re-opens it.
              onInteractOutside={(e) => {
                if (triggerRef.current?.contains(e.target as Node))
                  e.preventDefault()
              }}
            >
              <motion.div
                ref={panelRef}
                tabIndex={-1}
                data-slot="menu-panel"
                variants={panel}
                initial="closed"
                animate="open"
                exit="closed"
                // Full width, flush under the header bar (same top edge as the
                // bar's bottom border). The inner box scrolls if a short
                // screen needs it, without scrolling the page behind.
                className="fixed inset-x-0 top-(--header-h) z-50 overflow-hidden rounded-b-2xl border-b border-border bg-background outline-none"
              >
                <div className="max-h-[calc(100svh-var(--header-h))] overflow-y-auto overscroll-contain">
                  {/* Same width and side padding as the bar, so the links
                      start on the logo's edge. */}
                  <div className="page-container pt-2 pb-5">
                    <Dialog.Title className="sr-only">
                      Site navigation
                    </Dialog.Title>
                    <Dialog.Description
                      id="mobile-nav-desc"
                      className="sr-only"
                    >
                      Browse the pages of the {COMPANY_INFO.shortName} website.
                    </Dialog.Description>

                    <nav aria-label="Mobile">
                      {/* Rows reach 12px past the content edge, so their
                        text lines up with the logo while the tap and
                        active backgrounds keep a comfortable inset. */}
                      <ul className="-mx-3 flex flex-col gap-1">
                        {NAVIGATION_LINKS.map((link) => {
                          const active = isActivePath(pathname, link.href)
                          return (
                            <motion.li key={link.href} variants={item}>
                              <Link
                                href={link.href}
                                onClick={() => setOpen(false)}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                  'flex min-h-12 items-center rounded-lg px-3 text-lg outline-none [-webkit-tap-highlight-color:transparent] transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent',
                                  active
                                    ? 'bg-accent font-semibold text-accent-foreground'
                                    : 'text-foreground hover:bg-accent/60',
                                )}
                              >
                                {link.name}
                              </Link>
                            </motion.li>
                          )
                        })}
                      </ul>
                    </nav>

                    <motion.div variants={item} className="mt-3">
                      <Button
                        asChild
                        variant="leaf"
                        className="h-13 w-full rounded-full text-base font-semibold sm:w-auto sm:px-10"
                      >
                        <Link href="/services" onClick={() => setOpen(false)}>
                          Explore Our Services
                        </Link>
                      </Button>
                    </motion.div>

                    {/* For keyboard and screen-reader users, who cannot reach
                      the toggle while the dialog traps focus. */}
                    <Dialog.Close asChild>
                      <Button
                        variant="ghost"
                        className="sr-only mt-2 w-full focus-visible:not-sr-only"
                      >
                        Close menu
                      </Button>
                    </Dialog.Close>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
