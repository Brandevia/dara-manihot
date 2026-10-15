import { describe, expect, it } from 'vitest'
import {
  ENQUIRY_LIMITS,
  GENERAL_ENQUIRY,
  normalizeEnquiry,
  SERVICE_OPTIONS,
  serviceLabel,
  validateEnquiry,
} from '@/lib/enquiry'
import { SERVICES } from '@/lib/services'

const valid = {
  name: 'Ada Okafor',
  email: 'ada@example.com',
  phone: '+234 802 340 0557',
  service: 'solar-renewables',
  message: 'We would like a solar quote for our cassava mill.',
}

const errorsOf = (input: unknown) => {
  const result = validateEnquiry(input)
  return result.ok ? {} : result.errors
}

describe('validateEnquiry: accepts good input', () => {
  it('returns the cleaned data', () => {
    const result = validateEnquiry(valid)
    expect(result).toEqual({ ok: true, data: valid })
  })

  it('trims, collapses whitespace and lowercases the email', () => {
    const result = validateEnquiry({
      ...valid,
      name: '  Ada   Okafor ',
      email: '  ADA@Example.COM ',
    })
    expect(result.ok && result.data.name).toBe('Ada Okafor')
    expect(result.ok && result.data.email).toBe('ada@example.com')
  })

  it('treats phone as optional', () => {
    expect(validateEnquiry({ ...valid, phone: '' }).ok).toBe(true)
  })

  it.each(['general', ...SERVICES.map((s) => s.id)])(
    'accepts service %s',
    (service) => {
      expect(validateEnquiry({ ...valid, service }).ok).toBe(true)
    },
  )
})

describe('validateEnquiry: required fields (scope 4.5)', () => {
  it.each(['name', 'email', 'service', 'message'] as const)(
    '%s is required',
    (field) => {
      expect(errorsOf({ ...valid, [field]: '' })[field]).toBeTruthy()
      expect(errorsOf({ ...valid, [field]: '   ' })[field]).toBeTruthy()
    },
  )

  it('reports every missing field at once', () => {
    expect(Object.keys(errorsOf({})).sort()).toEqual([
      'email',
      'message',
      'name',
      'service',
    ])
  })

  it.each([null, undefined, 'text', 42, []])(
    'survives non object input %s',
    (input) => {
      expect(validateEnquiry(input).ok).toBe(false)
    },
  )

  it('ignores non string values rather than coercing them', () => {
    expect(errorsOf({ ...valid, name: 12345 }).name).toBeTruthy()
    expect(
      errorsOf({ ...valid, message: { toString: () => 'x'.repeat(50) } })
        .message,
    ).toBeTruthy()
  })
})

describe('validateEnquiry: email format (scope 4.5)', () => {
  it.each([
    'plain',
    'a@b',
    'a@b.',
    '@example.com',
    'a b@example.com',
    'a@exa mple.com',
    'a@@example.com',
    'a@example..com',
    'a,b@example.com',
    // Header injection attempts: must never reach an email header.
    'a@example.com\nBcc: victim@example.com',
    'a@example.com\r\nSubject: hacked',
    'a@example.com, victim@example.com',
  ])('rejects %j', (email) => {
    expect(errorsOf({ ...valid, email }).email).toBeTruthy()
  })

  it.each([
    'a@example.com',
    'first.last@sub.example.com.ng',
    'a+tag@example.co',
    "o'brien@example.com",
  ])('accepts %s', (email) => {
    expect(errorsOf({ ...valid, email }).email).toBeUndefined()
  })

  it('rejects addresses over 254 characters', () => {
    const long = `${'a'.repeat(250)}@example.com`
    expect(errorsOf({ ...valid, email: long }).email).toBeTruthy()
  })
})

describe('validateEnquiry: phone', () => {
  it.each([
    '+234 802 340 0557',
    '08023400557',
    '(0802) 340-0557',
    '+2348023400557',
  ])('accepts %s', (phone) => {
    expect(errorsOf({ ...valid, phone }).phone).toBeUndefined()
  })
  it.each([
    'call me',
    '12345',
    '+1234567890123456',
    '080-ABC-0557',
    '++2348023400557',
  ])('rejects %s', (phone) => {
    expect(errorsOf({ ...valid, phone }).phone).toBeTruthy()
  })
})

describe('validateEnquiry: lengths and cleaning', () => {
  it('enforces name bounds', () => {
    expect(errorsOf({ ...valid, name: 'A' }).name).toBeTruthy()
    expect(
      errorsOf({ ...valid, name: 'A'.repeat(ENQUIRY_LIMITS.name.max + 1) })
        .name,
    ).toBeTruthy()
    expect(
      errorsOf({ ...valid, name: 'A'.repeat(ENQUIRY_LIMITS.name.max) }).name,
    ).toBeUndefined()
  })

  it('enforces message bounds', () => {
    expect(errorsOf({ ...valid, message: 'too short' }).message).toBeTruthy()
    expect(
      errorsOf({
        ...valid,
        message: 'x'.repeat(ENQUIRY_LIMITS.message.max + 1),
      }).message,
    ).toBeTruthy()
    expect(
      errorsOf({ ...valid, message: 'x'.repeat(ENQUIRY_LIMITS.message.max) })
        .message,
    ).toBeUndefined()
  })

  it('keeps line breaks in the message but normalises CRLF', () => {
    const result = normalizeEnquiry({
      ...valid,
      message: 'line one\r\nline two\rline three',
    })
    expect(result.message).toBe('line one\nline two\nline three')
  })

  it('strips control characters from every field', () => {
    const result = normalizeEnquiry({
      ...valid,
      name: 'Ada\u0000 Okafor',
      message: 'Hello\u0007 there\u001b friends',
    })
    expect(result.name).toBe('Ada Okafor')
    expect(result.message).toBe('Hello there friends')
  })

  it('flattens newlines in single line fields so they cannot break headers', () => {
    expect(normalizeEnquiry({ ...valid, name: 'Ada\nBcc: x@y.com' }).name).toBe(
      'Ada Bcc: x@y.com',
    )
  })
})

describe('service options', () => {
  it('offers a general enquiry plus every service', () => {
    const values = SERVICE_OPTIONS.map((o) => o.value)
    expect(values).toContain(GENERAL_ENQUIRY)
    for (const s of SERVICES) expect(values).toContain(s.id)
    expect(new Set(values).size).toBe(values.length)
  })

  it('has human labels, falling back to the raw value', () => {
    expect(serviceLabel('solar-renewables')).toBe(
      'Solar PV & Renewable Energy Solutions',
    )
    expect(serviceLabel('general')).toBe('General enquiry')
    expect(serviceLabel('mystery')).toBe('mystery')
  })

  it('rejects a service that is not on the list', () => {
    expect(errorsOf({ ...valid, service: 'free-money' }).service).toBeTruthy()
  })
})
