'use client'

import { ChevronDown, Cookie } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/use-cookie-consent'
import { cn } from '@/lib/utils'

/**
 * An accessible on/off switch. `role="switch"` on a real <button>, so it is
 * keyboard operable (Space and Enter) and announced as "on" or "off".
 */
function Switch({
  checked,
  disabled = false,
  onCheckedChange,
  labelId,
  descriptionId,
}: {
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (next: boolean) => void
  labelId: string
  descriptionId: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative mt-0.5 h-7 w-12 shrink-0 rounded-full outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none',
        checked ? 'bg-primary' : 'bg-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1 left-1 size-5 rounded-full bg-card shadow-xs transition-transform duration-200 motion-reduce:transition-none',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

/**
 * Asks, once, which cookies the visitor allows. Two switches:
 *
 * - Essential: always on and locked. The site sets no cookies of its own, so
 *   this is what keeps it working and nothing more.
 * - Non-essential: off by default. Today that is one thing, the Google map on
 *   the Contact page, because Google receives the visitor's IP address and may
 *   set cookies when it loads. Turning it on shows why, in plain words.
 *
 * "Reject non-essential" and "Accept all" are the same size and weight, so
 * saying no is as easy as saying yes. "Save choices" applies the switches as
 * they are set. It does not block the page, so it is a non-modal dialog and
 * takes no focus on a first visit. When a visitor reopens it from the footer
 * ("Cookie settings"), focus moves to it.
 *
 * Renders nothing on the server and during hydration (`loading`), and nothing
 * once a choice is on record, so returning visitors never see a flash.
 */
export function CookieBanner() {
  const { state, accept, decline } = useCookieConsent()
  const ref = useRef<HTMLDivElement>(null)
  const previous = useRef(state)
  const [nonEssential, setNonEssential] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`

  useEffect(() => {
    const reopened =
      state === 'unset' &&
      (previous.current === 'accepted' || previous.current === 'declined')
    if (reopened) ref.current?.focus()
    previous.current = state
  }, [state])

  if (state !== 'unset') return null

  const toggleNonEssential = (next: boolean) => {
    setNonEssential(next)
    // Turning it on is the moment the visitor needs the reasoning.
    if (next) setWhyOpen(true)
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={id('title')}
      aria-describedby={id('description')}
      tabIndex={-1}
      className="animate-rise fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-float outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:animate-none sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-lg sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary"
        >
          <Cookie className="size-5" />
        </span>
        <div>
          <h2 id={id('title')} className="font-display text-xl text-foreground">
            Cookie preferences
          </h2>
          <p
            id={id('description')}
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            This site sets no cookies of its own. Choose what else may load. We
            remember your choice on this device for 12 months, and you can
            change it any time from “Cookie settings” in the footer. See our{' '}
            <Link
              href="/privacy#cookies"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
        <li className="flex items-start justify-between gap-4 p-3 sm:p-4">
          <div>
            <p
              id={id('essential-label')}
              className="font-medium text-foreground"
            >
              Essential
            </p>
            <p
              id={id('essential-description')}
              className="mt-1 text-sm leading-relaxed text-muted-foreground"
            >
              Keeps the site working. Always on.
            </p>
          </div>
          <Switch
            checked
            disabled
            labelId={id('essential-label')}
            descriptionId={id('essential-description')}
          />
        </li>
        <li className="flex items-start justify-between gap-4 p-3 sm:p-4">
          <div>
            <p
              id={id('non-essential-label')}
              className="font-medium text-foreground"
            >
              Non-essential
            </p>
            <p
              id={id('non-essential-description')}
              className="mt-1 text-sm leading-relaxed text-muted-foreground"
            >
              The Google map on our Contact page.
            </p>
          </div>
          <Switch
            checked={nonEssential}
            onCheckedChange={toggleNonEssential}
            labelId={id('non-essential-label')}
            descriptionId={id('non-essential-description')}
          />
        </li>
      </ul>

      <div className="mt-3">
        <button
          type="button"
          aria-expanded={whyOpen}
          aria-controls={id('why')}
          onClick={() => setWhyOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Why does the map need cookies?
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              whyOpen && 'rotate-180',
            )}
          />
        </button>
        {whyOpen && (
          <div
            id={id('why')}
            className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground"
          >
            <p>
              The map is an embed from Google. When it loads, your browser
              contacts Google directly, so Google receives your IP address and
              browser details and may set its own cookies, under Google’s
              privacy policy.
            </p>
            <p>
              If you leave this off, nothing is sent to Google. The Contact page
              shows “Get directions” and “Open in Google Maps” links instead,
              and the rest of the site works exactly the same.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <Button type="button" variant="outline" size="lg" onClick={decline}>
          Reject non-essential
        </Button>
        <Button type="button" variant="cta" size="lg" onClick={accept}>
          Accept all
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="col-span-2"
          onClick={nonEssential ? accept : decline}
        >
          Save choices
        </Button>
      </div>
    </div>
  )
}
