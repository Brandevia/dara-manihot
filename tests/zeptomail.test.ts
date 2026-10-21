import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readMailConfig, sendEnquiryEmails } from '@/lib/mailer'
const env = { MAIL_DRIVER: 'zeptomail', ZEPTOMAIL_TOKEN: 'test-key', ZEPTOMAIL_FROM_EMAIL: 'noreply@daramanihot.com.ng', ENQUIRY_TO: 'company@example.com' }
const enquiry = { name: 'Test Visitor', email: 'visitor@example.com', phone: '', service: 'general', message: '<script>test</script>' }
const ctx = { reference: 'DM-261019-ABCD', receivedAt: '2026-10-19T12:00:00.000Z' }
const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async () => Response.json({ data: [{ code: 'EM_104' }] }))
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); fetchMock.mockReset() })
describe('ZeptoMail configuration', () => {
  it('selects API delivery with a token and verified sender', () => {
    expect(readMailConfig(env)).toMatchObject({ driver: 'zeptomail', token: 'test-key', from: env.ZEPTOMAIL_FROM_EMAIL, to: env.ENQUIRY_TO })
    expect(readMailConfig({ ...env, MAIL_DRIVER: undefined })?.driver).toBe('zeptomail')
  })
  it.each([{ ZEPTOMAIL_TOKEN: '' }, { ZEPTOMAIL_TOKEN: 'Zoho-enczapikey ********' }, { ZEPTOMAIL_FROM_EMAIL: '@daramanihot.com.ng' }, { ENQUIRY_TO: 'invalid' }])('fails closed on invalid API settings', (override) => {
    expect(readMailConfig({ ...env, ...override, SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p' })).toBeNull()
  })
})
describe('ZeptoMail enquiry delivery', () => {
  it('sends company and visitor messages separately, preserving templates and Reply-To', async () => {
    expect(await sendEnquiryEmails(enquiry, ctx, { config: readMailConfig(env) })).toEqual({ notified: true, acknowledged: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('https://cpaas.zoho.com/v1.1/email')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Zoho-enczapikey test-key')
    const [company, visitor] = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body))
    expect(company.from).toEqual({ address: env.ZEPTOMAIL_FROM_EMAIL, name: 'Dara-Manihot' })
    expect(company.to).toEqual([{ email_address: { address: env.ENQUIRY_TO } }])
    expect(company.reply_to).toEqual([{ address: enquiry.email, name: enquiry.name }])
    expect(visitor.to).toEqual([{ email_address: { address: enquiry.email, name: enquiry.name } }])
    expect(visitor.reply_to).toEqual([{ address: env.ENQUIRY_TO }])
    expect(visitor.mime_headers['Auto-Submitted']).toBe('auto-replied')
    for (const message of [company, visitor]) {
      expect(message.htmlbody).toContain(ctx.reference)
      expect(message.textbody).toContain(ctx.reference)
      expect(message.htmlbody).not.toContain('<script>test</script>')
    }
  })
  it('accepts full prefixed tokens', async () => {
    await sendEnquiryEmails(enquiry, ctx, { config: readMailConfig({ ...env, ZEPTOMAIL_TOKEN: 'Zoho-enczapikey full-key' }) })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Zoho-enczapikey full-key')
  })
  it('skips acknowledgement if the notification is rejected', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'private provider detail' }, { status: 401 }))
    await expect(sendEnquiryEmails(enquiry, ctx, { config: readMailConfig(env) })).rejects.toThrow('ZeptoMail did not accept')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('does not mistake an unexpected HTTP 200 for email acceptance', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: [{ code: 'ERROR' }] }))
    await expect(sendEnquiryEmails(enquiry, ctx, { config: readMailConfig(env) })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('keeps company success when acknowledgement fails without retrying', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: [{ code: 'EM_104' }] }))
      .mockRejectedValueOnce(new Error('private token test-key'))
    expect(await sendEnquiryEmails(enquiry, ctx, { config: readMailConfig(env) })).toEqual({ notified: true, acknowledged: false })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain('test-key')
  })
  it('does not retry uncertain provider timeouts or leak error details', async () => {
    fetchMock.mockRejectedValue(new Error('private token test-key'))
    await expect(sendEnquiryEmails(enquiry, ctx, { config: readMailConfig(env) })).rejects.toThrow('acceptance is uncertain')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
