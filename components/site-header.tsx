'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { MobileNav } from '@/components/mobile-nav'
import { isActivePath } from '@/components/nav-utils'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { useScrolledPast } from '@/hooks/use-scrolled-past'
import { NAVIGATION_LINKS } from '@/lib/constants'

export function SiteHeader() {
  const pathname = usePathname()
  const scrolled = useScrolledPast(8)

  return (
    // A conventional bar: full width, solid, fixed to the top. Logo on the
    // leading edge, links and the call to action on the trailing edge. Pages
    // clear it with `--header-h`; the mobile menu hangs from its bottom edge.
    // `pointer-events-auto`: Radix sets `pointer-events: none` on <body> while
    // the menu is open, and the toggle in this bar must stay pressable.
    <header
      data-scrolled={scrolled}
      className="pointer-events-auto fixed inset-x-0 top-0 z-40 h-(--header-h) border-b border-border bg-background transition-shadow duration-200 data-[scrolled=true]:shadow-lift"
    >
      {/* Same width and side padding as every page section, so the logo's
          edge lines up with the content below it at any viewport. */}
      <div className="page-container flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Dara-Manihot home"
          className="flex shrink-0 items-center rounded-md outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {/* The wordmark is part of the image, so there is no text label. */}
          <Logo priority className="h-11 lg:h-12" />
        </Link>

        {/* Desktop navigation. Must stay in step with the hamburger below and
            DESKTOP_QUERY in mobile-nav.tsx (tests/header-breakpoint). */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          <NavigationMenu className="flex-none">
            <NavigationMenuList>
              {NAVIGATION_LINKS.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    active={isActivePath(pathname, link.href)}
                    className="font-normal text-base text-foreground"
                  >
                    <Link
                      href={link.href}
                      aria-current={
                        isActivePath(pathname, link.href) ? 'page' : undefined
                      }
                    >
                      {link.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            asChild
            variant="leaf"
            className="h-12 rounded-full px-5.5 font-semibold text-base"
          >
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
