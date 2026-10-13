'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * shadcn/ui Sheet, customised: it only opens from the right, and uses the
 * bounce keyframes defined in app/globals.css (`drawer-in` / `drawer-out`).
 * Radix keeps the panel mounted until its exit animation finishes.
 */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>,
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>,
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-canopy/60 backdrop-blur-[2px]',
        'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
        'motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'drawer-panel fixed inset-y-0 right-0 z-50 flex h-full flex-col bg-background shadow-float outline-none',
          'data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out',
          'motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          data-slot="sheet-close"
          className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-200 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
        >
          <XIcon className="size-5" />
          <span className="sr-only">Close menu</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-5', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-5', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-display text-lg text-foreground', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
