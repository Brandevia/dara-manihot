import { Reveal } from '@/components/animations'
import { cn } from '@/lib/utils'

export function SectionHeading({
  id,
  title,
  description,
  align = 'left',
  className,
}: {
  /** Set when a parent <section> names itself with aria-labelledby. */
  id?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'mb-12 max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <h2 id={id} className="text-title text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lead text-muted-foreground">{description}</p>
      )}
    </Reveal>
  )
}
