import type * as React from 'react'

import { fieldClass } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldClass,
        'min-h-36 resize-y py-3 leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
