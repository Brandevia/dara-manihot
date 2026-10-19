'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    // Floating pill, fixed to the top. The <header> is a click-through strip;
    // only the pill takes pointer events. Pages clear it with `--header-h`.
    <header
      data-scrolled={scrolled}
      className="group pointer-events-none fixed inset-x-0 top-0 z-40 h-(--header-h) px-(--container-pad) pt-(--header-top)"
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto flex w-full items-center justify-between gap-6 rounded-full p-2 pl-5 ring-1 ring-white/40 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 md:w-fit md:gap-16 md:pl-6',
          scrolled ? 'bg-background/85 shadow-float' : 'bg-background/55 shadow-lift',
        )}
      >
        <Link
          href="/"
          aria-label="Dara-Manihot home"
          className="flex shrink-0 items-center gap-2 rounded-full outline-none transition-transform duration-300 ease-bounce hover:scale-[1.03] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {/* app/icon.png is served at /icon.png by Next's metadata routes. */}
          <Image src="/icon.png" alt="" width={24} height={24} priority className="size-6 object-contain" />
          <span className="font-bold text-foreground text-xl">Daramanihot</span>
        </Link>

        {/* `contents`: links and CTA become direct children of the pill, so one even gap spaces all three groups. */}
        <div className="hidden md:contents">
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
                      aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                    >
                      {link.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button asChild variant="leaf" className="h-13 rounded-full px-5.5 font-semibold text-base">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
