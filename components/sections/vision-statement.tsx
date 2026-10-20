import { Reveal } from '@/components/animations'

/**
 * The company vision as one large centred statement on the page background,
 * with its label underneath. Sits on white so nothing dark ends the page
 * before the closing call-to-action.
 */
export function VisionStatement() {
  return (
    <section aria-labelledby="vision-title" className="section-y">
      <div className="page-container">
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="font-display text-canopy text-statement text-balance">
            We envision an Africa where farms and factories thrive with clean,
            affordable energy; agricultural waste becomes a resource, not a
            burden; and farmers and entrepreneurs gain the tools to lead in a
            climate-smart economy. At Dara-Manihot, we are proud to stand at the
            forefront of this transformation.
          </p>
          <h2
            id="vision-title"
            className="mt-10 font-sans text-lg font-normal text-primary"
          >
            Our vision
          </h2>
        </Reveal>
      </div>
    </section>
  )
}
