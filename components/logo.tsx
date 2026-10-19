import Image from 'next/image'
import { COMPANY_INFO } from '@/lib/constants'
import { cn } from '@/lib/utils'

// logo.png is 560x330. The wordmark is part of the image, so there is no
// separate text label next to it.
export function Logo({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/images/logo.png"
      alt={`${COMPANY_INFO.name} logo`}
      width={560}
      height={330}
      priority={priority}
      sizes="160px"
      className={cn('h-12 w-auto', className)}
    />
  )
}
