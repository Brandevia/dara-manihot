'use client'

import {
  type HTMLMotionProps,
  MotionConfig,
  motion,
  useAnimationControls,
  type Variants,
} from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import {
  EASE_OUT_EXPO,
  REVEAL_DURATION,
  REVEAL_OFFSET_Y,
  REVEAL_VIEWPORT,
} from '@/lib/motion'
import { revealInBatch } from '@/lib/reveal-batch'

/** Wraps the app so every animation honours prefers-reduced-motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
}

/**
 * Fades and lifts content in once, when it scrolls into view. (The previous
 * helpers animated on mount, so everything below the fold finished animating
 * before anyone scrolled to it.)
 */
export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: REVEAL_OFFSET_Y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: REVEAL_DURATION, delay, ease: EASE_OUT_EXPO }}
      data-reveal
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
}

/**
 * The Appear effect without the lift: fades in once, when scrolled into view.
 * For a picture that fills its container (so moving it would show an edge),
 * and which should arrive before the words that sit on top of it.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = REVEAL_DURATION,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      data-reveal
      data-fade-in
      {...props}
    >
      {children}
    </motion.div>
  )
}

const item: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET_Y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: REVEAL_DURATION, ease: EASE_OUT_EXPO },
  },
}

/**
 * Props that make one item reveal when it scrolls into view, staggered only
 * against the items that arrive with it (see `revealInBatch`).
 */
function useBatchedReveal() {
  const controls = useAnimationControls()
  return {
    variants: item,
    initial: 'hidden',
    animate: controls,
    viewport: REVEAL_VIEWPORT,
    onViewportEnter: () =>
      revealInBatch((delay) => {
        controls.start('visible', { delay })
      }),
    'data-reveal': true,
  } as const
}

/** Groups `StaggerItem` children. Each child reveals as it scrolls in. */
export function Stagger(props: ComponentProps<'div'>) {
  return <div {...props} />
}

export function StaggerItem({
  children,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.div {...useBatchedReveal()} {...props}>
      {children}
    </motion.div>
  )
}

/** `ul` flavour of `Stagger`, so list markup stays valid. */
export function StaggerList(props: ComponentProps<'ul'>) {
  return <ul {...props} />
}

export function StaggerListItem({
  children,
  ...props
}: Omit<HTMLMotionProps<'li'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.li {...useBatchedReveal()} {...props}>
      {children}
    </motion.li>
  )
}
