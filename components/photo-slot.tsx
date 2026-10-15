import {
  Building2,
  Cpu,
  HeartHandshake,
  type LucideIcon,
  Sprout,
  Users,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import {
  getPhotoSlot,
  type PhotoCategory,
  type PhotoSlotId,
} from '@/lib/imagery'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<PhotoCategory, LucideIcon> = {
  people: Users,
  field: Sprout,
  energy: Zap,
  technology: Cpu,
  community: HeartHandshake,
  project: Building2,
}

/**
 * One image from the manifest in lib/imagery.ts. With a `src` it renders the
 * photo; without one, a branded panel, so a missing photo never leaves a hole
 * or a broken image. Set NEXT_PUBLIC_SHOW_PHOTO_SLOTS=true on staging to print
 * the photo brief inside each empty panel (useful in client review).
 */
export function PhotoSlot({
  id,
  sizes = '(min-width: 1024px) 560px, 100vw',
  priority = false,
  className,
}: {
  id: PhotoSlotId
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const slot = getPhotoSlot(id)
  const Icon = CATEGORY_ICONS[slot.category]
  const showBrief = process.env.NEXT_PUBLIC_SHOW_PHOTO_SLOTS === 'true'

  return (
    <div
      data-photo-slot={slot.id}
      className={cn(
        'relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-muted',
        className,
      )}
    >
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: slot.position }}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden={!showBrief}
          className="bg-page-hero-gradient flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-canopy-foreground"
        >
          <Icon className="size-10 text-canopy-muted" aria-hidden />
          {showBrief && (
            <p className="max-w-xs text-sm text-canopy-muted">
              Photo needed: {slot.brief}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
