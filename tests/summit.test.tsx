import fs from 'node:fs'
import path from 'node:path'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage from '@/app/(pages)/about/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import Home from '@/app/page'
import { Footer } from '@/components/footer'
import { LeaderProfile } from '@/components/sections/leader-profile'
import { SummitGallery } from '@/components/summit-gallery'
import { SummitPathway } from '@/components/summit-pathway'
import { AnimatedAccordion } from '@/components/ui/animated-accordion'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { SOCIAL_LINKS } from '@/lib/constants'
import { parseFigure } from '@/lib/figure'
import {
  formatSummitDate,
  LEADER,
  STAKEHOLDER_ASKS,
  SUMMIT,
  SUMMIT_FIGURES,
  SUMMIT_GALLERY,
  SUMMIT_PHASES,
} from '@/lib/summit'
import { ROOT } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

/** Width and height from a JPEG's start-of-frame marker: no image library needed. */
function jpegSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(file)
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error(`bad JPEG marker in ${file}`)
    const marker = buf[i + 1]
    const length = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xc3)
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    i += 2 + length
  }
  throw new Error(`no size in ${file}`)
}

const publicFile = (src: string) => path.join(ROOT, 'public', src)

describe('summit data (lib/summit.ts)', () => {
  it('formats the summit date the same way everywhere', () => {
    expect(formatSummitDate(SUMMIT.date)).toBe('16 October 2026')
  })

  it('links to an anchor that the projects page really has', () => {
    expect(SUMMIT.href).toBe('/projects#summit')
    const { container } = render(<ProjectsPage />)
    expect(container.querySelector('#summit')).not.toBeNull()
  })

  it.each(SUMMIT_GALLERY.map((g) => [g.id, g]))(
    'gallery image %s exists, matches its declared size and is described',
    (_id, image) => {
      const file = publicFile(image.src)
      expect(fs.existsSync(file), `${image.src} missing`).toBe(true)
      expect(jpegSize(file)).toEqual({
        width: image.width,
        height: image.height,
      })
      expect(image.alt.length).toBeGreaterThan(20)
      expect(image.caption.length).toBeGreaterThan(10)
    },
  )

  it('has unique gallery ids and enough photos to be a gallery', () => {
    const ids = SUMMIT_GALLERY.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThanOrEqual(4)
  })

  it('has a leader portrait that exists at its declared size', () => {
    const file = publicFile(LEADER.photo.src)
    expect(fs.existsSync(file)).toBe(true)
    expect(jpegSize(file)).toEqual({
      width: LEADER.photo.width,
      height: LEADER.photo.height,
    })
  })

  it('every headline figure can count up', () => {
    for (const figure of SUMMIT_FIGURES)
      expect(parseFigure(figure.value), figure.value).not.toBeNull()
  })

  it('has three phases and four audiences, each with content', () => {
    expect(SUMMIT_PHASES).toHaveLength(3)
    expect(STAKEHOLDER_ASKS).toHaveLength(4)
    for (const ask of STAKEHOLDER_ASKS)
      expect(ask.actions.length).toBeGreaterThan(0)
    expect(new Set(SUMMIT_PHASES.map((p) => p.id)).size).toBe(3)
  })

  it('contains no raw HTML entities', () => {
    expect(
      JSON.stringify([SUMMIT, SUMMIT_PHASES, STAKEHOLDER_ASKS, SUMMIT_GALLERY]),
    ).not.toMatch(/&#\d+;|&[a-z]+;/i)
  })
})

describe('social links', () => {
  it('are the two confirmed pages, and there is no X account', () => {
    expect(SOCIAL_LINKS).toEqual({
      linkedin:
        'https://www.linkedin.com/company/daracare-manihot-industries-farms/',
      facebook: 'https://www.facebook.com/dmanihot',
    })
  })

  it('footer shows LinkedIn and Facebook only, opening in a new tab', () => {
    render(<Footer />)
    const linkedin = screen.getByRole('link', { name: /on LinkedIn/ })
    const facebook = screen.getByRole('link', { name: /on Facebook/ })
    expect(linkedin).toHaveAttribute('href', SOCIAL_LINKS.linkedin)
    expect(facebook).toHaveAttribute('href', SOCIAL_LINKS.facebook)
    for (const a of [linkedin, facebook]) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
    }
    expect(screen.queryByRole('link', { name: /twitter|\bX\b/i })).toBeNull()
  })
})

describe('placement', () => {
  it('home page teases the talk and links to the write-up', () => {
    const { container } = render(<Home />)
    const link = container.querySelector<HTMLAnchorElement>(
      'section[aria-labelledby="summit-spotlight-title"] a[href="/projects#summit"]',
    )
    expect(link).not.toBeNull()
  })

  it('about page shows the leader with a portrait and an anchor', () => {
    const { container } = render(<AboutPage />)
    expect(container.querySelector('#leadership')).not.toBeNull()
    expect(
      screen.getByRole('heading', {
        name: `${LEADER.honorific} ${LEADER.name}`,
      }),
    ).toBeInTheDocument()
    expect(screen.getByAltText(LEADER.photo.alt)).toBeInTheDocument()
  })

  it('leader profile links to the talk', () => {
    render(<LeaderProfile />)
    expect(
      screen.getByRole('link', { name: /read about the talk/i }),
    ).toHaveAttribute('href', '/projects#summit')
  })

  it('about page now uses the real summit photo, with an accurate description', () => {
    render(<AboutPage />)
    expect(screen.queryByAltText('The Dara-Manihot leadership team')).toBeNull()
  })
})

const LETTER_TABS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

