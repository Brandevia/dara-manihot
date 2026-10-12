import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
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
  'text-sm text-canopy-muted underline-offset-4 transition-colors duration-200 hover:text-canopy-foreground hover:underline'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-canopy text-canopy-foreground">
      <div className="page-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.3fr]">
          <div className="space-y-5">
            {/* The logo has dark lettering, so it sits on a light plate. */}
            <div className="inline-block rounded-xl bg-background p-3">
              <Logo className="h-14" />
            </div>
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
                    <Icon className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h2 className="mb-4 font-display text-lg">Quick links</h2>
            <ul className="space-y-2.5">
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
            <h2 className="mb-4 font-display text-lg">Our services</h2>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <Link href={`/services#${service.id}`} className={linkClass}>
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg">Contact us</h2>
            <ul className="space-y-3 text-sm text-canopy-muted">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{COMPANY_INFO.address}</span>
              </li>
              {COMPANY_INFO.phones.map((phone) => (
                <li key={phone.tel} className="flex gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`tel:${phone.tel}`}
                    className="underline-offset-4 hover:text-canopy-foreground hover:underline"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="break-all underline-offset-4 hover:text-canopy-foreground hover:underline"
                >
                  {COMPANY_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/15" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-canopy-muted sm:flex-row sm:text-left">
          <p>
            © {currentYear} {COMPANY_INFO.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
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
    </footer>
  )
}
