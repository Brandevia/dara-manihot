import type * as React from 'react'

import { cn } from '@/lib/utils'

// text-base (16px) stops iOS Safari zooming the page when a field is focused.
export const fieldClass =
  'w-full rounded-md border border-input bg-background px-3.5 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50'

function Input({
  className,
  type = 'text',
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldClass, 'h-12', className)}
      {...props}
    />
  )
}

export { Input }
