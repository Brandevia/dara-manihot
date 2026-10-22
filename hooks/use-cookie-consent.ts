'use client'

import { useSyncExternalStore } from 'react'
import {
  type ConsentState,
  getConsentSnapshot,
  getServerConsentSnapshot,
  resetConsent,
  setConsent,
  subscribeConsent,
} from '@/lib/cookie-consent'

/**
 * The visitor's cookie choice, kept in step across components and tabs.
 * `state` is `loading` on the server and during hydration, so server and
 * client markup match.
 */
export function useCookieConsent(): {
  state: ConsentState
  accept: () => void
  decline: () => void
  /** Forget the choice so the banner asks again. */
  reopen: () => void
} {
  const state = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  )
  return {
    state,
    accept: () => setConsent('accepted'),
    decline: () => setConsent('declined'),
    reopen: resetConsent,
  }
}
