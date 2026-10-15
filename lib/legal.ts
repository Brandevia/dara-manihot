import { COMPANY_INFO } from '@/lib/constants'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: readonly string[] }

export interface LegalSection {
  id: string
  title: string
  blocks: readonly LegalBlock[]
}

const p = (text: string): LegalBlock => ({ type: 'p', text })
const ul = (...items: string[]): LegalBlock => ({ type: 'ul', items })

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    blocks: [
      p(
        `${COMPANY_INFO.name} ("we", "us", "our") operates this website. We are a Nigerian enterprise working in sustainable agriculture, renewable energy and clean technologies. For the purposes of the Nigeria Data Protection Act, 2023 (NDPA), we are the data controller for personal data collected through this website.`,
      ),
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    blocks: [
      p(
        'This website has no accounts or payment features. We collect personal data in three ways only.',
      ),
      p(
        'Information you give us. If you email or call us, we receive the details you choose to share, such as your name, email address, phone number, organisation and the content of your message.',
      ),
      p(
        'Our enquiry form. When you submit the enquiry form on our Contact page, we receive your name, email address, phone number (optional), the service you are interested in and your message. We email these details to our team and send an automatic acknowledgement to the address you gave us. Each enquiry is given a reference number.',
      ),
      p(
        'Technical information. Like most websites, our hosting provider automatically records standard server logs when you visit: your IP address, browser and device type, the pages requested, and the date and time of the request. To protect the enquiry form from automated spam, we also check how quickly it was completed and keep a short lived count of submissions per IP address in the memory of the web server. That count is not stored permanently.',
      ),
      p(
        'At the time of writing, this website does not set cookies and does not use third-party analytics or advertising trackers. Fonts and images are served from our own domain.',
      ),
    ],
  },
  {
    id: 'how-we-use-it',
    title: 'How we use your information',
    blocks: [
      ul(
        'To respond to your enquiries and discuss projects, partnerships or training.',
        'To send you an automatic acknowledgement and reference number when you submit the enquiry form.',
        'To keep the website secure, diagnose faults and prevent abuse.',
        'To meet our legal and regulatory obligations.',
      ),
      p(
        'We do not sell your personal data, and we do not use it for automated decision-making or profiling.',
      ),
    ],
  },
  {
    id: 'lawful-basis',
    title: 'Lawful basis',
    blocks: [
      p(
        'We process personal data under one or more of these lawful bases in the NDPA:',
      ),
      ul(
        'Consent, when you contact us and ask us to respond.',
        'Our legitimate interests in operating, securing and improving the website, balanced against your rights.',
        'Legal obligation, where the law requires us to keep or disclose information.',
      ),
    ],
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    blocks: [
      p('We share personal data only where necessary, with:'),
      ul(
        'Service providers who host and deliver the website, and who process data on our instructions.',
        'Our email service provider, which delivers enquiry notifications to our team and acknowledgements to you.',
        'Professional advisers, such as lawyers and accountants, under duties of confidentiality.',
        'Courts, regulators or law-enforcement bodies when we are legally required to.',
      ),
    ],
  },
  {
    id: 'international-transfers',
    title: 'International transfers',
    blocks: [
      p(
        'Our hosting provider may process server logs on infrastructure outside Nigeria. Where personal data leaves Nigeria, we take steps to ensure it remains protected to the standard the NDPA requires.',
      ),
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    blocks: [
      p(
        'We keep correspondence for as long as needed to deal with your enquiry and any resulting relationship, and for a reasonable period afterwards. Enquiry form submissions are not kept in a separate database; they are held as emails in our mailbox. Server logs are retained by our hosting provider for a short, limited period. We delete or anonymise personal data we no longer need.',
      ),
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blocks: [
      p(
        'We use reasonable technical and organisational measures to protect personal data, including encrypted (HTTPS) connections to this website. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.',
      ),
    ],
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    blocks: [
      p('Under the NDPA you have the right to:'),
      ul(
        'Ask whether we hold personal data about you, and obtain a copy.',
        'Have inaccurate or incomplete data corrected.',
        'Have your data erased, or its processing restricted, in the circumstances the law provides.',
        'Object to processing based on our legitimate interests.',
        'Receive your data in a portable format where applicable.',
        'Withdraw consent at any time, without affecting processing already carried out.',
      ),
      p(
        `To exercise any of these rights, contact us at ${COMPANY_INFO.email}. You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC).`,
      ),
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    blocks: [
      p(
        'We do not currently use cookies on this website. If that changes, we will update this policy and, where required, ask for your consent first.',
      ),
    ],
  },
  {
    id: 'third-party-links',
    title: 'Links to other websites',
    blocks: [
      p(
        'This website links to third-party sites, including social media profiles. We are not responsible for their content or privacy practices, and we encourage you to read their policies.',
      ),
    ],
  },
  {
    id: 'children',
    title: "Children's privacy",
    blocks: [
      p(
        'This website is intended for businesses, organisations and adults. We do not knowingly collect personal data from children. If you believe a child has sent us personal data, contact us and we will delete it.',
      ),
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    blocks: [
      p(
        'We may update this policy from time to time. The "Last updated" date at the top of this page shows when it last changed. Continued use of the website after an update means you accept the revised policy.',
      ),
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    blocks: [
      p(
        `Questions about this policy or your personal data? Email ${COMPANY_INFO.email}, call ${COMPANY_INFO.phones[0].display}, or write to us at ${COMPANY_INFO.address}.`,
      ),
    ],
  },
]

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    blocks: [
      p(
        `By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use the website. These terms apply to ${COMPANY_INFO.name} ("we", "us", "our") and to everyone who visits the site.`,
      ),
    ],
  },
  {
    id: 'about-the-site',
    title: 'About this website',
    blocks: [
      p(
        'This website describes our company, services and projects. It does not offer online purchases, user accounts or binding quotations. Any engagement with us is governed by a separate written agreement.',
      ),
    ],
  },
  {
    id: 'information-not-advice',
    title: 'Information, not professional advice',
    blocks: [
      p(
        'Content on this website is general information about our work and about sustainable agriculture and clean energy. It is not engineering, financial, legal or regulatory advice, and you should not rely on it as a substitute for professional advice specific to your situation. Project figures, targets and timelines describe our goals and experience and are not guarantees of future results.',
      ),
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    blocks: [
      p(
        'The text, logos, graphics, images and design of this website belong to us or our licensors and are protected by Nigerian and international intellectual property laws. You may view and share pages for personal or internal business reference. You may not copy, modify, distribute or commercially exploit the content without our prior written permission.',
      ),
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    blocks: [
      p('When using this website you agree not to:'),
      ul(
        'Break any applicable law or regulation.',
        'Attempt to gain unauthorised access to the website, its servers or related systems.',
        'Introduce malware, or interfere with or disrupt the website.',
        'Use automated tools to scrape or overload the website in a way that harms its operation.',
        'Impersonate us or misrepresent your relationship with us.',
      ),
    ],
  },
  {
    id: 'third-party-links',
    title: 'Third-party links',
    blocks: [
      p(
        'The website may link to external sites that we do not control. A link is not an endorsement, and we are not responsible for the content, availability or practices of those sites.',
      ),
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer of warranties',
    blocks: [
      p(
        'We work to keep the information on this website accurate and the site available, but both are provided "as is" and "as available". To the fullest extent permitted by law, we make no warranty that the website will be uninterrupted, error-free or free of harmful components, or that its content is complete or current.',
      ),
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    blocks: [
      p(
        'To the fullest extent permitted by Nigerian law, we are not liable for any indirect, incidental or consequential loss arising from your use of, or inability to use, this website or from reliance on its content. Nothing in these terms excludes liability that cannot lawfully be excluded.',
      ),
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    blocks: [
      p(
        'How we handle personal data is described in our Privacy Policy, which forms part of these terms.',
      ),
    ],
  },
  {
    id: 'changes',
    title: 'Changes to the website and these terms',
    blocks: [
      p(
        'We may change, suspend or remove any part of the website at any time. We may also update these terms; the "Last updated" date shows the latest version. Continued use of the website after a change means you accept the updated terms.',
      ),
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    blocks: [
      p(
        'These terms are governed by the laws of the Federal Republic of Nigeria. The courts of Lagos State have jurisdiction over any dispute arising from them, without prejudice to any mandatory rights you have under applicable law.',
      ),
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    blocks: [
      p(
        `Questions about these terms? Email ${COMPANY_INFO.email}, call ${COMPANY_INFO.phones[0].display}, or write to us at ${COMPANY_INFO.address}.`,
      ),
    ],
  },
]
