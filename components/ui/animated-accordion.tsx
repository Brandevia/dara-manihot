'use client'

import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useId, useState } from 'react'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface AccordionEntry {
  id: string
  heading: string
  /** A short line shown beside the heading, e.g. "4 priorities". */
  meta?: string
  content: ReactNode
}

/**
 * One-open-at-a-time accordion. The chevron turns and the panel eases open to
 * its natural height. The first entry starts open, so the content is on the
 * page for the server render, for search engines and for visitors without JS.
 * Reduced motion: the panel simply appears (the site-wide MotionConfig in components/animations.tsx).
 */
export function AnimatedAccordion({
  entries,
  defaultOpen = entries[0]?.id,
  className,
}: {
  entries: readonly AccordionEntry[]
  defaultOpen?: string
  className?: string
}) {
  const base = useId()
  const [open, setOpen] = useState<string | undefined>(defaultOpen)

  return (
    <div className={cn('divide-y divide-border', className)}>
      {entries.map((entry) => {
        const isOpen = entry.id === open
        const buttonId = `${base}-${entry.id}-button`
        const panelId = `${base}-${entry.id}-panel`
        return (
          <div key={entry.id}>
            <h4 className="font-sans text-xl font-semibold">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? undefined : entry.id)}
                className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl py-4 text-left outline-none transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span>{entry.heading}</span>
                <span className="flex shrink-0 items-center gap-3">
                  {entry.meta && (
                    <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
                      {entry.meta}
                    </span>
                  )}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-5 transition-transform duration-300 ease-out-expo motion-reduce:transition-none',
                      isOpen && 'rotate-180',
                    )}
                  />
                </span>
              </button>
            </h4>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">{entry.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
