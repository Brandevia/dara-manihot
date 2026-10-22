'use client'

import {
  type HTMLMotionProps,
  MotionConfig,
  motion,
  type Variants,
} from 'motion/react'
import type { ReactNode } from 'react'
import {
  EASE_OUT_EXPO,
  REVEAL_DURATION,
  REVEAL_OFFSET_Y,
  REVEAL_VIEWPORT,
  STAGGER_GAP,
} from '@/lib/motion'

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

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_GAP } },
}

const item: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET_Y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: REVEAL_DURATION, ease: EASE_OUT_EXPO },
  },
}

/** Reveals its `StaggerItem` children one after another. */
export function Stagger({
  children,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.div variants={item} data-reveal {...props}>
      {children}
    </motion.div>
  )
}

/** `ul` flavour of `Stagger`, so list markup stays valid. */
export function StaggerList({
  children,
  ...props
}: Omit<HTMLMotionProps<'ul'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      {...props}
    >
      {children}
    </motion.ul>
  )
}

export function StaggerListItem({
  children,
  ...props
}: Omit<HTMLMotionProps<'li'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.li variants={item} data-reveal {...props}>
      {children}
    </motion.li>
  )
}
