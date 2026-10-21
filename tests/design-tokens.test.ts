import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { listFiles, ROOT, readSource } from './helpers'

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
    ['destructive', 'background'], // form error text
    ['destructive', 'card'], // form error text inside the contact card
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

  // Paths relative to the repo root, so the test works in any checkout folder.
  it.each(files.map((f) => [path.relative(ROOT, f), f]))(
    '%s has no palette classes or raw colours',
    (rel) => {
      const src = readSource(rel)
      expect(src).not.toMatch(PALETTE)
      if (!ALLOWED_RAW.has(rel)) expect(src).not.toMatch(RAW_COLOUR)
    },
  )
})

describe('no page gradient', () => {
  // The Contact page used to fade from white into the logo green. That put a
  // strong green directly above the footer's rounded corners, so it was
  // removed. Guard against it coming back.
  it('has no page-gradient token or utility', () => {
    expect(css).not.toMatch(/--page-gradient/)
    expect(css).not.toMatch(/bg-page-gradient/)
  })
})

describe('mint (pale green section tint)', () => {
  it('is the logo green at 200, defined once as a token', () => {
    expect(css).toMatch(/--mint:\s*var\(--brand-green-200\)/)
    expect(css).toMatch(/--color-mint:\s*var\(--mint\)/)
  })

  // Everything that sits on mint: headings, body copy, the eyebrow label.
  it.each([
    ['foreground', 'mint'],
    ['muted-foreground', 'mint'],
    ['primary', 'mint'],
    ['accent-foreground', 'mint'],
  ])('%s on %s is >= 4.5:1', (fg, bg) => {
    expect(contrast(tokenHex(fg), tokenHex(bg))).toBeGreaterThanOrEqual(4.5)
  })
})

describe('menu tokens', () => {
  it('defines the panel width and the origin it grows out of', () => {
    expect(css).toMatch(/--menu-w:/)
    expect(css).toMatch(/--menu-origin:/)
  })

  it('no longer carries the old drawer slide keyframes', () => {
    expect(css).not.toMatch(/drawer-in|drawer-out|drawer-panel|--drawer-w/)
  })
})

describe('dark form surface (surface-canopy)', () => {
  const block =
    css.match(/@utility surface-canopy \{([\s\S]*?)\n\}\n/)?.[1] ?? ''

  it('re-points the tokens the form controls read', () => {
    for (const token of [
      'foreground',
      'muted-foreground',
      'background',
      'input',
      'ring',
      'destructive',
    ])
      expect(block, `--${token}`).toMatch(new RegExp(`--${token}:`))
  })

  it('makes fields transparent so they read as outlines on the green', () => {
    expect(block).toMatch(/--background:\s*transparent/)
  })

  it('error text, labels and placeholders stay AA on the canopy colour', () => {
    const canopy = tokenHex('canopy')
    expect(
      contrast(tokenHex('brand-danger-light'), canopy),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(tokenHex('canopy-foreground'), canopy),
    ).toBeGreaterThanOrEqual(4.5)
    expect(contrast(tokenHex('canopy-muted'), canopy)).toBeGreaterThanOrEqual(
      4.5,
    )
  })

  it('uses the surface only on its own tokens (no raw colours)', () => {
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i)
  })
})

describe('frosted glass', () => {
  const block = css.match(/@utility glass \{([\s\S]*?)\n\}\n/)?.[1] ?? ''

  it('blurs and saturates what is behind it, with the -webkit- prefix for Safari', () => {
    // Anchored to a declaration at the start of a line, so the @supports
    // fallback's feature query cannot satisfy it by accident.
    expect(block).toMatch(
      /\n {2}backdrop-filter:\s*blur\(var\(--glass-blur\)\)\s+saturate\(/,
    )
    expect(block).toMatch(
      /\n {2}-webkit-backdrop-filter:\s*blur\(var\(--glass-blur\)\)\s+saturate\(/,
    )
  })

  it('firms up when scrolled', () => {
    expect(block).toMatch(/\[data-scrolled="true"\]/)
  })

  it('falls back to a near-opaque tint where backdrop-filter is unsupported', () => {
    expect(block).toMatch(/@supports not/)
    expect(block).toMatch(/9\d%/)
  })

  it('is tinted by tokens, and is more opaque once scrolled than at rest', () => {
    const pct = (name: string) =>
      Number(css.match(new RegExp(`--${name}:[^;]*?(\\d+)%`))?.[1])
    expect(pct('glass-tint-scrolled')).toBeGreaterThan(pct('glass-tint'))
  })

  it('keeps nav text AA even over the darkest hero colour at rest', () => {
    // Worst case: the resting tint composited over the deepest green the hero
    // veil reaches. Nav link text is fully opaque ink, so this is the floor.
    const tint = Number(css.match(/--glass-tint:[^;]*?(\d+)%/)?.[1]) / 100
    const mix = (fg: string, bg: string, a: number) =>
      '#' +
      [1, 3, 5]
        .map((i) =>
          Math.round(
            Number.parseInt(fg.slice(i, i + 2), 16) * a +
              Number.parseInt(bg.slice(i, i + 2), 16) * (1 - a),
          )
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')
    const glass = mix(
      tokenHex('brand-white'),
      tokenHex('brand-green-950'),
      tint,
    )
    expect(contrast(tokenHex('foreground'), glass)).toBeGreaterThanOrEqual(4.5)
  })
})
