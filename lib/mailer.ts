import nodemailer, { type Transporter } from 'nodemailer'
import { COMPANY_INFO } from '@/lib/constants'
import {
  type EmailContext,
  renderAcknowledgement,
  renderNotification,
} from '@/lib/email-templates'
import type { EnquiryInput } from '@/lib/enquiry'

/**
 * Email delivery for the enquiry workflow, over plain SMTP so it works with
 * any business mailbox (cPanel/webmail, Google Workspace, Zoho, Microsoft 365)
 * and on any Node host. Configuration is environment only; see .env.example
 * and docs/EMAIL-SETUP.md.
 */

export type MailDriver = 'smtp' | 'json'

export interface MailConfig {
  driver: MailDriver
  host?: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  /** Sender of both emails. Must be an address on the domain being sent from. */
  from: string
  /** Where enquiry notifications are delivered. */
  to: string
}

export class MailNotConfiguredError extends Error {
  constructor() {
    super(
      'Email is not configured: set SMTP_HOST, SMTP_USER and SMTP_PASS (see .env.example).',
    )
    this.name = 'MailNotConfiguredError'
  }
}

type Env = Record<string, string | undefined>

/** Returns null when the SMTP settings are incomplete. */
export function readMailConfig(env: Env = process.env): MailConfig | null {
  const to = env.ENQUIRY_TO?.trim() || COMPANY_INFO.email
  const port = Number(env.SMTP_PORT) || 465

  // "json" builds the message but sends nothing. For staging smoke tests and
  // automated tests only; enquiries would be silently dropped in production.
  if (env.MAIL_DRIVER === 'json') {
    return {
      driver: 'json',
      port,
      secure: false,
      from: env.MAIL_FROM?.trim() || `"${COMPANY_INFO.shortName}" <${to}>`,
      to,
    }
  }

  const host = env.SMTP_HOST?.trim()
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS
  if (!host || !user || !pass) return null

  return {
    driver: 'smtp',
    host,
    port,
    // Port 465 is implicit TLS; 587 upgrades with STARTTLS (secure: false).
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    user,
    pass,
    from: env.MAIL_FROM?.trim() || `"${COMPANY_INFO.shortName}" <${user}>`,
    to,
  }
}

export function createTransport(config: MailConfig): Transporter {
  if (config.driver === 'json') {
    return nodemailer.createTransport({ jsonTransport: true })
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // Fail fast: the visitor is waiting on this request.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
}

export interface SendResult {
  /** The internal notification was accepted by the mail server. */
  notified: true
  /** The visitor's acknowledgement was accepted (false if it failed). */
  acknowledged: boolean
}

export interface SendDeps {
  config?: MailConfig | null
  transport?: Transporter
}

/**
 * Sends the internal notification, then the visitor acknowledgement.
 *
 * The notification is the system of record for an enquiry, so if it fails the
 * error propagates and the caller tells the visitor to use another channel.
 * The acknowledgement is a courtesy: if it fails (typo'd address, bounce) the
 * enquiry is still safely with Dara-Manihot, so the failure is logged and
 * reported as `acknowledged: false`.
 */
export async function sendEnquiryEmails(
  enquiry: EnquiryInput,
  ctx: EmailContext,
  deps: SendDeps = {},
): Promise<SendResult> {
  const config = deps.config === undefined ? readMailConfig() : deps.config
  if (!config) throw new MailNotConfiguredError()
  const transport = deps.transport ?? createTransport(config)

  const notification = renderNotification(enquiry, ctx)
  await transport.sendMail({
    from: config.from,
    to: config.to,
    replyTo: { name: enquiry.name, address: enquiry.email },
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
    headers: { 'X-Enquiry-Reference': ctx.reference },
  })

  const ack = renderAcknowledgement(enquiry, ctx)
  try {
    await transport.sendMail({
      from: config.from,
      to: { name: enquiry.name, address: enquiry.email },
      replyTo: config.to,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      headers: {
        'X-Enquiry-Reference': ctx.reference,
        // Stops out-of-office replies and other robots from answering us.
        'Auto-Submitted': 'auto-replied',
        'X-Auto-Response-Suppress': 'All',
      },
    })
    return { notified: true, acknowledged: true }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'enquiry.ack_failed',
        reference: ctx.reference,
        error: error instanceof Error ? error.message : String(error),
      }),
    )
    return { notified: true, acknowledged: false }
  }
}
