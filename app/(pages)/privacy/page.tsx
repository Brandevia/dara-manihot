import type { Metadata } from 'next'
import { LegalDocument } from '@/components/sections/legal-document'
import { PRIVACY_SECTIONS } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Dara-Manihot Industries & Farms collects, uses and protects personal data on this website, and the rights you have under Nigerian law.',
}

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro="What personal data this website collects, why, and the rights you have over it."
      sections={PRIVACY_SECTIONS}
    />
  )
}
