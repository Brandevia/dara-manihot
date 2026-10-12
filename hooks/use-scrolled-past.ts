'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * True once the page has scrolled past `threshold` pixels.
 *
 * Built on useSyncExternalStore: the snapshot is a boolean, so React only
 * re-renders when it flips, not on every scroll event (the previous hook
 * stored the raw scroll offset in state and re-rendered the whole nav on
 * every scroll tick).
 */
export function useScrolledPast(threshold: number): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('scroll', onChange, { passive: true })
    return () => window.removeEventListener('scroll', onChange)
  }, [])

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
