'use client'

import { Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import { fieldClass } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useFinePointer } from '@/hooks/use-fine-pointer'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  value: string
  label: string
  /** Options sharing a group are listed together under its heading. */
  group?: string
}

export interface DropdownSelectProps {
  /** Goes on the focusable control, so a <label htmlFor> and focus() work. */
  id: string
  name?: string
  value: string
  onValueChange: (value: string) => void
  options: readonly DropdownOption[]
  /** Shown while nothing is chosen. */
  placeholder: string
  /**
   * Which edge of the field the open list lines up with. The list is wider than
   * a narrow field so long names fit on a line; `end` grows it leftwards, for a
   * field that sits at the right edge of its container.
   */
  align?: 'start' | 'end'
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  disabled?: boolean
  className?: string
}

/** Below this much room under the field, the list opens upwards instead. */
const MIN_ROOM_PX = 260
/** The tallest the list gets, once there is room (it scrolls beyond that). */
const MAX_PANEL_PX = 416
/** Breathing space kept between the list and the edge of the screen. */
const EDGE_GAP_PX = 16
/** A pause this long between key presses starts a new type-ahead search. */
const TYPEAHEAD_RESET_MS = 600

type Placement = 'bottom' | 'top'
interface PanelLayout {
  placement: Placement
  /** Height the list may use on the side it opens, in px. */
  maxHeight: number
}

const optionId = (listId: string, index: number) => `${listId}-option-${index}`

/** Options gathered under their group, keeping first-seen order. */
function useGrouped(options: readonly DropdownOption[]) {
  return useMemo(() => {
    const grouped: { label: string | undefined; items: DropdownOption[] }[] = []
    for (const option of options) {
      let group = grouped.find((g) => g.label === option.group)
      if (!group) {
        group = { label: option.group, items: [] }
        grouped.push(group)
      }
      group.items.push(option)
    }
    // `start` is the group's first row in the flat list, so rows can be
    // numbered without counting while rendering.
    let start = 0
    const groups = grouped.map((g) => {
      const withStart = { ...g, start }
      start += g.items.length
      return withStart
    })
    // Keyboard order must match what is drawn, so flatten from the groups.
    return { groups, flat: groups.flatMap((g) => g.items) }
  }, [options])
}

/**
 * A single-choice dropdown that is a styled listbox on desktop and the
 * phone's own picker on touch devices.
 *
 * Why two: a native <select> cannot be themed (the open list is drawn by the
 * OS), which clashes with the dark enquiry card. But on a phone the native
 * picker is easier to use than any custom list, and the site's scope asks for
 * a form that is easy to complete on mobile. So visitors with a mouse get the
 * styled listbox, and everyone else keeps the native control. Both report the
 * same value through `onValueChange`, and both carry `id`, so labels, error
 * focus and tests behave the same either way.
 *
 * The styled listbox follows the WAI-ARIA "select-only combobox" pattern:
 * focus stays on the button, the highlighted row is announced through
 * aria-activedescendant, and it supports arrow keys, Home, End, Enter, Space,
 * Escape and type-ahead. The unfold animation is inspired by beUI's Select.
 */
export function DropdownSelect(props: DropdownSelectProps) {
  const finePointer = useFinePointer()
  return finePointer ? <Listbox {...props} /> : <NativePicker {...props} />
}

