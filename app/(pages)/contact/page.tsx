import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import {
  Reveal,
  Stagger,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from '@/components/animations'
import { CopyButton } from '@/components/copy-button'
import { EnquiryForm } from '@/components/enquiry-form'
import { OfficeMap } from '@/components/office-map'
import { PhotoSlot } from '@/components/photo-slot'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'
import { mapDirectionsUrl, mapSearchUrl } from '@/lib/maps'

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Talk to Dara-Manihot about sustainable agriculture, renewable energy and green hydrogen projects. Call, email or visit us in Ketu, Lagos.',
}

const whyContactUs = [
  'Expert consultation on sustainable agriculture solutions',
  'Custom renewable energy system design and implementation',
  'Partnership opportunities in green technology projects',
  'Training programs for farmers and agro-processors',
  'Technical support for circular economy initiatives',
]

const linkClass =
  'font-medium text-foreground underline-offset-4 hover:text-primary hover:underline'

/** One line of the contact list: round icon, small label, value(s). */
function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <StaggerListItem className="flex items-center gap-4 py-4">
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {children}
      </div>
    </StaggerListItem>
  )
}

export default function ContactPage() {
  return (
    // On the page background all the way down, so the footer's rounded
    // corners meet white. (It used to fade into green; that clashed with them.)
    <>
      {/* The enquiry form is the primary way to reach us. #enquiry is the
          target of "Enquire about this service" links on /services. */}
      <section
        id="enquiry"
        aria-labelledby="contact-title"
        className="scroll-mt-header pt-[calc(var(--header-h)+3rem)] pb-(--section-y)"
      >
        <div className="page-container grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Contact {COMPANY_INFO.shortName}
              </p>
              <h1 id="contact-title" className="mt-5 text-display text-canopy">
                Let’s build the future together
              </h1>
              <p className="mt-6 max-w-xl text-lead text-muted-foreground">
                Ready to transform your agricultural operations with sustainable
                solutions? Let’s discuss how we can work together to create
                lasting impact.
              </p>
            </Reveal>

            <StaggerList className="mt-10 divide-y divide-border border-y border-border">
              <ContactRow icon={Mail} label="Email">
                <div className="flex items-center gap-1">
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className={`${linkClass} break-all`}
                  >
                    {COMPANY_INFO.email}
                  </a>
                  <CopyButton
                    value={COMPANY_INFO.email}
                    label="email address"
                  />
                </div>
              </ContactRow>
              <ContactRow icon={Phone} label="Phone">
                <ul>
                  {COMPANY_INFO.phones.map((phone) => (
                    <li key={phone.tel} className="flex items-center gap-1">
                      <a href={`tel:${phone.tel}`} className={linkClass}>
                        {phone.display}
                      </a>
                      <CopyButton
                        value={phone.display}
                        label={`phone number ${phone.display}`}
                      />
                    </li>
                  ))}
                </ul>
              </ContactRow>
              <ContactRow icon={Clock} label="Hours">
                <p className="font-medium">{COMPANY_INFO.hours}</p>
              </ContactRow>
              <ContactRow icon={MapPin} label="Office">
                <p className="font-medium">{COMPANY_INFO.address}</p>
              </ContactRow>
            </StaggerList>
          </div>

          <Reveal
            delay={0.1}
            className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]"
          >
            {/* surface-canopy re-points the colour tokens, so the form's own
                fields, labels and errors restyle for the dark card. */}
            <Card className="surface-canopy gap-0 rounded-3xl border-transparent bg-canopy p-6 text-canopy-foreground shadow-lift sm:p-10">
              <h2 className="text-3xl">Send us an enquiry</h2>
              <p className="mt-3 mb-8 text-canopy-muted">
                Tell us a little about what you need. You will get an email
                confirmation straight away and a reply from our team soon after.
              </p>
              <Suspense
                fallback={
                  <p className="text-canopy-muted" aria-live="polite">
                    Loading the form…
                  </p>
                }
              >
                <EnquiryForm />
              </Suspense>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="pb-(--section-y)">
        <div className="page-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading title="Why get in touch?" className="mb-6" />
            <Reveal delay={0.1}>
              <p className="mb-8 text-lg text-muted-foreground">
                Whether you’re a farmer looking to adopt sustainable practices,
                an agro-processor seeking renewable energy solutions, or an
                organization interested in partnership opportunities, we’re here
                to help.
              </p>
            </Reveal>
            <Stagger className="space-y-4">
              {whyContactUs.map((reason) => (
                <StaggerItem key={reason} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-6 shrink-0 text-secondary"
                    aria-hidden
                  />
                  <p className="leading-relaxed text-muted-foreground">
                    {reason}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal>
            <PhotoSlot
              id="contact-office"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="shadow-lift"
            />
          </Reveal>
        </div>
      </section>

      {/* Office location. #map is the target of the footer's address link. */}
      <section
        id="map"
        aria-labelledby="map-title"
        className="scroll-mt-header pb-(--section-y)"
      >
        <div className="page-container grid items-stretch gap-10 lg:grid-cols-[1fr_1.8fr] lg:gap-16">
          <Reveal className="self-center">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Find us
            </p>
            <h2 id="map-title" className="mt-4 text-title text-canopy">
              Visit our office
            </h2>
            <address className="mt-6 text-lead text-muted-foreground not-italic">
              {COMPANY_INFO.name}
              <br />
              {COMPANY_INFO.address}
            </address>
            <p className="mt-2 text-muted-foreground">{COMPANY_INFO.hours}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <a
                  href={mapDirectionsUrl(COMPANY_INFO.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation />
                  Get directions
                  <span className="sr-only">
                    {' '}
                    (opens Google Maps in a new tab)
                  </span>
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href={mapSearchUrl(COMPANY_INFO.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                  <ExternalLink />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex">
            <OfficeMap className="w-full" />
          </Reveal>
        </div>
      </section>
    </>
  )
}
