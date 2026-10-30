import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from '@/components/site-header'
import { NAVIGATION_LINKS } from '@/lib/constants'

const pathname = vi.hoisted(() => ({ value: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }))

describe('SiteHeader: desktop navigation', () => {
  beforeEach(() => {
    pathname.value = '/'
  })

  it('renders every nav link in order', () => {
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(
      NAVIGATION_LINKS.map((l) => l.href),
    )
  })

  it.each([
    ['/', 'Home'],
    ['/about', 'About'],
    ['/services', 'Services'],
    ['/projects', 'Projects'],
    ['/contact', 'Contact'],
  ])('marks %s as the current page', (path, label) => {
    pathname.value = path
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const current = within(nav)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page')
    expect(current.map((l) => l.textContent)).toEqual([label])
  })

  it('keeps a parent item active on child routes, but never Home', () => {
    pathname.value = '/services/solar'
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Services' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('has a Get in touch call-to-action that is a real link, not a button inside a link', () => {
    render(<SiteHeader />)
    const cta = screen
      .getAllByRole('link', { name: /get in touch/i })
      .find((l) => l.getAttribute('data-slot') === 'button')
    expect(cta).toHaveAttribute('href', '/contact')
    expect(cta?.querySelector('button')).toBeNull()
  })
})

describe('SiteHeader: mobile menu (dropdown from the header pill)', () => {
  beforeEach(() => {
    pathname.value = '/about'
    window.__reduceMotion = false
  })

  const toggle = () => screen.getByRole('button', { name: /open menu/i })
  const open = async () => {
    render(<SiteHeader />)
    await userEvent.click(toggle())
    return screen.getByRole('dialog')
  }

  it('is closed until the toggle is pressed, and says so to assistive tech', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveAttribute('aria-label', 'Open menu')
  })

  it('draws two lines, not three, and no icon glyph', () => {
    render(<SiteHeader />)
    const lines = toggle().querySelectorAll('span[aria-hidden] > span')
    expect(lines).toHaveLength(2)
    expect(toggle().querySelector('svg')).toBeNull()
  })

  it('morphs the two lines into an X while open (rotate, not swap)', async () => {
    render(<SiteHeader />)
    const trigger = toggle()
    const [top, bottom] = trigger.querySelectorAll('span[aria-hidden] > span')
    expect(top.className).not.toMatch(/rotate-45/)
    await userEvent.click(trigger)
    await screen.findByRole('dialog')
    expect(top).toHaveClass('rotate-45', 'translate-y-[3.5px]')
    expect(bottom).toHaveClass('-rotate-45', '-translate-y-[3.5px]')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-label', 'Close menu')
  })

  it('only moves the lines when motion is allowed', () => {
    render(<SiteHeader />)
    for (const line of toggle().querySelectorAll('span[aria-hidden] > span'))
      expect(line.className).toMatch(/motion-safe:transition-transform/)
  })

  it('opens as an accessible dialog containing every page link, in order', async () => {
    const dialog = await open()
    expect(dialog).toHaveAccessibleName('Site navigation')
    const nav = within(dialog).getByRole('navigation', { name: 'Mobile' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.getAttribute('href')),
    ).toEqual(NAVIGATION_LINKS.map((l) => l.href))
  })

  it('is plain text: no icons, chevrons, phone line or legal links', async () => {
    const dialog = await open()
    expect(dialog.querySelector('svg')).toBeNull()
    expect(within(dialog).queryByRole('link', { name: /\+234/ })).toBeNull()
    expect(within(dialog).queryByRole('link', { name: /privacy/i })).toBeNull()
    expect(within(dialog).queryByRole('link', { name: /terms/i })).toBeNull()
  })

  it('centres the links and gives each a 48px touch target', async () => {
    const dialog = await open()
    const nav = within(dialog).getByRole('navigation', { name: 'Mobile' })
    for (const link of within(nav).getAllByRole('link'))
      expect(link).toHaveClass('justify-center', 'min-h-12', 'text-lg')
  })

  it('ends with one green "Explore Our Services" button after the links', async () => {
    const dialog = await open()
    const cta = within(dialog).getByRole('link', {
      name: 'Explore Our Services',
    })
    expect(cta).toHaveAttribute('href', '/services')
    expect(cta).toHaveClass('bg-leaf', 'rounded-full', 'w-full')
    expect(cta.querySelector('svg')).toBeNull()
    const nav = within(dialog).getByRole('navigation', { name: 'Mobile' })
    expect(
      nav.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('marks the current page inside the menu', async () => {
    const dialog = await open()
    expect(within(dialog).getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      within(dialog).getByRole('link', { name: 'Services' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('hangs from the header pill: same side margins, one gap below it', async () => {
    const dialog = await open()
    expect(dialog).toHaveAttribute('data-slot', 'menu-panel')
    expect(dialog).toHaveClass(
      'glass',
      'fixed',
      'overflow-hidden',
      'rounded-3xl',
    )
    expect(dialog.className).toMatch(/top-\(--header-h\)/)
    expect(dialog.className).toMatch(/inset-x-\(--container-pad\)/)
    // The old grow-out-of-the-button panel is gone.
    expect(dialog.className).not.toMatch(/w-\(--menu-w\)/)
    expect(dialog.style.transformOrigin).toBe('')
  })

  it('scrolls inside itself on a short screen, without scrolling the page behind', async () => {
    const dialog = await open()
    const scroller = dialog.querySelector('.overflow-y-auto')
    expect(scroller).toHaveClass('overscroll-contain')
    expect(scroller?.className).toMatch(
      /max-h-\[calc\(100svh-var\(--header-h\)/,
    )
  })

  it('expands by height on a normal device, and only fades under reduced motion', async () => {
    const normal = await open()
    expect(normal.style.height).not.toBe('')
    cleanup()

    window.__reduceMotion = true
    const reduced = await open()
    expect(reduced.style.height).toBe('')
  })

  it('closes when a link is chosen', async () => {
    const dialog = await open()
    await userEvent.click(
      within(dialog).getByRole('link', { name: 'Services' }),
    )
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes when the call to action is chosen', async () => {
    const dialog = await open()
    await userEvent.click(
      within(dialog).getByRole('link', { name: 'Explore Our Services' }),
    )
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes with Escape and returns focus to the toggle', async () => {
    await open()
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
    expect(toggle()).toHaveFocus()
  })

  it('moves focus into the panel on open, so Tab starts at the first link', async () => {
    const dialog = await open()
    expect(dialog).toHaveFocus()
    await userEvent.tab()
    expect(within(dialog).getByRole('link', { name: 'Home' })).toHaveFocus()
  })

  it('pressing the toggle again closes it, and it stays closed', async () => {
    render(<SiteHeader />)
    await userEvent.click(toggle())
    await screen.findByRole('dialog')
    // Radix sets pointer-events:none on <body> while open; the header pill
    // opts back in with the `pointer-events-auto` class. jsdom loads no
    // Tailwind CSS, so skip its pointer-events check for this click only.
    await userEvent
      .setup({ pointerEventsCheck: 0 })
      .click(document.querySelector('button[aria-expanded="true"]') as Element)
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    // Not swallowed as an outside click and re-opened.
    await new Promise((r) => setTimeout(r, 200))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes when the backdrop (outside the panel) is pressed', async () => {
    await open()
    const scrim = document.querySelector('.fixed.inset-0.z-30') as Element
    // The backdrop is a plain dim: no blur layer stacked on the panel's own.
    expect(scrim.className).not.toMatch(/backdrop-blur/)
    await userEvent.click(scrim)
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes with the screen-reader close button', async () => {
    const dialog = await open()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close menu' }),
    )
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes itself if the screen grows to the desktop layout while open', async () => {
    // Capture the listener the component registers on the desktop query.
    const original = window.matchMedia
    let notify: ((e: MediaQueryListEvent) => void) | undefined
    window.matchMedia = ((query: string) => {
      const mql = original(query)
      if (query.includes('min-width'))
        mql.addEventListener = ((_: string, fn: typeof notify) => {
          notify = fn
        }) as typeof mql.addEventListener
      return mql
    }) as typeof window.matchMedia
    try {
      await open()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      act(() => notify?.({ matches: true } as MediaQueryListEvent))
      await vi.waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      )
    } finally {
      window.matchMedia = original
    }
  })
})
