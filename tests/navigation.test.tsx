import { render, screen, within } from '@testing-library/react'
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

describe('SiteHeader: mobile drawer', () => {
  beforeEach(() => {
    pathname.value = '/about'
  })

  const open = async () => {
    render(<SiteHeader />)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    return screen.getByRole('dialog')
  }

  it('is closed until the hamburger is pressed', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens as an accessible dialog containing every page link', async () => {
    const dialog = await open()
    expect(dialog).toHaveAccessibleName('Site navigation')
    const nav = within(dialog).getByRole('navigation', { name: 'Mobile' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.getAttribute('href')),
    ).toEqual(NAVIGATION_LINKS.map((l) => l.href))
  })

  it('marks the current page inside the drawer', async () => {
    const dialog = await open()
    expect(within(dialog).getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('offers the contact CTA, phone link and legal links', async () => {
    const dialog = await open()
    expect(
      within(dialog).getByRole('link', { name: /get in touch/i }),
    ).toHaveAttribute('href', '/contact')
    expect(
      within(dialog).getByRole('link', { name: /\+234 802 340 0557/ }),
    ).toHaveAttribute('href', 'tel:+2348023400557')
    expect(
      within(dialog).getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/privacy')
    expect(
      within(dialog).getByRole('link', { name: 'Terms of Service' }),
    ).toHaveAttribute('href', '/terms')
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

  it('closes with Escape and returns focus to the hamburger', async () => {
    await open()
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
  })

  it('is a floating glass panel that grows out of the hamburger', async () => {
    const dialog = await open()
    expect(dialog).toHaveAttribute('data-slot', 'menu-panel')
    expect(dialog).toHaveClass('glass', 'fixed', 'rounded-3xl')
    // Anchored under the header, scaling from the hamburger's centre.
    expect(dialog.style.transformOrigin).toBe('var(--menu-origin)')
    expect(dialog.className).toMatch(/top-\(--header-h\)/)
    expect(dialog.className).toMatch(/w-\(--menu-w\)/)
  })

  it('turns the hamburger into a close button while open', async () => {
    render(<SiteHeader />)
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await screen.findByRole('dialog')
    expect(
      document.querySelector('button[aria-expanded="true"]'),
    ).toHaveAttribute('aria-label', 'Close menu')
  })

  it('pressing the hamburger again closes it, and it stays closed', async () => {
    render(<SiteHeader />)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
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

  it('closes when the scrim behind it is pressed', async () => {
    await open()
    const scrim = document.querySelector('.fixed.inset-0.z-30') as Element
    await userEvent.click(scrim)
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes with the close button', async () => {
    const dialog = await open()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close menu' }),
    )
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })
})
