import type { SendMailOptions } from 'nodemailer'
import type { MailConfig } from '@/lib/mailer'

function emailAddresses(value: SendMailOptions['to']): { address: string; name?: string }[] {
  if (Array.isArray(value)) return value.flatMap((entry) => emailAddresses(entry))
  if (typeof value === 'string') return [{ address: value }]
  if (value && typeof value === 'object' && 'address' in value && typeof value.address === 'string') return [{ address: value.address, name: value.name }]
  throw new Error('Unsupported email address')
}

/** Server-only equivalent of SendMailClient.sendMail, using the Zoho REST API. */
export async function sendZeptoMail(config: MailConfig, message: SendMailOptions) {
  if (!config.token) throw new Error('ZeptoMail token is missing')
  let response: Response
  try {
    response = await fetch('https://cpaas.zoho.com/v1.1/email', {
      method: 'POST',
      headers: {
        Authorization: config.token.startsWith('Zoho-enczapikey ') ? config.token : `Zoho-enczapikey ${config.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: { address: config.from, name: 'Dara-Manihot' },
        to: emailAddresses(message.to).map((email_address) => ({ email_address })),
        reply_to: emailAddresses(message.replyTo),
        subject: message.subject,
        htmlbody: message.html,
        textbody: message.text,
        mime_headers: message.headers,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    const result = await response.json()
    if (response.ok && Array.isArray(result?.data) && result.data.length > 0 && result.data.every((item: { code?: string }) => item?.code === 'EM_104')) return
  } catch {
    // Provider errors may contain credentials, enquiry content or email addresses.
    throw new Error('ZeptoMail request failed or timed out; acceptance is uncertain')
  }
  throw new Error('ZeptoMail did not accept the email')
}
