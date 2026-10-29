'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { type SlidingTab, SlidingTabs } from '@/components/ui/sliding-tabs'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { SUMMIT_PHASES } from '@/lib/summit'

const PREFIX = 'pathway'

const TABS: readonly SlidingTab[] = SUMMIT_PHASES.map((phase) => ({
  id: phase.id,
  label: (
    <>
      <span className="block text-xs font-normal opacity-80">{phase.step}</span>
      <span className="block leading-tight">{phase.title}</span>
    </>
  ),
}))

/**
 * The three-phase transition model as tabs: solar savings, then storage, then
 * green hydrogen. A tab swap is a high-frequency action, so the panel
 * cross-fades quickly (enter 300ms, exit 150ms, per the site's motion rules).
 */
export function SummitPathway() {
  const [active, setActive] = useState(SUMMIT_PHASES[0].id)
  const index = SUMMIT_PHASES.findIndex((p) => p.id === active)
  const phase = SUMMIT_PHASES[index]

  return (
    <div>
      <SlidingTabs
        tabs={TABS}
        value={active}
        onValueChange={setActive}
        label="Three-phase transition model"
        idPrefix={PREFIX}
      />

      {/* A progress rail: a second, non-motion cue for how far along the model we are. */}
      <div
        aria-hidden
        className="mt-6 grid grid-cols-3 gap-2"
        data-testid="pathway-rail"
      >
        {SUMMIT_PHASES.map((p, i) => (
          <span
            key={p.id}
            className="h-1.5 rounded-full bg-border transition-colors duration-300 data-[filled=true]:bg-primary"
            data-filled={i <= index}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase.id}
          role="tabpanel"
          id={`${PREFIX}-panel-${phase.id}`}
          aria-labelledby={`${PREFIX}-tab-${phase.id}`}
          tabIndex={0}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.3, ease: EASE_OUT_EXPO },
          }}
          exit={{
            opacity: 0,
            y: -12,
            filter: 'blur(4px)',
            transition: { duration: 0.15, ease: EASE_OUT_EXPO },
          }}
          className="mt-8 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <h4 className="text-2xl sm:text-3xl">{phase.title}</h4>
          <p className="mt-3 max-w-2xl text-lead text-muted-foreground">
            {phase.summary}
          </p>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <div className="border-t border-border pt-4">
              <dt className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                How it works
              </dt>
              <dd className="mt-2">{phase.mechanism}</dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                What it delivers
              </dt>
              <dd className="mt-2">{phase.impact}</dd>
            </div>
          </dl>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
