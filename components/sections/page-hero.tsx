import type { ReactNode } from 'react'

/** Banner at the top of every inner page. */
export function PageHero({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <section className="bg-page-hero-gradient relative isolate overflow-hidden text-canopy-foreground">
      {/* A soft wash of the secondary colour ties the banner to the CTAs. */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-secondary/25 blur-3xl"
      />
      <div className="page-container pt-[calc(var(--header-h)+4rem)] pb-16 sm:pt-[calc(var(--header-h)+5rem)] sm:pb-20 lg:pt-[calc(var(--header-h)+6rem)] lg:pb-24">
        <div className="max-w-3xl">
          <h1 className="animate-rise text-display motion-reduce:animate-none">
            {title}
          </h1>
          <p className="animate-rise animation-delay-150 mt-6 max-w-2xl text-lead text-canopy-foreground/85 motion-reduce:animate-none">
            {description}
          </p>
          {children && (
            <div className="animate-rise animation-delay-300 mt-8 motion-reduce:animate-none">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
