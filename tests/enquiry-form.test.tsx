import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let search = ''
vi.mock('next/navigation', () => ({
  usePathname: () => '/contact',
  useSearchParams: () => new URLSearchParams(search),
}))

import { EnquiryForm } from '@/components/enquiry-form'
import { SERVICE_OPTIONS, serviceLabel } from '@/lib/enquiry'
import { HONEYPOT_FIELD } from '@/lib/spam'

const fetchMock = vi.fn()
const realFetch = globalThis.fetch

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}
function fillValid() {
  fill(/full name/i, 'Ada Okafor')
  fill(/email address/i, 'ada@example.com')
  fill(/service of interest/i, 'solar-renewables')
  fill(/how can we help/i, 'We would like a solar quote for our mill.')
}
const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))
const reply = (status: number, body: unknown) =>
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }))

beforeEach(() => {
  search = ''
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  cleanup()
  // Restore only fetch: vitest.setup.ts stubs IntersectionObserver for next/link.
  vi.stubGlobal('fetch', realFetch)
})

describe('EnquiryForm: structure (scope 4.5)', () => {
  it('captures name, email, phone, service and message', () => {
    render(<EnquiryForm />)
    for (const label of [
      /full name/i,
      /email address/i,
      /phone number/i,
      /service of interest/i,
      /how can we help/i,
    ])
      expect(screen.getByLabelText(label)).toBeTruthy()
  })

  it('uses mobile friendly input types', () => {
    render(<EnquiryForm />)
    expect(screen.getByLabelText(/email address/i).getAttribute('type')).toBe(
      'email',
    )
    expect(screen.getByLabelText(/phone number/i).getAttribute('type')).toBe(
      'tel',
    )
    expect(screen.getByLabelText(/service of interest/i).tagName).toBe('SELECT')
  })

  it('uses 16px text on fields so iOS does not zoom on focus', () => {
    render(<EnquiryForm />)
    for (const label of [/full name/i, /email address/i, /how can we help/i])
      expect(screen.getByLabelText(label).className).toContain('text-base')
  })

  it('groups the services by pillar', () => {
    render(<EnquiryForm />)
    const groups = [...document.querySelectorAll('optgroup')].map(
      (g) => g.label,
    )
    expect(groups).toEqual(
      expect.arrayContaining(['Sustainable Agriculture', 'Sustainable Energy']),
    )
  })

  it('preselects the service from ?service=', () => {
    search = 'service=green-hydrogen'
    render(<EnquiryForm />)
    expect(
      (screen.getByLabelText(/service of interest/i) as HTMLSelectElement)
        .value,
    ).toBe('green-hydrogen')
  })

  it('ignores an unknown ?service=', () => {
    search = 'service=bogus'
    render(<EnquiryForm />)
    expect(
      (screen.getByLabelText(/service of interest/i) as HTMLSelectElement)
        .value,
    ).toBe('')
  })

  it('hides the honeypot from people and screen readers', () => {
    render(<EnquiryForm />)
    const trap = document.querySelector(
      `input[name="${HONEYPOT_FIELD}"]`,
    ) as HTMLInputElement
    expect(trap.tabIndex).toBe(-1)
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})

describe('EnquiryForm: validation', () => {
  it('shows an error per invalid field, without calling the server', () => {
    render(<EnquiryForm />)
    submit()
    expect(screen.getByText(/please enter your name/i)).toBeTruthy()
    expect(screen.getByText(/please enter your email address/i)).toBeTruthy()
    expect(screen.getByText(/please choose a service/i)).toBeTruthy()
    expect(screen.getByText(/tell us how we can help/i)).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('flags a badly formed email and links the message to the field', () => {
    render(<EnquiryForm />)
    fillValid()
    fill(/email address/i, 'not-an-email')
    submit()
    const field = screen.getByLabelText(/email address/i)
    expect(field.getAttribute('aria-invalid')).toBe('true')
    const describedBy = field.getAttribute('aria-describedby') as string
    expect(document.getElementById(describedBy)?.textContent).toMatch(
      /valid email/i,
    )
  })

  it('focuses the first invalid field', () => {
    render(<EnquiryForm />)
    submit()
    expect(document.activeElement).toBe(screen.getByLabelText(/full name/i))
  })

  it('clears a field error as soon as the visitor edits it', () => {
    render(<EnquiryForm />)
    submit()
    fill(/full name/i, 'Ada')
    expect(screen.queryByText(/please enter your name/i)).toBeNull()
  })
})

describe('EnquiryForm: submission', () => {
  it('posts the cleaned data with the anti spam fields', async () => {
    reply(200, { ok: true, reference: 'DM-261014-ABCD', acknowledged: true })
    render(<EnquiryForm />)
    fillValid()
    submit()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/enquiry')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      name: 'Ada Okafor',
      email: 'ada@example.com',
      service: 'solar-renewables',
    })
    expect(body[HONEYPOT_FIELD]).toBe('')
    expect(typeof body.startedAt).toBe('number')
  })

  it('shows a clear confirmation with the reference (scope 4.5)', async () => {
    reply(200, { ok: true, reference: 'DM-261014-ABCD', acknowledged: true })
    render(<EnquiryForm />)
    fillValid()
    submit()
    const box = await screen.findByTestId('enquiry-success')
    expect(box.getAttribute('role')).toBe('status')
    expect(box.textContent).toContain('ada@example.com')
    expect(screen.getByTestId('enquiry-reference').textContent).toBe(
      'DM-261014-ABCD',
    )
    expect(screen.queryByRole('button', { name: /send enquiry/i })).toBeNull()
  })

  it('moves focus to the confirmation for keyboard and screen reader users', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: true })
    render(<EnquiryForm />)
    fillValid()
    submit()
    const box = await screen.findByTestId('enquiry-success')
    await waitFor(() => expect(document.activeElement).toBe(box))
  })

  it('is honest when the acknowledgement email could not be sent', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: false })
    render(<EnquiryForm />)
    fillValid()
    submit()
    expect((await screen.findByTestId('enquiry-success')).textContent).toMatch(
      /could not send you a confirmation/i,
    )
  })

  it('disables the button while sending, so a double click cannot duplicate', async () => {
    let resolve!: (r: Response) => void
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)))
    render(<EnquiryForm />)
    fillValid()
    submit()
    const button = await screen.findByRole('button', { name: /sending/i })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.submit(screen.getByRole('form', { name: /enquiry form/i }))
    expect(fetchMock).toHaveBeenCalledOnce()
    resolve(
      new Response(
        JSON.stringify({ ok: true, reference: 'DM-1', acknowledged: true }),
      ),
    )
    await screen.findByTestId('enquiry-success')
  })

  it('shows server field errors and keeps what the visitor typed', async () => {
    reply(422, { ok: false, errors: { email: 'Server says no.' } })
    render(<EnquiryForm />)
    fillValid()
    submit()
    expect(await screen.findByText('Server says no.')).toBeTruthy()
    expect(
      (screen.getByLabelText(/full name/i) as HTMLInputElement).value,
    ).toBe('Ada Okafor')
  })

  it('shows the server message plus direct contact details on failure, keeping the input', async () => {
    reply(502, { ok: false, error: 'We could not send your enquiry just now.' })
    render(<EnquiryForm />)
    fillValid()
    submit()
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain(
      'We could not send your enquiry just now.',
    )
    expect(alert.querySelector('a[href^="mailto:"]')).not.toBeNull()
    expect(alert.querySelector('a[href^="tel:"]')).not.toBeNull()
    expect(
      (screen.getByLabelText(/how can we help/i) as HTMLTextAreaElement).value,
    ).toContain('solar quote')
  })

  it('handles a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<EnquiryForm />)
    fillValid()
    submit()
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /check your connection/i,
    )
  })

  it('lets the visitor send another enquiry', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: true })
    render(<EnquiryForm />)
    fillValid()
    submit()
    await screen.findByTestId('enquiry-success')
    fireEvent.click(screen.getByRole('button', { name: /send another/i }))
    expect(
      (screen.getByLabelText(/full name/i) as HTMLInputElement).value,
    ).toBe('')
  })
})

