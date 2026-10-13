import type { NAVIGATION_LINKS } from '@/lib/constants'

export type NavHref = (typeof NAVIGATION_LINKS)[number]['href']

/** A nav item is active on its own route and on any child route. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
