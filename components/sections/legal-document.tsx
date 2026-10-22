import { PageHero } from '@/components/sections/page-hero'
import { LEGAL_LAST_UPDATED, PAGE_HERO_IMAGES } from '@/lib/constants'
import type { LegalSection } from '@/lib/legal'

/** Shared layout for the Privacy Policy and Terms of Service pages. */
export function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: readonly LegalSection[]
}) {
  return (
    <>
      <PageHero
        title={title}
        description={intro}
        image={PAGE_HERO_IMAGES.legal}
      >
        <p className="text-sm text-canopy-muted">
          Last updated: <time>{LEGAL_LAST_UPDATED}</time>
        </p>
      </PageHero>

      <div className="page-container section-y grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label={`${title} contents`}
          className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start"
        >
          <h2 className="mb-3 font-display text-lg">Contents</h2>
          <ol className="space-y-1 border-l border-border">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground"
                >
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-header border-b border-border py-8 first:pt-0 last:border-b-0"
            >
              <h2
                id={`${section.id}-title`}
                className="text-2xl text-foreground"
              >
                {i + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-4 leading-7 text-foreground/85">
                {section.blocks.map((block, j) =>
                  block.type === 'p' ? (
                    <p key={j}>{block.text}</p>
                  ) : (
                    <ul
                      key={j}
                      className="list-disc space-y-2 pl-6 marker:text-primary"
                    >
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  )
}
