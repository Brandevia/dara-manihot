// Shared config for `motion/react` scroll reveals. (CSS-driven motion lives as
// tokens in app/globals.css; these are the JS-side equivalents.)
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const REVEAL_VIEWPORT = {
  once: true,
  margin: '0px 0px -10% 0px',
} as const
export const REVEAL_DURATION = 0.6
export const REVEAL_OFFSET_Y = 18
export const STAGGER_GAP = 0.08
/** How long a headline figure takes to count up to its real value. */
export const COUNT_DURATION_MS = 1600
/**
 * Scroll-linked fade (`ScrollFade`): progress runs from 0 as the content's top
 * edge enters the bottom of the screen to 1 when its centre reaches 65% of the
 * way down. The footer always follows, so the page can always scroll far
 * enough to finish the fade.
 */
export const SCROLL_FADE_OFFSET = ['start end', 'center 65%'] as const
export const SCROLL_FADE_RISE = 36
