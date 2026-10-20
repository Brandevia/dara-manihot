import { describe, expect, it } from 'vitest'
import { easeOutQuart, formatFigure, parseFigure } from '@/lib/figure'

describe('parseFigure', () => {
  it.each([
    [
      '500+',
      { prefix: '', value: 500, suffix: '+', decimals: 0, grouped: false },
    ],
    ['5', { prefix: '', value: 5, suffix: '', decimals: 0, grouped: false }],
    [
      '10+',
      { prefix: '', value: 10, suffix: '+', decimals: 0, grouped: false },
    ],
    [
      '1,200+',
      { prefix: '', value: 1200, suffix: '+', decimals: 0, grouped: true },
    ],
    [
      '$2.5m',
      { prefix: '$', value: 2.5, suffix: 'm', decimals: 1, grouped: false },
    ],
    [
      '30% cost reduction target',
      {
        prefix: '',
        value: 30,
        suffix: '% cost reduction target',
        decimals: 0,
        grouped: false,
      },
    ],
  ])('splits %s', (text, expected) => {
    expect(parseFigure(text)).toEqual(expected)
  })

  it('returns null when there is nothing to count', () => {
    expect(parseFigure('Active')).toBeNull()
    expect(parseFigure('')).toBeNull()
  })

  it('only counts the first number in a sentence', () => {
    expect(parseFigure('Phase 2 of 3')?.value).toBe(2)
  })
})

describe('formatFigure', () => {
  const plus = parseFigure('500+') as NonNullable<
    ReturnType<typeof parseFigure>
  >

  it('starts at zero and finishes on the exact source text', () => {
    expect(formatFigure(plus, 0)).toBe('0+')
    expect(formatFigure(plus, 1)).toBe('500+')
  })

  it('round-trips every real figure on the site', () => {
    for (const text of [
      '500+',
      '50+',
      '10+',
      '5',
      '30% cost reduction target',
      '1,200+',
      '$2.5m',
    ]) {
      const f = parseFigure(text)
      expect(f && formatFigure(f, 1)).toBe(text)
    }
  })

  it('never goes outside 0..1', () => {
    expect(formatFigure(plus, -3)).toBe('0+')
    expect(formatFigure(plus, 9)).toBe('500+')
  })

  it('keeps separators and decimals while counting', () => {
    const f = parseFigure('1,200+') as NonNullable<
      ReturnType<typeof parseFigure>
    >
    expect(formatFigure(f, 0.5)).toBe('600+')
    const d = parseFigure('$2.5m') as NonNullable<
      ReturnType<typeof parseFigure>
    >
    expect(formatFigure(d, 0.5)).toBe('$1.3m')
  })
})

describe('easeOutQuart', () => {
  it('runs 0 to 1, fast at the start and slow at the end', () => {
    expect(easeOutQuart(0)).toBe(0)
    expect(easeOutQuart(1)).toBe(1)
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.9)
    expect(easeOutQuart(-1)).toBe(0)
    expect(easeOutQuart(2)).toBe(1)
  })
})
