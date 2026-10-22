'use client'

import { resetConsent } from '@/lib/cookie-consent'

/**
 * Footer control to change your mind: forgets the stored choice, so the
 * banner asks again (and the Contact page map is withdrawn until you accept).
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Cookie settings
    </button>
  )
}
