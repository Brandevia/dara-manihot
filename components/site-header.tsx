'use client'

import { ArrowRight } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()
  const scrolled = useScrolledPast(8)

  return (
    // Sticky, not fixed: it keeps its own height in the layout, so no page
    // needs a magic top-padding to clear it. Height never changes on scroll
    // (only shadow/border do), so nothing shifts.
    <header
      data-scrolled={scrolled}
      className={cn(
        'sticky top-0 z-40 h-(--header-h) border-b backdrop-blur-md transition-[box-shadow,background-color,border-color] duration-300',
        scrolled
          ? 'border-border bg-background/95 shadow-sm'
          : 'border-transparent bg-background/80',
      )}
    >
      <div className="page-container flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Dara-Manihot home"
          className="shrink-0 rounded-md outline-none transition-transform duration-300 ease-bounce hover:scale-[1.03] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Logo priority />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {NAVIGATION_LINKS.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    active={isActivePath(pathname, link.href)}
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

          <Button asChild variant="cta">
            <Link href="/contact">
              Get in touch
              <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