function NativePicker({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  align: _align, // the native picker is positioned by the OS
  ...aria
}: DropdownSelectProps) {
  const { groups } = useGrouped(options)
  return (
    <Select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      className={className}
      onChange={(e) => onValueChange(e.target.value)}
      aria-invalid={aria['aria-invalid']}
      aria-describedby={aria['aria-describedby']}
    >
      <option value="">{placeholder}</option>
      {groups.map((group) =>
        group.label ? (
          <optgroup key={group.label} label={group.label}>
            {group.items.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : (
          group.items.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        ),
      )}
    </Select>
  )
}

function Listbox({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  align = 'start',
  ...aria
}: DropdownSelectProps) {
  const listId = useId()
  const { groups, flat } = useGrouped(options)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const typeahead = useRef({ text: '', timer: 0 })
  const reduceMotion = usePrefersReducedMotion()

  const [open, setOpen] = useState(false)
  const [layout, setLayout] = useState<PanelLayout>({
    placement: 'bottom',
    maxHeight: MAX_PANEL_PX,
  })
  const selectedIndex = flat.findIndex((o) => o.value === value)
  const [active, setActive] = useState(0)
  const selected = selectedIndex >= 0 ? flat[selectedIndex] : undefined

  const openList = useCallback(
    (startAt?: number) => {
      if (disabled) return
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) {
        // Open on the side with more room (below, unless it is cramped), and
        // never taller than that room, so the list is not cut off by the screen.
        const below = window.innerHeight - rect.bottom
        const above = rect.top
        const placement: Placement =
          below < MIN_ROOM_PX && above > below ? 'top' : 'bottom'
        const room = (placement === 'bottom' ? below : above) - EDGE_GAP_PX
        setLayout({
          placement,
          maxHeight: Math.max(Math.min(room, MAX_PANEL_PX), 160),
        })
      }
      setActive(startAt ?? Math.max(selectedIndex, 0))
      setOpen(true)
    },
    [disabled, selectedIndex],
  )

  const close = useCallback(() => setOpen(false), [])

  const choose = useCallback(
    (index: number) => {
      const option = flat[index]
      if (option) onValueChange(option.value)
      setOpen(false)
      triggerRef.current?.focus()
    },
    [flat, onValueChange],
  )

  // Close on a press outside. A press on this field's own label is left alone:
  // the label forwards a click to the button, which then toggles the list.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null
      if (!target) return
      if (rootRef.current?.contains(target)) return
      if (target.closest(`label[for="${CSS.escape(id)}"]`)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, id])

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    if (!open) return
    document
      .getElementById(optionId(listId, active))
      ?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active, listId])

  useEffect(() => {
    const state = typeahead.current
    return () => window.clearTimeout(state.timer)
  }, [])

  /**
   * Index of the option whose label starts with what was typed, or -1.
   * One letter (or the same letter repeated) steps through that letter's
   * matches; a longer word narrows from the current row.
   */
  function searchFor(char: string): number {
    const state = typeahead.current
    window.clearTimeout(state.timer)
    state.text += char.toLowerCase()
    state.timer = window.setTimeout(() => {
      state.text = ''
    }, TYPEAHEAD_RESET_MS)

    const repeated = [...state.text].every((c) => c === state.text[0])
    const needle = repeated ? state.text[0] : state.text
    const from = (open ? active : selectedIndex) + (repeated ? 1 : 0)
    for (let step = 0; step < flat.length; step++) {
      const i = (((from + step) % flat.length) + flat.length) % flat.length
      if (flat[i].label.toLowerCase().startsWith(needle)) return i
    }
    return -1
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || flat.length === 0) return
    const { key } = event
    const last = flat.length - 1

    if (!open) {
      if (
        key === 'ArrowDown' ||
        key === 'ArrowUp' ||
        key === 'Enter' ||
        key === ' '
      ) {
        event.preventDefault()
        openList()
      } else if (key === 'Home') {
        event.preventDefault()
        openList(0)
      } else if (key === 'End') {
        event.preventDefault()
        openList(last)
      } else if (
        key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const hit = searchFor(key)
        if (hit >= 0) {
          event.preventDefault()
          openList(hit)
        }
      }
      return
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((i) => Math.min(i + 1, last))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (event.altKey) choose(active)
        else setActive((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(active)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        // Let focus move on, but do not change the value behind their back.
        close()
        break
      default:
        if (
          key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          const hit = searchFor(key)
          if (hit >= 0) {
            event.preventDefault()
            setActive(hit)
          }
        }
    }
  }

  const fromTop = layout.placement === 'bottom'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        data-slot="select"
        data-value={value}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(listId, active) : undefined}
        aria-invalid={aria['aria-invalid']}
        aria-describedby={aria['aria-describedby']}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          fieldClass,
          'group flex h-12 cursor-pointer items-center justify-between gap-3 text-left aria-expanded:border-ring aria-expanded:ring-[3px] aria-expanded:ring-ring/50',
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo group-aria-expanded:rotate-180 motion-reduce:transition-none"
        />
      </button>

      <AnimatePresence>
        {open && (
          // Colours come from the popover tokens, which the dark enquiry card
          // does not re-point, so the list stays light and legible on it.
          <motion.div
            key="panel"
            // Reduced motion: a plain, quick fade with no movement or unfold.
            initial={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: fromTop ? -6 : 6,
                    clipPath: fromTop
                      ? 'inset(0 0 100% 0 round 12px)'
                      : 'inset(100% 0 0 0 round 12px)',
                  }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 12px)' }
            }
            exit={{
              opacity: 0,
              y: reduceMotion ? 0 : fromTop ? -4 : 4,
              transition: { duration: 0.12 },
            }}
            transition={{
              duration: reduceMotion ? 0.12 : 0.28,
              ease: EASE_OUT_EXPO,
            }}
            className={cn(
              // At least as wide as the field, and wide enough for long names.
              'absolute z-30 w-88 min-w-full max-w-[calc(100vw-2rem)]',
              align === 'end' ? 'right-0' : 'left-0',
              fromTop ? 'top-full mt-2' : 'bottom-full mb-2',
            )}
          >
            <div
              id={listId}
              role="listbox"
              data-testid="dropdown-listbox"
              // Keep focus on the button while the pointer works the list.
              onMouseDown={(e) => e.preventDefault()}
              style={{ maxHeight: layout.maxHeight }}
              className="overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-float"
            >
              {groups.map((group, g) => {
                const headingId = `${listId}-group-${g}`
                return (
                  // biome-ignore lint/a11y/useSemanticElements: a listbox may only contain role=group, not a fieldset
                  <div
                    key={group.label ?? `group-${g}`}
                    role="group"
                    aria-labelledby={group.label ? headingId : undefined}
                  >
                    {group.label && (
                      <div
                        id={headingId}
                        role="presentation"
                        className={cn(
                          'px-3 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-popover-foreground/70',
                          g === 0 ? 'pt-2' : 'mt-1 border-t border-border pt-3',
                        )}
                      >
                        {group.label}
                      </div>
                    )}
                    {group.items.map((option, n) => {
                      const i = group.start + n
                      const isSelected = option.value === value
                      const isActive = i === active
                      return (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard control lives on the combobox button (aria-activedescendant)
                        // biome-ignore lint/a11y/useFocusableInteractive: options are never focused, the button's aria-activedescendant points at them
                        <div
                          key={option.value}
                          id={optionId(listId, i)}
                          role="option"
                          aria-selected={isSelected}
                          data-value={option.value}
                          data-active={isActive || undefined}
                          onPointerMove={() => !isActive && setActive(i)}
                          onClick={() => choose(i)}
                          className={cn(
                            'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-base transition-colors duration-150 motion-reduce:transition-none',
                            isActive && 'bg-accent text-accent-foreground',
                            isSelected && 'font-semibold',
                          )}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check
                              aria-hidden
                              className="size-4 shrink-0 text-secondary"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