function Harness() {
  const [value, setValue] = useState('a')
  return (
    <SlidingTabs
      tabs={LETTER_TABS}
      value={value}
      onValueChange={setValue}
      label="Letters"
      idPrefix="t"
    />
  )
}

describe('SlidingTabs', () => {
  it('selects one tab and keeps only it in the tab order', () => {
    render(<Harness />)
    const [a, b, c] = screen.getAllByRole('tab')
    expect(a).toHaveAttribute('aria-selected', 'true')
    expect(a).toHaveAttribute('tabindex', '0')
    for (const t of [b, c]) {
      expect(t).toHaveAttribute('aria-selected', 'false')
      expect(t).toHaveAttribute('tabindex', '-1')
    }
    expect(screen.getByRole('tablist', { name: 'Letters' })).toBeInTheDocument()
  })

  it('moves with arrow keys, wraps, and supports Home and End', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [a, b, c] = screen.getAllByRole('tab')
    a.focus()
    await user.keyboard('{ArrowRight}')
    expect(b).toHaveAttribute('aria-selected', 'true')
    expect(b).toHaveFocus()
    await user.keyboard('{End}')
    expect(c).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}')
    expect(a).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowLeft}')
    expect(c).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Home}')
    expect(a).toHaveAttribute('aria-selected', 'true')
  })

  it('selects on click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('tab', { name: 'Gamma' }))
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})

describe('SummitPathway', () => {
  it('starts on phase 1 and its panel is named by its tab', () => {
    render(<SummitPathway />)
    const panel = screen.getByRole('tabpanel')
    const tab = screen.getByRole('tab', { selected: true })
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(
      within(panel).getByRole('heading', { name: SUMMIT_PHASES[0].title }),
    ).toBeInTheDocument()
  })

  it('shows the matching panel and fills the rail when a later phase is chosen', async () => {
    const user = userEvent.setup()
    render(<SummitPathway />)
    await user.click(screen.getByRole('tab', { name: /Green hydrogen/ }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: SUMMIT_PHASES[2].title }),
      ).toBeInTheDocument(),
    )
    const filled = screen
      .getByTestId('pathway-rail')
      .querySelectorAll('[data-filled="true"]')
    expect(filled).toHaveLength(3)
  })
})

describe('AnimatedAccordion', () => {
  const entries = [
    { id: 'one', heading: 'One', content: <p>first body</p> },
    { id: 'two', heading: 'Two', content: <p>second body</p> },
  ]

  it('opens the first entry by default, so content is there without interaction', () => {
    render(<AnimatedAccordion entries={entries} />)
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('first body')).toBeInTheDocument()
    expect(screen.queryByText('second body')).toBeNull()
  })

  it('opens one at a time and can close the open one', async () => {
    const user = userEvent.setup()
    render(<AnimatedAccordion entries={entries} />)
    await user.click(screen.getByRole('button', { name: 'Two' }))
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await waitFor(() => expect(screen.queryByText('first body')).toBeNull())
    await user.click(screen.getByRole('button', { name: 'Two' }))
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('names each region by its button', () => {
    render(<AnimatedAccordion entries={entries} />)
    const region = screen.getByRole('region')
    const button = screen.getByRole('button', { name: 'One' })
    expect(region).toHaveAttribute('aria-labelledby', button.id)
    expect(button).toHaveAttribute('aria-controls', region.id)
  })
})

describe('SummitGallery', () => {
  const open = async (user: ReturnType<typeof userEvent.setup>, n = 0) =>
    user.click(screen.getAllByRole('button', { name: /^Open photo/ })[n])

  it('renders every photo as an openable tile, with alt text', () => {
    render(<SummitGallery images={SUMMIT_GALLERY} />)
    expect(screen.getAllByRole('button', { name: /^Open photo/ })).toHaveLength(
      SUMMIT_GALLERY.length,
    )
    for (const image of SUMMIT_GALLERY)
      expect(screen.getByAltText(image.alt)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens the chosen photo in a labelled dialog with a counter', async () => {
    const user = userEvent.setup()
    render(<SummitGallery images={SUMMIT_GALLERY} />)
    await open(user, 2)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName(
      `Summit photo 3 of ${SUMMIT_GALLERY.length}`,
    )
    expect(
      within(dialog).getByText(`3 / ${SUMMIT_GALLERY.length}`),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(SUMMIT_GALLERY[2].caption),
    ).toBeInTheDocument()
  })

  it('moves with the buttons and arrow keys, wrapping at both ends', async () => {
    const user = userEvent.setup()
    render(<SummitGallery images={SUMMIT_GALLERY} />)
    await open(user, 0)
    const dialog = await screen.findByRole('dialog')
    const n = SUMMIT_GALLERY.length
    await user.click(
      within(dialog).getByRole('button', { name: 'Previous photo' }),
    )
    expect(within(dialog).getByText(`${n} / ${n}`)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }))
    expect(within(dialog).getByText(`1 / ${n}`)).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(within(dialog).getByText(`2 / ${n}`)).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(within(dialog).getByText(`1 / ${n}`)).toBeInTheDocument()
  })

  it('closes with Escape and with the close button, returning focus to the tile', async () => {
    const user = userEvent.setup()
    render(<SummitGallery images={SUMMIT_GALLERY} />)
    await open(user, 1)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /^Open photo/ })[1],
      ).toHaveFocus(),
    )

    await open(user, 0)
    const dialog = await screen.findByRole('dialog')
    await act(async () => {
      await user.click(
        within(dialog).getByRole('button', { name: 'Close gallery' }),
      )
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
