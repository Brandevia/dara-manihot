'use client'

import { useInView } from 'motion/react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { easeOutQuart, formatFigure, parseFigure } from '@/lib/figure'
import { COUNT_DURATION_MS, REVEAL_VIEWPORT } from '@/lib/motion'

/**
 * Shows a figure ("500+", "5", "30% cost reduction target") that counts up
 * from zero to the real value the first time it scrolls into view.
 *
 * - The real figure is in the markup from the start (server render, no-JS,
 *   search engines, screen readers). Only the visible copy animates, and it
 *   is hidden from assistive tech so nobody hears "1, 2, 3 ... 500".
 * - With `prefers-reduced-motion` the real figure is shown straight away.
 * - Text with no number in it is rendered as-is.
 * - A "+" straight after the number ("500+") is drawn in the secondary
 *   purple, smaller and level with the middle of the digits. The text of the
 *   figure is unchanged, so assistive tech and copy-paste still read "500+".
 * - Digits are tabular, so the figure does not shift sideways as it counts.
 */
const subscribeNever = () => () => {}

export function CountUp({
  value,
  duration = COUNT_DURATION_MS,
  className,
}: {
  value: string
  /** Milliseconds from 0 to the real figure. */
  duration?: number
  className?: string
}) {
  const figure = useMemo(() => parseFigure(value), [value])
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: REVEAL_VIEWPORT.margin })
  const reduced = usePrefersReducedMotion()
  // False while rendering on the server and during hydration, so the markup
  // matches; true afterwards, when the count may start from zero.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!figure || reduced || !inView) return
    let frame = 0
    let start: number | undefined
    const tick = (now: number) => {
      start ??= now
      const t = Math.min(1, (now - start) / duration)
      setProgress(easeOutQuart(t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [figure, duration, reduced, inView])

  if (!figure) return <span className={className}>{value}</span>

  const current = hydrated && !reduced ? progress : 1
  const number = formatFigure({ ...figure, prefix: '', suffix: '' }, current)
  const hasPlus = figure.suffix.startsWith('+')
  const rest = hasPlus ? figure.suffix.slice(1) : figure.suffix

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden data-count-up className="tabular-nums">
        {figure.prefix}
        {number}
        {hasPlus && (
          <span
            data-plus
            className="ml-[0.08em] align-[0.05em] font-sans text-[0.7em] text-secondary"
          >
            +
          </span>
        )}
        {rest}
      </span>
    </span>
  )
}