describe('EnquiryForm: service dropdown with a mouse', () => {
  beforeEach(() => {
    window.__finePointer = true
  })
  afterEach(() => {
    window.__finePointer = false
  })

  const field = () => screen.getByLabelText(/service of interest/i)
  const choose = (name: RegExp) => {
    fireEvent.click(field())
    fireEvent.click(screen.getByRole('option', { name }))
  }

  it('is a styled listbox button with every service under its pillar', () => {
    render(<EnquiryForm />)
    expect(field().tagName).toBe('BUTTON')
    expect(field()).toHaveAttribute('id', 'enquiry-service')
    fireEvent.click(field())
    const headings = [
      'General',
      'Sustainable Agriculture',
      'Sustainable Energy',
    ]
    for (const h of headings) expect(screen.getByText(h)).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(SERVICE_OPTIONS.length)
  })

  it('preselects the service from ?service=', () => {
    search = 'service=green-hydrogen'
    render(<EnquiryForm />)
    expect(field()).toHaveTextContent(serviceLabel('green-hydrogen'))
  })

  it('ignores an unknown ?service= and shows the placeholder', () => {
    search = 'service=bogus'
    render(<EnquiryForm />)
    expect(field()).toHaveTextContent('Select a service')
  })

  it('shows the error, marks the field invalid and moves focus to it', () => {
    render(<EnquiryForm />)
    submit()
    expect(screen.getByText(/please choose a service/i)).toBeTruthy()
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field().getAttribute('aria-describedby')).toContain(
      'enquiry-service-error',
    )
    // Name is the first invalid field, so fix it and the service gets focus.
    fill(/full name/i, 'Ada Okafor')
    fill(/email address/i, 'ada@example.com')
    fill(/how can we help/i, 'We would like a solar quote for our mill.')
    submit()
    expect(document.activeElement).toBe(field())
  })

  it('clears the error as soon as a service is chosen', () => {
    render(<EnquiryForm />)
    submit()
    choose(/solar/i)
    expect(screen.queryByText(/please choose a service/i)).toBeNull()
    expect(field()).toHaveAttribute('aria-invalid', 'false')
  })

  it('submits the chosen service', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: true })
    render(<EnquiryForm />)
    fill(/full name/i, 'Ada Okafor')
    fill(/email address/i, 'ada@example.com')
    fill(/how can we help/i, 'We would like a solar quote for our mill.')
    choose(new RegExp(serviceLabel('solar-renewables'), 'i'))
    submit()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).service).toBe(
      'solar-renewables',
    )
  })

  it('opening and choosing never submits the form on its own', () => {
    render(<EnquiryForm />)
    choose(/general enquiry/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('can be filled in with the keyboard alone', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: true })
    render(<EnquiryForm />)
    fill(/full name/i, 'Ada Okafor')
    fill(/email address/i, 'ada@example.com')
    fill(/how can we help/i, 'We would like a solar quote for our mill.')
    fireEvent.keyDown(field(), { key: 'ArrowDown' })
    fireEvent.keyDown(field(), { key: 'Enter' }) // first row: General enquiry
    submit()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).service).toBe('general')
  })

  it('"Send another enquiry" resets the dropdown to the placeholder', async () => {
    reply(200, { ok: true, reference: 'DM-1', acknowledged: true })
    render(<EnquiryForm />)
    fill(/full name/i, 'Ada Okafor')
    fill(/email address/i, 'ada@example.com')
    fill(/how can we help/i, 'We would like a solar quote for our mill.')
    choose(/general enquiry/i)
    submit()
    await screen.findByTestId('enquiry-success')
    fireEvent.click(screen.getByRole('button', { name: /send another/i }))
    expect(field()).toHaveTextContent('Select a service')
  })
})
