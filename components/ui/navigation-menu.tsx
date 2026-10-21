'use client'

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * shadcn/ui NavigationMenu, trimmed to what the site uses: a flat list of
 * links (no dropdown content or viewport).
 */
function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn('relative flex max-w-max flex-1 items-center', className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('flex flex-1 list-none items-center gap-1', className)}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        // Outline, not underline: a hairline pill that fades in on hover and
        // firms up (with a faint wash) for the active page.
        'relative inline-flex items-center rounded-full px-4 py-2 text-[0.95rem] font-medium text-foreground/75 outline-none ring-1 ring-inset ring-transparent transition-[color,background-color,box-shadow] duration-200 hover:text-foreground hover:ring-primary/35 focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[active]:bg-primary/8 data-[active]:text-foreground data-[active]:ring-primary/70',
        className,
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
}
