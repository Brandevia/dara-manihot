import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/animations'
import { CountUp } from '@/components/count-up'
import { PhotoSlot } from '@/components/photo-slot'
import { formatProjectDate, type Project } from '@/lib/projects'

const labelClass =
  'text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase'

/**
 * One project, laid out as a feature: a large title, its date, the write-up
 * and an "Ask about project" link on the left; status, goal and impact down
 * the right; the project photo full width underneath.
 *
 * On the project's own page (`asPage`) the title is the page's h1 and the
 * link back to that same page is left out.
 */
export function ProjectFeature({
  project,
  asPage = false,
}: {
  project: Project
  asPage?: boolean
}) {
  const Heading = asPage ? 'h1' : 'h2'
  const titleId = `${project.slug}-title`

  return (
    <article aria-labelledby={titleId}>
      <div className="grid gap-10 lg:grid-cols-[1fr_16rem] lg:gap-16">
        <Reveal>
          <Heading id={titleId} className="max-w-4xl text-display text-canopy">
            {project.title}
          </Heading>
          {project.date && (
            <p className="mt-8">
              <time
                dateTime={project.date}
                className="inline-block rounded-md bg-secondary-soft px-2.5 py-1.5 text-xs font-semibold tracking-wide text-secondary uppercase"
              >
                {formatProjectDate(project.date)}
              </time>
            </p>
          )}
          <div className="mt-6 max-w-3xl space-y-4 leading-relaxed text-muted-foreground">
            <p>{project.description}</p>
            <p>{project.details}</p>
          </div>
          {!asPage && (
            <Link
              href={`/projects/${project.slug}`}
              className="group/ask mt-8 inline-flex items-center gap-2 rounded-sm font-medium text-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Ask about project
              <span className="sr-only"> {project.title}</span>
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover/ask:translate-x-0.5 group-hover/ask:-translate-y-0.5 group-active/ask:translate-x-0.5 group-active/ask:-translate-y-0.5"
              />
            </Link>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="space-y-6 lg:pt-3">
            <div>
              <dt className={labelClass}>Status</dt>
              <dd className="mt-1 text-lg font-medium">{project.status}</dd>
            </div>
            <div>
              <dt className={labelClass}>Goal</dt>
              <dd className="mt-1 text-lg font-medium">{project.goal}</dd>
            </div>
            {/* Only shown when there is an impact figure to claim. */}
            {project.impact && (
              <div>
                <dt className={labelClass}>Impact</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CountUp value={project.impact} />
                </dd>
              </div>
            )}
          </dl>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-12">
        <PhotoSlot
          id={project.photo}
          sizes="(min-width: 1280px) 1216px, 100vw"
          priority={asPage}
          className="aspect-[16/8] rounded-xl"
        />
      </Reveal>
    </article>
  )
}
