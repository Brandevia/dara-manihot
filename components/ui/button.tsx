import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        // The site's call-to-action: always the secondary colour.
        cta: 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-inset ring-white/25 hover:bg-secondary-hover hover:shadow-float',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        // Outline for use on photography or deep-green surfaces.
        onDark:
          'border border-white/45 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20',
        secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/15',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        leaf: 'bg-leaf text-leaf-foreground shadow-sm ring-1 ring-inset ring-white/25 hover:bg-leaf-hover hover:shadow-float',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-md px-7 text-base has-[>svg]:px-5',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
