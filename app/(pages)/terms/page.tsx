import type { Metadata } from 'next'
import { LegalDocument } from '@/components/sections/legal-document'
import { TERMS_SECTIONS } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that apply when you use the Dara-Manihot Industries & Farms website.',
}

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro="The rules for using this website. Please read them before you continue."
      sections={TERMS_SECTIONS}
    />
  )
}
