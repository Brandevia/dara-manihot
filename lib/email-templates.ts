import { COMPANY_INFO, SITE_URL } from '@/lib/constants'
import { type EnquiryInput, serviceLabel } from '@/lib/enquiry'

/**
 * Branded enquiry emails. Email clients ignore stylesheets and CSS variables,
 * so colours here are literal hex values that mirror the brand tokens in
 * app/globals.css (green #176827, purple #84289a). Layout is table based and
 * inline styled for the same reason. Every visitor supplied value goes
 * through `esc`, so nothing they type can inject markup.
 */

const BRAND = {
  green: '#176827',
  greenDark: '#08280d',
  purple: '#84289a',
  ink: '#16211a',
  slate: '#4f5f54',
  mist: '#f0f5ee',
  line: '#d9e3d8',
  white: '#ffffff',
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}

export interface EmailContext {
  reference: string
  /** ISO timestamp of when the enquiry arrived. */
  receivedAt: string
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/** Subject lines must be single line; the validator already guarantees it. */
const oneLine = (s: string, max = 120) =>
  s.replace(/\s+/g, ' ').trim().slice(0, max)

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.mist};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.mist};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:12px;overflow:hidden;border:1px solid ${BRAND.line};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
<tr><td style="padding:20px 28px;border-bottom:4px solid ${BRAND.green};background:${BRAND.white};">
<img src="${SITE_URL}/images/logo.png" alt="${esc(COMPANY_INFO.name)}" width="140" style="display:block;height:auto;border:0;">
</td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.6;">
${bodyHtml}
</td></tr>
<tr><td style="padding:20px 28px;background:${BRAND.greenDark};color:#c7e4cb;font-size:13px;line-height:1.6;">
<strong style="color:${BRAND.white};">${esc(COMPANY_INFO.name)}</strong><br>
${esc(COMPANY_INFO.address)}<br>
${COMPANY_INFO.phones.map((p) => esc(p.display)).join(' &middot; ')}<br>
<a href="${SITE_URL}" style="color:#c7e4cb;">${esc(SITE_URL.replace(/^https?:\/\//, ''))}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function row(label: string, valueHtml: string): string {
  return `<tr>
<td style="padding:8px 12px 8px 0;color:${BRAND.slate};font-size:14px;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
<td style="padding:8px 0;font-size:15px;vertical-align:top;">${valueHtml}</td>
</tr>`
}

const messageBox = (message: string) =>
  `<div style="margin:8px 0 0;padding:16px;background:${BRAND.mist};border-left:4px solid ${BRAND.purple};border-radius:6px;font-size:15px;white-space:pre-wrap;word-wrap:break-word;">${esc(message)}</div>`

/** Internal notification sent to Dara-Manihot for every enquiry. */
export function renderNotification(
  enquiry: EnquiryInput,
  ctx: EmailContext,
): RenderedEmail {
  const service = serviceLabel(enquiry.service)
  const subject = oneLine(
    `New website enquiry [${ctx.reference}]: ${service} from ${enquiry.name}`,
  )

  const phoneHtml = enquiry.phone
    ? `<a href="tel:${esc(enquiry.phone.replace(/[^\d+]/g, ''))}" style="color:${BRAND.green};">${esc(enquiry.phone)}</a>`
    : `<span style="color:${BRAND.slate};">Not provided</span>`

  const html = shell(
    subject,
    `<h1 style="margin:0 0 4px;font-size:22px;color:${BRAND.green};">New website enquiry</h1>
<p style="margin:0 0 20px;color:${BRAND.slate};font-size:14px;">Reference <strong>${esc(ctx.reference)}</strong> &middot; received ${esc(ctx.receivedAt)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${BRAND.line};border-bottom:1px solid ${BRAND.line};margin-bottom:20px;">
${row('Name', esc(enquiry.name))}
${row('Email', `<a href="mailto:${esc(enquiry.email)}" style="color:${BRAND.green};">${esc(enquiry.email)}</a>`)}
${row('Phone', phoneHtml)}
${row('Service', esc(service))}
</table>
<p style="margin:0;color:${BRAND.slate};font-size:14px;">Message</p>
${messageBox(enquiry.message)}
<p style="margin:24px 0 0;font-size:14px;color:${BRAND.slate};">Reply to this email to answer ${esc(enquiry.name)} directly. A separate automatic acknowledgement is sent to the visitor.</p>`,
  )

  const text = [
    'New website enquiry',
    `Reference: ${ctx.reference}`,
    `Received: ${ctx.receivedAt}`,
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || 'Not provided'}`,
    `Service: ${service}`,
    '',
    'Message:',
    enquiry.message,
    '',
    `Reply to this email to answer ${enquiry.name} directly.`,
  ].join('\n')

  return { subject, html, text }
}

/** Automatic acknowledgement sent to the visitor. */
export function renderAcknowledgement(
  enquiry: EnquiryInput,
  ctx: EmailContext,
): RenderedEmail {
  const service = serviceLabel(enquiry.service)
  const firstName = enquiry.name.split(' ')[0]
  const subject = `We have received your enquiry (ref ${ctx.reference})`

  const html = shell(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.green};">Thank you, ${esc(firstName)}</h1>
<p style="margin:0 0 16px;">We have received your enquiry about <strong>${esc(service)}</strong>. A member of the ${esc(COMPANY_INFO.shortName)} team will get back to you as soon as possible.</p>
<p style="margin:0 0 20px;padding:12px 16px;background:${BRAND.mist};border-radius:6px;font-size:15px;">Your reference: <strong>${esc(ctx.reference)}</strong><br><span style="color:${BRAND.slate};font-size:13px;">Please quote it if you contact us about this enquiry.</span></p>
<p style="margin:0 0 4px;color:${BRAND.slate};font-size:14px;">Your message</p>
${messageBox(enquiry.message)}
<p style="margin:24px 0 4px;">Need us sooner? Call ${COMPANY_INFO.phones.map((p) => `<a href="tel:${p.tel}" style="color:${BRAND.green};">${esc(p.display)}</a>`).join(' or ')} (${esc(COMPANY_INFO.hours)}), or simply reply to this email.</p>
<p style="margin:16px 0 0;color:${BRAND.slate};font-size:13px;">This is an automatic acknowledgement. If you did not make this enquiry, you can ignore this email.</p>`,
  )

  const text = [
    `Thank you, ${firstName}`,
    '',
    `We have received your enquiry about ${service}. A member of the ${COMPANY_INFO.shortName} team will get back to you as soon as possible.`,
    '',
    `Your reference: ${ctx.reference} (please quote it if you contact us about this enquiry)`,
    '',
    'Your message:',
    enquiry.message,
    '',
    `Need us sooner? Call ${COMPANY_INFO.phones.map((p) => p.display).join(' or ')} (${COMPANY_INFO.hours}), or reply to this email.`,
    '',
    'This is an automatic acknowledgement. If you did not make this enquiry, you can ignore this email.',
    '',
    `${COMPANY_INFO.name}, ${COMPANY_INFO.address}`,
  ].join('\n')

  return { subject, html, text }
}
