/**
 * Splits a headline figure such as "500+", "30% cost reduction target" or
 * "1,200" into the part that counts up and the text around it, so the number
 * can animate while the rest stays put. Pure functions: no DOM, no React.
 */
export interface Figure {
  /** Text before the number, e.g. "$". */
  prefix: string
  /** The number the count finishes on. */
  value: number
  /** Text after the number, e.g. "+" or "% cost reduction target". */
  suffix: string
  /** Digits after the decimal point in the source figure. */
  decimals: number
  /** True when the source figure used thousands separators ("1,200"). */
  grouped: boolean
}

// Prefix has no digits; the number may use commas and one decimal point.
const FIGURE = /^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/

/** Returns null when the text holds no number (nothing to count). */
export function parseFigure(text: string): Figure | null {
  const match = FIGURE.exec(text)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const value = Number(digits.replaceAll(',', ''))
  if (!Number.isFinite(value)) return null
  const dot = digits.indexOf('.')
  return {
    prefix,
    value,
    suffix,
    decimals: dot === -1 ? 0 : digits.length - dot - 1,
    grouped: digits.includes(','),
  }
}

/**
 * Renders the figure at `progress` (0 = start, 1 = finished). Always en-US so
 * the server and the browser print the same characters (no hydration drift).
 */
export function formatFigure(figure: Figure, progress: number): string {
  const clamped = Math.min(1, Math.max(0, progress))
  const current = figure.value * clamped
  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: figure.decimals,
    maximumFractionDigits: figure.decimals,
    useGrouping: figure.grouped,
  }).format(current)
  return `${figure.prefix}${number}${figure.suffix}`
}

/** Ease-out quartic: fast start, long soft landing on the real figure. */
export function easeOutQuart(t: number): number {
  return 1 - (1 - Math.min(1, Math.max(0, t))) ** 4
}
