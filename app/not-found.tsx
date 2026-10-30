import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <section className="page-container flex min-h-[50svh] flex-col items-start justify-center pt-[calc(var(--header-h)+var(--section-y))] pb-(--section-y) flex-col items-start justify-center">
      <p className="font-display text-7xl text-primary">404</p>
      <h1 className="mt-4 text-title">This page doesn’t exist</h1>
      <p className="mt-4 max-w-md text-lead text-muted-foreground">
        The link may be out of date, or the address mistyped. Head back to the
        home page and try again.
      </p>
      <Button asChild variant="cta" size="lg" className="mt-8">
        <Link href="/">
          Back to home
          <ArrowRight className="transition-transform group-hover/button:translate-x-1 group-active/button:translate-x-1" />
        </Link>
      </Button>
    </section>
  )
}
