'use client'

import { Cookie, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/use-cookie-consent'
import { COMPANY_INFO } from '@/lib/constants'
import { mapEmbedUrl } from '@/lib/maps'
import { cn } from '@/lib/utils'

/**
 * The office location on a map.
 *
 * Google's embed sets cookies and receives the visitor's IP address as soon
 * as it loads, so it only loads once the visitor has accepted cookies in the
 * banner (see lib/cookie-consent). After that it loads by itself, on this and
 * every later visit within 12 months, with no extra click. Until then (or if
 * they declined) a placeholder with the address is shown, and the "Get
 * directions" and "Open in Google Maps" links beside it work without consent.
 */
export function OfficeMap({ className }: { className?: string }) {
  const { state, reopen } = useCookieConsent()
  const loaded = state === 'accepted'

  return (
    <div
      data-office-map
      data-loaded={loaded}
      className={cn(
        'relative isolate aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-accent sm:aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]',
        className,
      )}
    >
      {loaded ? (
        <iframe
          title={`Map showing the ${COMPANY_INFO.shortName} office in ${COMPANY_INFO.address}`}
          src={mapEmbedUrl(COMPANY_INFO.address)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="bg-map-grid absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="relative flex size-14 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-primary/25 motion-reduce:animate-none"
            />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-float">
              <MapPin aria-hidden className="size-6" />
            </span>
          </span>
          <p className="font-display text-2xl text-canopy">
            {COMPANY_INFO.address}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {state === 'declined'
              ? 'You declined cookies, so the Google map is not loaded and Google has received nothing from you. Use the directions links, or change your choice to show the map here.'
              : 'The Google map appears here once you accept cookies. Until then Google receives nothing from you, and the directions links work as normal.'}
          </p>
          {state === 'declined' && (
            <Button variant="cta" onClick={reopen}>
              <Cookie />
              Change cookie choice
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
