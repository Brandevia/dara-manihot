'use client'

import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO } from '@/lib/constants'
import { mapEmbedUrl } from '@/lib/maps'
import { cn } from '@/lib/utils'

/**
 * The office location on a map.
 *
 * Google's embed sets cookies and receives the visitor's IP address as soon
 * as it loads, and the privacy policy promises no cookies. So the map is
 * shown as a placeholder first and the real one loads only when the visitor
 * asks for it. The "Get directions" and "Open in Google Maps" links beside it
 * work without it.
 */
export function OfficeMap({ className }: { className?: string }) {
  const [loaded, setLoaded] = useState(false)

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
            <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float">
              <MapPin aria-hidden className="size-6" />
            </span>
          </span>
          <p className="font-display text-2xl text-canopy">
            {COMPANY_INFO.address}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The map is provided by Google and loads only when you ask for it, so
            Google receives nothing from you until then.
          </p>
          <Button variant="cta" onClick={() => setLoaded(true)}>
            <MapPin />
            Load interactive map
          </Button>
        </div>
      )}
    </div>
  )
}
