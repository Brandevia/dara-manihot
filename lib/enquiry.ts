import { PILLARS, SERVICES } from '@/lib/services'

/**
 * Enquiry form contract, shared by the browser form and the API route so the
 * two can never disagree about what is valid.
 */

export interface EnquiryInput {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

export type EnquiryField = keyof EnquiryInput
export type EnquiryErrors = Partial<Record<EnquiryField, string>>

export type EnquiryResult =
  | { ok: true; data: EnquiryInput }
  | { ok: false; errors: EnquiryErrors }

export const ENQUIRY_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { minDigits: 7, maxDigits: 15 },
  message: { min: 10, max: 2000 },
} as const

export const GENERAL_ENQUIRY = 'general'

export interface ServiceOption {
  value: string
  label: string
  /** Pillar heading used for the <optgroup>. */
  group: string
}

export const SERVICE_OPTIONS: readonly ServiceOption[] = [
  { value: GENERAL_ENQUIRY, label: 'General enquiry', group: 'General' },
  ...SERVICES.map((s) => ({
    value: s.id,
    label: s.title,
    group: PILLARS.find((p) => p.id === s.pillar)?.title ?? 'Services',
  })),
]

export function serviceLabel(value: string): string {
  return SERVICE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export const EMPTY_ENQUIRY: EnquiryInput = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
}

// Control characters other than tab and newline. Stripped, never trusted.
// biome-ignore lint/suspicious/noControlCharactersInRegex: the point is to match and remove control characters
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

// Practical address check (HTML living standard shape, but requiring a dot in
// the domain). Rejects spaces, commas and newlines, so it also blocks header
// injection through the email field.
const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/

const PHONE_CHARS = /^\+?\s?[0-9(][0-9\s().-]*$/

const asText = (v: unknown): string => (typeof v === 'string' ? v : '')

/** Trim and clean the raw values. Does not judge validity. */
export function normalizeEnquiry(raw: unknown): EnquiryInput {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >
  const singleLine = (v: unknown) =>
    asText(v).replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim()
  return {
    name: singleLine(obj.name),
    email: singleLine(obj.email).toLowerCase(),
    phone: singleLine(obj.phone),
    service: singleLine(obj.service),
    message: asText(obj.message)
      .replace(/\r\n?/g, '\n')
      .replace(CONTROL_CHARS, '')
      .trim(),
  }
}

export function validateEnquiry(raw: unknown): EnquiryResult {
  const data = normalizeEnquiry(raw)
  const errors: EnquiryErrors = {}

  if (!data.name) errors.name = 'Please enter your name.'
  else if (data.name.length < ENQUIRY_LIMITS.name.min)
    errors.name = 'Your name looks too short.'
  else if (data.name.length > ENQUIRY_LIMITS.name.max)
    errors.name = `Please keep your name under ${ENQUIRY_LIMITS.name.max} characters.`

  if (!data.email) errors.email = 'Please enter your email address.'
  else if (
    data.email.length > ENQUIRY_LIMITS.email.max ||
    !EMAIL.test(data.email)
  )
    errors.email = 'Please enter a valid email address, like name@example.com.'

  // Optional, but if given it has to look like a phone number.
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, '').length
    if (
      !PHONE_CHARS.test(data.phone) ||
      digits < ENQUIRY_LIMITS.phone.minDigits ||
      digits > ENQUIRY_LIMITS.phone.maxDigits
    )
      errors.phone =
        'Please enter a valid phone number, like +234 802 000 0000.'
  }

  if (!data.service) errors.service = 'Please choose a service.'
  else if (!SERVICE_OPTIONS.some((o) => o.value === data.service))
    errors.service = 'Please choose a service from the list.'

  if (!data.message) errors.message = 'Please tell us how we can help.'
  else if (data.message.length < ENQUIRY_LIMITS.message.min)
    errors.message = 'Please add a little more detail so we can help.'
  else if (data.message.length > ENQUIRY_LIMITS.message.max)
    errors.message = `Please keep your message under ${ENQUIRY_LIMITS.message.max} characters.`

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, data }
}
