import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Reveal, Stagger, StaggerItem } from '@/components/animations'
import { CopyButton } from '@/components/copy-button'
import { EnquiryForm } from '@/components/enquiry-form'
import { PhotoSlot } from '@/components/photo-slot'
import { PageHero } from '@/components/sections/page-hero'
import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'

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
  'font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline'

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Dara-Manihot"
        description="Ready to transform your agricultural operations with sustainable solutions? Let’s discuss how we can work together to create lasting impact."
      />

      {/* The enquiry form: the primary way to reach us. #enquiry is the
          target of "Enquire about this service" links on /services. */}
      <section
        id="enquiry"
        aria-labelledby="enquiry-title"
        className="scroll-mt-header section-y"
      >
        <div className="page-container grid items-start gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <Reveal>
            <h2 id="enquiry-title" className="text-title">
              Send us an enquiry
            </h2>
            <p className="mt-4 mb-8 text-lead text-muted-foreground">
              Tell us a little about what you need. You will get an email
              confirmation straight away and a reply from our team soon after.
            </p>
            <Card className="gap-0 p-6 sm:p-8">
              <Suspense
                fallback={
                  <p className="text-muted-foreground" aria-live="polite">
                    Loading the form…
                  </p>
                }
              >
                <EnquiryForm />
              </Suspense>
            </Card>
          </Reveal>
          <Reveal
            delay={0.1}
            className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+2rem)]"
          >
            <PhotoSlot
              id="contact-office"
              sizes="(min-width: 1024px) 440px, 100vw"
            />
            <p className="text-muted-foreground">
              Prefer to talk? Call us on{' '}
              <a
                href={`tel:${COMPANY_INFO.phones[0].tel}`}
                className={linkClass}
              >
                {COMPANY_INFO.phones[0].display}
              </a>{' '}
              during business hours, or write to{' '}
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className={`${linkClass} break-all`}
              >
                {COMPANY_INFO.email}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="page-container">
          <SectionHeading
            title="How to reach us"
            description="We’re here to answer your questions and discuss how our sustainable agriculture and renewable energy solutions can benefit your operations."
          />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <Card className="h-full gap-3 p-6">
                <Mail className="size-7 text-primary" aria-hidden />
                <h3 className="text-xl">Email address</h3>
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
                <p className="text-sm text-muted-foreground">
                  Send us an email anytime
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="h-full gap-3 p-6">
                <Phone className="size-7 text-primary" aria-hidden />
                <h3 className="text-xl">Phone numbers</h3>
                <ul className="space-y-1">
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
                <p className="text-sm text-muted-foreground">
                  Call us during business hours
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="h-full gap-3 p-6">
                <MapPin className="size-7 text-primary" aria-hidden />
                <h3 className="text-xl">Office location</h3>
                <p className="font-semibold">{COMPANY_INFO.address}</p>
                <p className="text-sm text-muted-foreground">
                  Visit us at our headquarters
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="h-full gap-3 p-6">
                <Clock className="size-7 text-primary" aria-hidden />
                <h3 className="text-xl">Business hours</h3>
                <p className="font-semibold">{COMPANY_INFO.hours}</p>
                <p className="text-sm text-muted-foreground">
                  We are here to help you
                </p>
              </Card>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <section className="section-y bg-muted">
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
                    className="mt-0.5 size-6 shrink-0 text-primary"
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
            <Card className="gap-5 border-transparent bg-canopy p-8 text-canopy-foreground sm:p-10">
              <h3 className="text-3xl">Ready to start?</h3>
              <p className="text-canopy-foreground/85">
                Send us a message and let’s discuss how we can help transform
                your agricultural operations with our sustainable solutions.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild variant="cta" size="lg" className="w-full">
                  <a href={`mailto:${COMPANY_INFO.email}`}>
                    <Send />
                    Send email
                  </a>
                </Button>
                <Button asChild variant="onDark" size="lg" className="w-full">
                  <a href={`tel:${COMPANY_INFO.phones[0].tel}`}>
                    <Phone />
                    Call now
                  </a>
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  )
}
