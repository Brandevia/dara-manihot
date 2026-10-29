'use client'

import { LayoutGroup, motion } from 'motion/react'
import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface SlidingTab {
  id: string
  /** What the tab shows. Wraps rather than truncates, so long labels survive. */
  label: ReactNode
}

/**
 * An accessible tablist whose active "pill" glides from tab to tab (a shared
 * layout animation) instead of jumping. Inspired by beUI's Tabs; written for
 * this site's tokens.
 *
 * Follows the WAI-ARIA tabs pattern: only the active tab is in the tab order,
 * Arrow keys / Home / End move between tabs and activate them. Each tab's
 * panel id is `${panelIdPrefix}-${tab.id}`, so the panel can name its tab.
 * The static cue for "selected" is the pill's colour and `aria-selected`; the
 * glide is only polish, and reduced motion turns it into a plain swap.
 */
export function SlidingTabs({
  tabs,
  value,
  onValueChange,
  label,
  idPrefix,
  className,
}: {
  tabs: readonly SlidingTab[]
  value: string
  onValueChange: (id: string) => void
  /** Accessible name of the tablist. */
  label: string
  /** Tab ids are `${idPrefix}-tab-${id}`, panel ids `${idPrefix}-panel-${id}`. */
  idPrefix: string
  className?: string
}) {
  const group = useId()
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const move = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length]
    onValueChange(next.id)
    refs.current[next.id]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const keys: Record<string, number | undefined> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    move(target)
  }

  return (
    <LayoutGroup id={group}>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          'grid gap-1 rounded-[1.25rem] bg-muted p-1.5 ring-1 ring-border',
          className,
        )}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === value
          return (
            <button
              key={tab.id}
              ref={(node) => {
                refs.current[tab.id] = node
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onValueChange(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'relative isolate min-h-12 rounded-2xl px-2 py-2 text-center text-sm font-medium outline-none transition-colors duration-150 [-webkit-tap-highlight-color:transparent] focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-4',
                selected
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {selected && (
                <motion.span
                  layoutId="sliding-tab-pill"
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-2xl bg-primary shadow-float"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                />
              )}
              {tab.label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
