import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { MotionProvider } from '@/components/animations'
import { BackToTop } from '@/components/back-to-top'
import { Footer } from '@/components/footer'
import { SiteHeader } from '@/components/site-header'

// Self-hosted (see app/fonts/README.md): no build-time request to Google.
const youngSerif = localFont({
  src: './fonts/young-serif-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-young-serif',
  display: 'swap',
})

const figtree = localFont({
  src: './fonts/figtree-latin-wght-normal.woff2',
  weight: '300 900',
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:
      'Dara-Manihot Industries & Farms - Sustainable Agriculture & Clean Energy',
    template: '%s | Dara-Manihot',
  },
  description:
    'Transforming Agriculture and Industry through Clean Technologies, Circular Economy, Renewable Energy, and Green Hydrogen Solutions in Nigeria and West Africa.',
  // Emits <meta name="author"> and <link rel="author" href="/humans.txt">.
  authors: [{ name: 'Sodeke Pamilerin', url: '/humans.txt' }],
}

export const viewport: Viewport = {
  // Browser-chrome colour; a meta tag cannot read CSS variables, so this
  // mirrors --brand-green-700 in app/globals.css.
  themeColor: '#176827',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${figtree.variable}`}>
      <head>
        {/* Scroll reveals start hidden; without JS they would stay hidden. */}
        <noscript>
          <style>
            {'[data-reveal]{opacity:1!important;transform:none!important}'}
          </style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </MotionProvider>
      </body>
    </html>
  )
}
