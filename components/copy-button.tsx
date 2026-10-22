'use client'

import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

/** Copies `value` to the clipboard and confirms with an icon swap. */
export function CopyButton({
  value,
  label,
}: {
  value: string
  /** What is being copied, for the accessible name, e.g. "email address". */
  label: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard API unavailable (insecure context / denied): do nothing
      // rather than claim success.
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground"
        onClick={copy}
        aria-label={`Copy ${label}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'done' : 'idle'}
            initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4, rotate: 45 }}
            transition={{ duration: 0.16 }}
            className="flex"
          >
            {copied ? (
              <Check className="text-secondary" aria-hidden />
            ) : (
              <Copy aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
      <span role="status" className="sr-only">
        {copied ? `${label} copied` : ''}
      </span>
    </>
  )
}
