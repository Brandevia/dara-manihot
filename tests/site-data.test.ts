import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  COMPANY_INFO,
  HERO_SLIDES,
  LEGAL_LINKS,
  NAVIGATION_LINKS,
} from '@/lib/constants'
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '@/lib/legal'
import { SERVICES } from '@/lib/services'
import { discoverRoutes, ROOT } from './helpers'

describe('routes and links', () => {
  const routes = discoverRoutes()

  it('discovers every page', () => {
    expect(routes).toEqual(
      [
        '/',
        '/about',
        '/contact',
        '/privacy',
        '/projects',
        '/services',
        '/terms',
      ].sort(),
    )
  })

  it.each([...NAVIGATION_LINKS, ...LEGAL_LINKS])(
    'link "$name" ($href) points at a real page',
    ({ href }) => {
      // Regression: the footer used to link to /privacy and /terms (404).
      expect(routes).toContain(href)
    },
  )

  it('has no duplicate nav hrefs', () => {
    const hrefs = NAVIGATION_LINKS.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe('company info (single source of truth)', () => {
  it('has no placeholder values', () => {
    // Regression: constants once held "+234-XXX-XXX-XXXX".
    expect(JSON.stringify(COMPANY_INFO)).not.toMatch(/X{3}/)
  })

  it('has a valid email and consistent phone formats', () => {
    expect(COMPANY_INFO.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    for (const phone of COMPANY_INFO.phones) {
      expect(phone.tel).toMatch(/^\+234\d{10}$/)
      expect(phone.display.replace(/\D/g, '')).toBe(phone.tel.slice(1))
    }
  })
})

describe('services', () => {
  it('has unique ids, usable as URL hashes', () => {
    const ids = SERVICES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('every service has details', () => {
    for (const s of SERVICES) expect(s.details.length).toBeGreaterThan(0)
  })
})

describe('hero slides', () => {
  it('has at least two slides so the carousel is meaningful', () => {
    expect(HERO_SLIDES.length).toBeGreaterThanOrEqual(2)
  })

  it.each(HERO_SLIDES.map((s) => [s.src, s]))(
    'slide %s has an existing image, alt text and caption',
    (_src, slide) => {
      const file = path.join(ROOT, 'public', slide.src)
      expect(fs.existsSync(file), `${slide.src} missing`).toBe(true)
      expect(slide.alt.length).toBeGreaterThan(10)
      expect(slide.caption.length).toBeGreaterThan(3)
    },
  )
})

describe('legal content', () => {
  it.each([
    ['privacy', PRIVACY_SECTIONS],
    ['terms', TERMS_SECTIONS],
  ] as const)(
    '%s: unique anchor ids, non-empty sections, contact section',
    (_n, sections) => {
      const ids = sections.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).toContain('contact')
      for (const s of sections) {
        expect(s.id).toMatch(/^[a-z0-9-]+$/)
        expect(s.blocks.length).toBeGreaterThan(0)
      }
    },
  )

  it('contains no raw HTML entities (regression: literal &#39; on the home page)', () => {
    const text = JSON.stringify([PRIVACY_SECTIONS, TERMS_SECTIONS])
    expect(text).not.toMatch(/&#\d+;|&[a-z]+;/i)
  })
})

describe('humans.txt', () => {
  const txt = fs.readFileSync(path.join(ROOT, 'public/humans.txt'), 'utf8')

  it('follows the humanstxt.org sections', () => {
    expect(txt).toContain('/* TEAM */')
    expect(txt).toContain('/* SITE */')
  })

  it('lists the developer details', () => {
    expect(txt).toContain('Sodeke Pamilerin')
    expect(txt).toContain('github.com/PRAIZZZ-08')
    expect(txt).toContain('linkedin.com/in/pamilerin-sodeke-10b66138b')
    expect(txt).toContain('Abuja, Nigeria')
  })
})
