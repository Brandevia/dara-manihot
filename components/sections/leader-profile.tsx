import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/animations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSummitDate, LEADER, SUMMIT } from '@/lib/summit'

const FOCUS = [
  'Solar and storage',
  'Zero-CAPEX financing',
  'Green hydrogen',
] as const

/**
 * The CEO, on the About page. The portrait sits in a mint frame: the frame's
 * radius is the photo's radius plus the padding (20px + 12px = 32px), so the
 * two curves stay concentric. The photo is a speaking shot from the summit and
 * is cropped to a portrait; swap `LEADER.photo` for a studio portrait when
 * one exists, nothing else needs to change.
 */
export function LeaderProfile() {
  const { photo } = LEADER
  return (
    <section
      id="leadership"
      aria-labelledby="leader-title"
      className="scroll-mt-header pb-[var(--section-y)]"
    >
      <div className="page-container grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="rounded-[2rem] bg-mint p-3">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 440px, (min-width: 384px) 384px, 100vw"
              style={{ objectPosition: photo.position }}
              className="aspect-[4/5] w-full rounded-2xl object-cover outline -outline-offset-1 outline-black/10"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Leadership
          </p>
          <h2 id="leader-title" className="mt-3 text-title">
            {LEADER.honorific} {LEADER.name}
          </h2>
          <p className="mt-2 text-lg font-medium text-primary">
            {LEADER.title}, {LEADER.company}
          </p>

          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              On {formatSummitDate(SUMMIT.date)}, {LEADER.name} presented
              Dara-Manihot’s roadmap for clean, competitive manufacturing at the{' '}
              {SUMMIT.name} in Ado-Ekiti, speaking alongside researchers,
              regulators and industry leaders.
            </p>
            <p>
              His talk, “{SUMMIT.talkTitle}”, set out how factories can cut
              power costs from day one and grow into green hydrogen.
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {FOCUS.map((item) => (
              <li key={item}>
                <Badge variant="soft" className="px-3 py-1 text-sm">
                  {item}
                </Badge>
              </li>
            ))}
          </ul>

          <Button asChild variant="cta" size="lg" className="mt-8 rounded-full">
            <Link href={SUMMIT.href}>
              Read about the talk
              <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
