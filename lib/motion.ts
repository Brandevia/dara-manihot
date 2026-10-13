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
