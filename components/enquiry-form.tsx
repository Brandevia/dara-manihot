'use client'

import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { COMPANY_INFO } from '@/lib/constants'
import {
  EMPTY_ENQUIRY,
  ENQUIRY_LIMITS,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryInput,
  SERVICE_OPTIONS,
  validateEnquiry,
} from '@/lib/enquiry'
import { HONEYPOT_FIELD } from '@/lib/spam'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const FIELD_ORDER: EnquiryField[] = [
  'name',
  'email',
  'phone',
  'service',
  'message',
]
const groups = [...new Set(SERVICE_OPTIONS.map((o) => o.group))]

/** Label, control and message, wired together for screen readers. */
function Field({
  name,
  label,
  required,
  hint,
  error,
  children,
}: {
  name: EnquiryField
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => React.ReactNode
}) {
  const id = `enquiry-${name}`
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            {' '}
            *
          </span>
        ) : (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

export function EnquiryForm() {
  const params = useSearchParams()
  const presetService = params.get('service') ?? ''

  const [values, setValues] = useState<EnquiryInput>(() => ({
    ...EMPTY_ENQUIRY,
    // A deep link from a service card (?service=solar-renewables) pre-selects it.
    service: SERVICE_OPTIONS.some((o) => o.value === presetService)
      ? presetService
      : '',
  }))
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const [reference, setReference] = useState('')
  const [acknowledged, setAcknowledged] = useState(true)
  const [trap, setTrap] = useState('')

  // When the form was shown. The server rejects replies that arrive too fast.
  const startedAt = useRef(0)
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  function setField(field: EnquiryField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    // Clear a field's message as soon as the visitor starts fixing it.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function checkField(field: EnquiryField) {
    const result = validateEnquiry(values)
    setErrors((e) => ({
      ...e,
      [field]: result.ok ? undefined : result.errors[field],
    }))
  }

  function focusFirstInvalid(found: EnquiryErrors) {
    const first = FIELD_ORDER.find((f) => found[f])
    if (first) document.getElementById(`enquiry-${first}`)?.focus()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'submitting') return

    const result = validateEnquiry(values)
    if (!result.ok) {
      setErrors(result.errors)
      setStatus('idle')
      focusFirstInvalid(result.errors)
      return
    }

    setStatus('submitting')
    setServerError('')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          [HONEYPOT_FIELD]: trap,
          startedAt: startedAt.current,
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok && body.ok) {
        setReference(body.reference)
        setAcknowledged(body.acknowledged !== false)
        setStatus('success')
        return
      }
      if (res.status === 422 && body.errors) {
        setErrors(body.errors)
        setStatus('idle')
        focusFirstInvalid(body.errors)
        return
      }
      setServerError(
        body.error ??
          'Something went wrong. Please try again, or email or call us directly.',
      )
      setStatus('error')
    } catch {
      setServerError(
        'We could not reach the server. Please check your connection and try again.',
      )
      setStatus('error')
    }
  }

  function reset() {
    setValues({ ...EMPTY_ENQUIRY })
    setErrors({})
    setServerError('')
    setTrap('')
    setStatus('idle')
    startedAt.current = Date.now()
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        data-testid="enquiry-success"
        className="space-y-4 rounded-xl border border-primary/30 bg-accent p-7 text-accent-foreground outline-none"
      >
        <CheckCircle2 className="size-10 text-secondary" aria-hidden />
        <h3 className="text-2xl">Thank you, we have your enquiry</h3>
        <p>
          {acknowledged
            ? `A confirmation is on its way to ${values.email}. Our team will get back to you as soon as possible.`
            : 'Your enquiry has reached our team. We could not send you a confirmation email, so please double check the address you gave us. We will still get back to you.'}
        </p>
        <p className="text-sm">
          Your reference:{' '}
          <strong data-testid="enquiry-reference">{reference}</strong>
        </p>
        <Button type="button" variant="outline" onClick={reset}>
          Send another enquiry
        </Button>
      </div>
    )
  }

  const busy = status === 'submitting'

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Enquiry form"
      className="space-y-6"
    >
      {status === 'error' && (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden
          />
          <div>
            <p className="font-medium text-destructive">{serverError}</p>
            <p className="mt-1 text-muted-foreground">
              You can also reach us at{' '}
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {COMPANY_INFO.email}
              </a>{' '}
              or{' '}
              <a
                href={`tel:${COMPANY_INFO.phones[0].tel}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {COMPANY_INFO.phones[0].display}
              </a>
              .
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Full name" required error={errors.name}>
          {(a) => (
            <Input
              {...a}
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              maxLength={ENQUIRY_LIMITS.name.max}
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              onBlur={() => values.name && checkField('name')}
            />
          )}
        </Field>
        <Field name="email" label="Email address" required error={errors.email}>
          {(a) => (
            <Input
              {...a}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@company.com"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              onBlur={() => values.email && checkField('email')}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="phone" label="Phone number" error={errors.phone}>
          {(a) => (
            <Input
              {...a}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              value={values.phone}
              onChange={(e) => setField('phone', e.target.value)}
              onBlur={() => values.phone && checkField('phone')}
            />
          )}
        </Field>
        <Field
          name="service"
          label="Service of interest"
          required
          error={errors.service}
        >
          {(a) => (
            <Select
              {...a}
              name="service"
              value={values.service}
              onChange={(e) => setField('service', e.target.value)}
            >
              <option value="">Select a service</option>
              {groups.map((group) => (
                <optgroup key={group} label={group}>
                  {SERVICE_OPTIONS.filter((o) => o.group === group).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field
        name="message"
        label="How can we help?"
        required
        error={errors.message}
        hint={`${values.message.length} / ${ENQUIRY_LIMITS.message.max}`}
      >
        {(a) => (
          <Textarea
            {...a}
            name="message"
            placeholder="Tell us about your project or enquiry…"
            maxLength={ENQUIRY_LIMITS.message.max}
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            onBlur={() => values.message && checkField('message')}
          />
        )}
      </Field>

      {/* Honeypot: invisible to people and assistive tech; bots fill it in. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Leave this field empty
          <input
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </label>
      </div>

      <Button
        type="submit"
        variant="cta"
        size="lg"
        disabled={busy}
        aria-busy={busy}
        className="w-full rounded-full"
      >
        {busy ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send aria-hidden />
            Send enquiry
          </>
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        We only use your details to reply to your enquiry. See our{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}
