import { describe, expect, it } from 'vitest'
import { listFiles, readSource } from './helpers'

const css = readSource('app/globals.css')

/** Resolve --name to a hex value inside :root, following var() references. */
function tokenHex(name: string, scope = ':root'): string {
  const block = css.slice(css.indexOf(`${scope} {`))
  const m = block.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!m) throw new Error(`token --${name} not found`)
  const v = m[1].trim()
  const ref = v.match(/^var\(--([\w-]+)\)$/)
  if (ref) return tokenHex(ref[1], scope)
  if (!/^#[0-9a-f]{6}$/i.test(v))
    throw new Error(`--${name} is not a hex colour: ${v}`)
  return v
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('WCAG AA contrast of token pairs', () => {
  const pairs: [string, string][] = [
    ['foreground', 'background'],
    ['muted-foreground', 'background'],
    ['muted-foreground', 'muted'],
    ['card-foreground', 'card'],
    ['primary-foreground', 'primary'],
    ['secondary-foreground', 'secondary'], // every CTA button
    ['secondary-foreground', 'secondary-hover'],
    ['accent-foreground', 'accent'],
    ['canopy-foreground', 'canopy'],
    ['canopy-muted', 'canopy'],
    ['primary', 'background'], // primary used as link/text colour
    ['secondary', 'background'], // secondary used as text (tonal buttons)
  ]
  it.each(pairs)('%s on %s is >= 4.5:1', (fg, bg) => {
    expect(contrast(tokenHex(fg), tokenHex(bg))).toBeGreaterThanOrEqual(4.5)
  })
})

describe('brand colours', () => {
  it('uses the logo purple as the secondary (CTA) colour', () => {
    expect(css).toMatch(/--secondary:\s*var\(--brand-purple-600\)/)
  })
  it('uses the logo green as the primary colour', () => {
    expect(css).toMatch(/--primary:\s*var\(--brand-green-700\)/)
  })
})

describe('all styling goes through tokens', () => {
  const files = [
    ...listFiles('components', ['.tsx']),
    ...listFiles('app', ['.tsx']),
  ]
  // Tailwind palette classes (bg-green-600...) and raw hex/rgb colours.
  const PALETTE =
    /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|divide|decoration)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/
  const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/
  const ALLOWED_RAW = new Set(['app/layout.tsx']) // <meta theme-color> cannot read CSS vars

  it.each(files.map((f) => [f.split('/site/')[1] ?? f, f]))(
    '%s has no palette classes or raw colours',
    (rel, full) => {
      const src = readSource(full.slice(full.indexOf('/site/') + 6))
      expect(src).not.toMatch(PALETTE)
      if (!ALLOWED_RAW.has(rel)) expect(src).not.toMatch(RAW_COLOUR)
    },
  )
})
