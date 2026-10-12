import type { ReactNode } from 'react'
import { Reveal } from '@/components/animations'

/** Closing call-to-action band. Put CTA buttons in `children`. */
export function CtaBand({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="bg-band-gradient section-y text-canopy-foreground">
      <div className="page-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-title">{title}</h2>
          <p className="mt-5 text-lead text-canopy-foreground/85">
            {description}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
