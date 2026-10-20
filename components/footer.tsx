import { Facebook, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import {
  COMPANY_INFO,
  LEGAL_LINKS,
  NAVIGATION_LINKS,
  SOCIAL_LINKS,
} from '@/lib/constants'
import { SERVICES } from '@/lib/services'

const SOCIALS = [
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, Icon: Linkedin },
  { label: 'X (Twitter)', href: SOCIAL_LINKS.twitter, Icon: Twitter },
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, Icon: Facebook },
]

const linkClass =
  'text-canopy-muted underline-offset-4 transition-colors duration-200 hover:text-canopy-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canopy-foreground'

const headingClass =
  'mb-5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-canopy-foreground'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    // The wrapper is the page background, so the footer's rounded top corners
    // always meet white, whatever the last section of a page looks like.
    <div className="bg-background">
      <footer className="relative isolate overflow-hidden rounded-t-3xl bg-canopy text-canopy-foreground sm:rounded-t-[3rem]">
        <div className="page-container pt-16">
          <div className="grid gap-12 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.2fr] lg:gap-10">
            <div className="space-y-5">
              <Link
                href="/"
                aria-label={`${COMPANY_INFO.shortName} home`}
                className="inline-flex rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-white/50"
              >
                {/* The logo sits on a light plate so it stays legible whatever its
                  colours, on the deep-green footer. */}
                <span className="rounded-2xl bg-card p-3 shadow-float">
                  <Logo className="h-12" />
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-canopy-muted">
                {COMPANY_INFO.description}
              </p>
              <ul className="flex gap-2">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${COMPANY_INFO.shortName} on ${label}`}
                      className="flex size-10 items-center justify-center rounded-full bg-white/10 text-canopy-foreground transition-[background-color,transform] duration-300 ease-bounce hover:-translate-y-0.5 hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-white/50 focus-visible:outline-none"
                    >
                      <Icon className="size-4.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Footer">
              <h2 className={headingClass}>Quick links</h2>
              <ul className="space-y-3">
                {NAVIGATION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className={headingClass}>Our services</h2>
              <ul className="space-y-3">
                {SERVICES.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services/${service.id}`}
                      className={linkClass}
                    >
                      {service.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={headingClass}>Talk to us</h2>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className={`${linkClass} break-all`}
                  >
                    {COMPANY_INFO.email}
                  </a>
                </li>
                {COMPANY_INFO.phones.map((phone) => (
                  <li key={phone.tel}>
                    <a href={`tel:${phone.tel}`} className={linkClass}>
                      {phone.display}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/contact#map" className={linkClass}>
                    {COMPANY_INFO.address}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 text-center text-sm text-canopy-muted sm:flex-row sm:text-left">
            <p>
              © {currentYear} {COMPANY_INFO.name}. All rights reserved.
            </p>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the footer's bottom edge. Purely
          decorative, so it is hidden from assistive tech and not selectable. */}
        <p
          aria-hidden
          className="pointer-events-none mt-6 -mb-[0.2em] select-none text-center font-bold leading-none tracking-tight text-[clamp(3rem,13vw,13rem)] text-canopy-muted/10"
        >
          {COMPANY_INFO.shortName}
        </p>
      </footer>
    </div>
  )
}
