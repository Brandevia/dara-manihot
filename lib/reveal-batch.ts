import { STAGGER_GAP } from '@/lib/motion'

/** Most steps a batch can stagger by, so a fast scroll never queues a long wait. */
export const MAX_STAGGER_STEPS = 5

type Run = (delay: number) => void

let pending: Run[] = []
let scheduled = false

/**
 * Staggers items that scroll into view together, and only those.
 *
 * The old `Stagger` container revealed all of its children as soon as its own
 * first pixel appeared. On a phone a grid is one tall column, so the whole
 * sequence played below the fold and the visitor saw finished content.
 * Instead every item reveals when *it* arrives. Items that arrive in the same
 * frame (a row on a tablet or desktop, the first screenful on a phone) start
 * `STAGGER_GAP` apart; an item that arrives later, by scrolling, starts at once.
 */
export function revealInBatch(run: Run): void {
  pending.push(run)
  if (scheduled) return
  scheduled = true
  // Intersection callbacks for one frame are separate tasks that all run
  // before the next animation frame, so this collects them into one batch.
  requestAnimationFrame(() => {
    const batch = pending
    pending = []
    scheduled = false
    batch.forEach((fn, i) => {
      fn(Math.min(i, MAX_STAGGER_STEPS) * STAGGER_GAP)
    })
  })
}
