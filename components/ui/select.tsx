import { ChevronDown } from 'lucide-react'
import type * as React from 'react'

import { fieldClass } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Native <select> on purpose: phones show their own picker, which is far
 * easier to use than a custom dropdown (scope 4.4: form easy to complete on
 * mobile).
 */
function Select({
  className,
  children,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(fieldClass, 'h-12 appearance-none pr-11', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

export { Select }
