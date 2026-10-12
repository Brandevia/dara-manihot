'use client'

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
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/logo'
import { isActivePath, type NavHref } from '@/components/nav-utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { COMPANY_INFO, LEGAL_LINKS, NAVIGATION_LINKS } from '@/lib/constants'
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // If the viewport grows past the mobile layout (rotation, resize) while the
  // drawer is open, close it: its trigger is hidden at that size.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent aria-describedby="mobile-nav-desc">
        <SheetHeader className="items-start border-b pr-16">
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <SheetDescription id="mobile-nav-desc" className="sr-only">
            Browse the pages of the {COMPANY_INFO.shortName} website.
          </SheetDescription>
          <Logo className="h-11" />
        </SheetHeader>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAVIGATION_LINKS.map((link, i) => {
              const Icon = ICONS[link.href]
              const active = isActivePath(pathname, link.href)
              return (
                <li
                  key={link.href}
                  className="animate-rise motion-reduce:animate-none"
                  style={{ animationDelay: `${180 + i * 55}ms` }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group/item flex items-center gap-3.5 rounded-xl p-2.5 pr-3 font-medium outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg transition-transform duration-300 ease-bounce group-hover/item:scale-110 group-active/item:scale-95',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-primary group-hover/item:bg-accent',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1 text-base">{link.name}</span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover/item:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <SheetFooter className="gap-3 border-t">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
