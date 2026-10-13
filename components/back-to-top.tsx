'use client'

import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useScrolledPast } from '@/hooks/use-scrolled-past'

const SHOW_AFTER_PX = 480
const RING_RADIUS = 21

export function BackToTop() {
  const visible = useScrolledPast(SHOW_AFTER_PX)
  const reduceMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll()
  // Smooths the progress ring so it doesn't jitter with trackpad scrolling.
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 32 })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduceMotion ? 'auto' : 'smooth',
            })
          }
          initial={{ opacity: 0, scale: 0.5, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 24 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 sm:right-6 sm:bottom-6"
        >
          {/* Ring shows how far down the page you are. */}
          <svg
            viewBox="0 0 48 48"
            className="absolute inset-0 size-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <motion.circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUp className="relative size-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
