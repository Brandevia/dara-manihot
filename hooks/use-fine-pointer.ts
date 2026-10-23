'use client'

import { useSyncExternalStore } from 'react'

/** A mouse or trackpad that can hover. Phones and tablets do not match. */
const QUERY = '(hover: hover) and (pointer: fine)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * True when the visitor has a precise, hovering pointer (desktop and laptop).
 * Used to decide between a styled listbox and the phone's own native picker.
 *
 * The server and the first client render both report `false`, so hydration
 * always matches and a touch device never sees anything but the native control.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
