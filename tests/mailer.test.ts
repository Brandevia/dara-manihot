import type { Transporter } from 'nodemailer'
import { describe, expect, it, vi } from 'vitest'
import { COMPANY_INFO } from '@/lib/constants'
import {
  type MailConfig,
  MailNotConfiguredError,
  readMailConfig,
  sendEnquiryEmails,
} from '@/lib/mailer'

const enquiry = {
  name: 'Ada Okafor',
  email: 'ada@example.com',
  phone: '',
  service: 'general',
  message: 'Hello, I would like to talk about a partnership.',
}
const ctx = {
  reference: 'DM-261014-ABCD',
  receivedAt: '2026-10-14T10:00:00.000Z',
}
const config: MailConfig = {
  driver: 'smtp',
  host: 'mail.example.com',
  port: 465,
  secure: true,
  user: 'noreply@example.com',
  pass: 'secret',
  from: '"Dara-Manihot" <noreply@example.com>',
  to: 'info@example.com',
}

const fakeTransport = (sendMail: ReturnType<typeof vi.fn>) =>
  ({ sendMail }) as unknown as Transporter

describe('readMailConfig', () => {
  it('returns null until host, user and password are all set', () => {
    expect(readMailConfig({})).toBeNull()
    expect(readMailConfig({ SMTP_HOST: 'h', SMTP_USER: 'u' })).toBeNull()
    expect(readMailConfig({ SMTP_HOST: 'h', SMTP_PASS: 'p' })).toBeNull()
  })

  it('applies sensible defaults', () => {
    const c = readMailConfig({
      SMTP_HOST: 'h',
      SMTP_USER: 'u@x.com',
      SMTP_PASS: 'p',
    })
    expect(c).toMatchObject({ port: 465, secure: true, to: COMPANY_INFO.email })
    expect(c?.from).toContain('u@x.com')
  })

  it('uses STARTTLS settings for port 587 unless told otherwise', () => {
    const base = {
      SMTP_HOST: 'h',
      SMTP_USER: 'u',
      SMTP_PASS: 'p',
      SMTP_PORT: '587',
    }
    expect(readMailConfig(base)?.secure).toBe(false)
    expect(readMailConfig({ ...base, SMTP_SECURE: 'true' })?.secure).toBe(true)
  })

  it('honours explicit sender and recipient', () => {
    const c = readMailConfig({
      SMTP_HOST: 'h',
      SMTP_USER: 'u',
      SMTP_PASS: 'p',
      MAIL_FROM: 'Site <site@x.com>',
      ENQUIRY_TO: 'boss@x.com',
    })
    expect(c).toMatchObject({ from: 'Site <site@x.com>', to: 'boss@x.com' })
  })

  it('supports the json test driver without credentials', () => {
    expect(readMailConfig({ MAIL_DRIVER: 'json' })?.driver).toBe('json')
  })
})

describe('sendEnquiryEmails', () => {
  it('sends the notification first, then the acknowledgement', async () => {
    const sendMail = vi.fn().mockResolvedValue({})
    const result = await sendEnquiryEmails(enquiry, ctx, {
      config,
      transport: fakeTransport(sendMail),
    })

    expect(result).toEqual({ notified: true, acknowledged: true })
    expect(sendMail).toHaveBeenCalledTimes(2)
    const [notify, ack] = sendMail.mock.calls.map((c) => c[0])

    expect(notify.to).toBe('info@example.com')
    expect(notify.from).toBe(config.from)
    expect(notify.replyTo).toEqual({
      name: 'Ada Okafor',
      address: 'ada@example.com',
    })

    expect(ack.to).toEqual({ name: 'Ada Okafor', address: 'ada@example.com' })
    expect(ack.replyTo).toBe('info@example.com')
    expect(ack.headers['Auto-Submitted']).toBe('auto-replied')
    expect(ack.html).toBeTruthy()
    expect(ack.text).toBeTruthy()
  })

  it('throws when not configured, sending nothing', async () => {
    const sendMail = vi.fn()
    await expect(
      sendEnquiryEmails(enquiry, ctx, {
        config: null,
        transport: fakeTransport(sendMail),
      }),
    ).rejects.toBeInstanceOf(MailNotConfiguredError)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('propagates a notification failure and never sends the acknowledgement', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('smtp down'))
    await expect(
      sendEnquiryEmails(enquiry, ctx, {
        config,
        transport: fakeTransport(sendMail),
      }),
    ).rejects.toThrow('smtp down')
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('survives an acknowledgement failure: the enquiry is still delivered', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sendMail = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('550 no such user'))
    const result = await sendEnquiryEmails(enquiry, ctx, {
      config,
      transport: fakeTransport(sendMail),
    })
    expect(result).toEqual({ notified: true, acknowledged: false })
    expect(err).toHaveBeenCalledOnce()
    err.mockRestore()
  })

  it('really builds both messages with the json transport', async () => {
    const result = await sendEnquiryEmails(enquiry, ctx, {
      config: readMailConfig({ MAIL_DRIVER: 'json' }),
    })
    expect(result.acknowledged).toBe(true)
  })
})
