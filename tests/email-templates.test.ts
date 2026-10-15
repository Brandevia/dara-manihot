import { describe, expect, it } from 'vitest'
import { COMPANY_INFO, SITE_URL } from '@/lib/constants'
import {
  esc,
  renderAcknowledgement,
  renderNotification,
} from '@/lib/email-templates'
import type { EnquiryInput } from '@/lib/enquiry'

const enquiry: EnquiryInput = {
  name: 'Ada Okafor',
  email: 'ada@example.com',
  phone: '+234 802 340 0557',
  service: 'solar-renewables',
  message: 'We need a solar quote.\nThree sites, one mill.',
}
const ctx = {
  reference: 'DM-261014-ABCD',
  receivedAt: '2026-10-14T10:00:00.000Z',
}

describe('esc', () => {
  it('escapes the five HTML metacharacters', () => {
    expect(esc(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    )
  })
})

describe('internal notification', () => {
  const mail = renderNotification(enquiry, ctx)

  it('puts the reference, service and sender in the subject', () => {
    expect(mail.subject).toContain('DM-261014-ABCD')
    expect(mail.subject).toContain('Solar PV & Renewable Energy Solutions')
    expect(mail.subject).toContain('Ada Okafor')
  })

  it('carries every submitted detail in html and text', () => {
    for (const body of [mail.html, mail.text]) {
      expect(body).toContain('ada@example.com')
      expect(body).toContain('+234 802 340 0557')
      expect(body).toContain('DM-261014-ABCD')
      expect(body).toContain('Three sites, one mill.')
    }
  })

  it('says so when no phone number was given', () => {
    expect(renderNotification({ ...enquiry, phone: '' }, ctx).text).toContain(
      'Phone: Not provided',
    )
  })

  it('is branded: logo from the site URL and the brand colours', () => {
    expect(mail.html).toContain(`${SITE_URL}/logo.png`)
    expect(mail.html).toContain('#176827')
    expect(mail.html).toContain('#84289a')
    expect(mail.html).toContain(COMPANY_INFO.address)
  })

  it('keeps the subject on one line even if a field somehow has a newline', () => {
    const sneaky = renderNotification(
      { ...enquiry, name: 'Ada\r\nBcc: x@y.com' },
      ctx,
    )
    expect(sneaky.subject).not.toMatch(/[\r\n]/)
  })

  it('cannot be used to inject markup (XSS in the mailbox)', () => {
    const evil = renderNotification(
      {
        ...enquiry,
        name: '<img src=x onerror=alert(1)>',
        message: '<script>alert(1)</script>',
        phone: '"><b>',
      },
      ctx,
    )
    expect(evil.html).not.toContain('<script>')
    expect(evil.html).not.toContain('<img src=x')
    expect(evil.html).not.toContain('"><b>')
    expect(evil.html).toContain('&lt;script&gt;')
  })
})

describe('visitor acknowledgement', () => {
  const mail = renderAcknowledgement(enquiry, ctx)

  it('thanks the visitor by first name and quotes the reference', () => {
    expect(mail.html).toContain('Thank you, Ada')
    expect(mail.text).toContain('Thank you, Ada')
    expect(mail.subject).toContain('DM-261014-ABCD')
  })

  it('names the service and echoes the message back', () => {
    expect(mail.text).toContain('Solar PV & Renewable Energy Solutions')
    expect(mail.text).toContain('We need a solar quote.')
  })

  it('offers a way to reach the team sooner', () => {
    expect(mail.text).toContain(COMPANY_INFO.phones[0].display)
    expect(mail.text).toContain(COMPANY_INFO.hours)
  })

  it('tells a wrongly addressed recipient it is safe to ignore', () => {
    expect(mail.text).toMatch(/did not make this enquiry/i)
  })

  it('escapes visitor supplied text', () => {
    const evil = renderAcknowledgement(
      {
        ...enquiry,
        name: '<b>Ada</b> Okafor',
        message: '<script>x</script> hello there',
      },
      ctx,
    )
    expect(evil.html).not.toContain('<script>')
    expect(evil.html).not.toContain('<b>Ada')
  })
})
