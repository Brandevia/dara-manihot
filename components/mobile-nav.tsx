'use client'

import * as Dialog from '@radix-ui/react-dialog'
import {
  ArrowRight,
  ChevronRight,
  FolderKanban,
  Home,
  Info,
  type LucideIcon,
  Mail,
  Menu,
  Phone,
  Wrench,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { isActivePath, type NavHref } from '@/components/nav-utils'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO, LEGAL_LINKS, NAVIGATION_LINKS } from '@/lib/constants'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Keyed by href: the compiler flags a nav link that has no icon.
const ICONS: Record<NavHref, LucideIcon> = {
  '/': Home,
  '/about': Info,
  '/services': Wrench,
  '/projects': FolderKanban,
  '/contact': Mail,
}

// Matches Tailwind's `md` breakpoint, where the desktop nav takes over.
const DESKTOP_QUERY = '(min-width: 48rem)'

/**
 * The panel grows out of the hamburger (its transform-origin, --menu-origin in
 * globals.css, is the button's centre) and its contents follow one by one. On
 * close the contents drop away first, then the panel shrinks back into the
 * button. `when: 'afterChildren'` is what orders the exit.
 */
const panel: Variants = {
  closed: {
    scale: 0.06,
    opacity: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.03,
      staggerDirection: -1,
      scale: { duration: 0.34, ease: [0.5, 0, 0.75, 0] },
      opacity: { duration: 0.16, delay: 0.2 },
    },
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      delayChildren: 0.14,
      staggerChildren: 0.05,
      scale: { type: 'spring', stiffness: 280, damping: 24 },
      opacity: { duration: 0.18 },
    },
  },
}

const item: Variants = {
  closed: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.12 } },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: EASE_OUT_EXPO },
  },
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)

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
      <Dialog.Trigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className="size-11 rounded-full md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="relative size-6">
            <Menu
              aria-hidden
              className={cn(
                'absolute inset-0 size-6 transition-[opacity,transform] duration-300 ease-bounce motion-reduce:transition-none',
                open && 'rotate-90 scale-50 opacity-0',
              )}
            />
            <X
              aria-hidden
              className={cn(
                'absolute inset-0 size-6 transition-[opacity,transform] duration-300 ease-bounce motion-reduce:transition-none',
                !open && '-rotate-90 scale-50 opacity-0',
              )}
            />
          </span>
        </Button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Under the header (z-40), so the hamburger stays clickable. */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-30 bg-canopy/25 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby="mobile-nav-desc"
              // Pressing the hamburger again must close the menu, not be
              // swallowed as an "outside click" that then re-opens it.
              onInteractOutside={(e) => {
                if (triggerRef.current?.contains(e.target as Node))
                  e.preventDefault()
              }}
            >
              <motion.div
                data-slot="menu-panel"
                // `glass` + data-scrolled gives the firmer frosted tint.
                data-scrolled="true"
                variants={panel}
                initial="closed"
                animate="open"
                exit="closed"
                style={{ transformOrigin: 'var(--menu-origin)' }}
                className="glass fixed top-(--header-h) right-(--container-pad) z-50 max-h-[calc(100svh-var(--header-h)-1rem)] w-(--menu-w) overflow-y-auto overscroll-contain rounded-3xl p-3 outline-none"
              >
                <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
                <Dialog.Description id="mobile-nav-desc" className="sr-only">
                  Browse the pages of the {COMPANY_INFO.shortName} website.
                </Dialog.Description>

                <nav aria-label="Mobile">
                  <ul className="space-y-1">
                    {NAVIGATION_LINKS.map((link) => {
                      const Icon = ICONS[link.href]
                      const active = isActivePath(pathname, link.href)
                      return (
                        <motion.li key={link.href} variants={item}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'group/item flex items-center gap-3.5 rounded-2xl p-2.5 pr-3 font-medium outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                              active
                                ? 'bg-accent text-accent-foreground'
                                : 'text-foreground hover:bg-accent/60',
                            )}
                          >
                            <span
                              className={cn(
                                'flex size-10 items-center justify-center rounded-xl transition-transform duration-300 ease-bounce group-hover/item:scale-110 group-active/item:scale-95',
                                active
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card text-primary',
                              )}
                            >
                              <Icon className="size-5" />
                            </span>
                            <span className="flex-1 text-base">
                              {link.name}
                            </span>
                            <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover/item:translate-x-0.5" />
                          </Link>
                        </motion.li>
                      )
                    })}
                  </ul>
                </nav>

                <motion.div
                  variants={item}
                  className="mt-3 space-y-3 border-t border-border pt-4"
                >
                  <Button asChild variant="cta" size="lg" className="w-full">
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Get in touch
                      <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${COMPANY_INFO.phones[0].tel}`}>
                      <Phone />
                      {COMPANY_INFO.phones[0].display}
                    </a>
                  </Button>
                  <ul className="flex justify-center gap-5 pt-1 text-xs text-muted-foreground">
                    {LEGAL_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* For keyboard and screen-reader users, who cannot reach the
                    hamburger while the dialog traps focus. */}
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    className="sr-only w-full focus-visible:not-sr-only"
                  >
                    Close menu
                  </Button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
