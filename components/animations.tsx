'use client'

import {
  type HTMLMotionProps,
  MotionConfig,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  EASE_OUT_EXPO,
  REVEAL_DURATION,
  REVEAL_OFFSET_Y,
  REVEAL_VIEWPORT,
  SCROLL_FADE_OFFSET,
  SCROLL_FADE_RISE,
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

/**
 * Fades and lifts content in as you scroll, tied to the scroll position (so
 * it also reverses when you scroll back up). Use it for content that sits on
 * top of a picture: the picture is there first and the words arrive onto it.
 * With reduced motion the content is simply shown.
 */
export function ScrollFade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [...SCROLL_FADE_OFFSET],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [SCROLL_FADE_RISE, 0])

  return (
    <div ref={ref} className={className}>
      <motion.div
        data-reveal
        data-scroll-fade
        style={reduced ? { opacity: 1, y: 0 } : { opacity, y }}
      >
        {children}
      </motion.div>
    </div>
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
