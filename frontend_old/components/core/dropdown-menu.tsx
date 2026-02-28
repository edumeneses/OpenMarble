'use client'

import type { DropdownMenuContentProps, DropdownMenuProps } from '@radix-ui/react-dropdown-menu'
import * as RadixDropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { AnimatePresence } from 'motion/react'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  DropdownMenuContent as DropdownMenuContentPrimitive,
  DropdownMenuLabel,
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuSeparator,
  DropdownMenuTrigger as DropdownMenuTriggerPrimitive,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '../core/button'
import { textVariants } from '../ui/typography'
import { Window } from './window'

const DropdownMenuContext = createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMouseDown: boolean
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: false,
  setIsOpen: () => {},
  isMouseDown: false,
  setIsMouseDown: () => {},
})

export function useDropdownMenu() {
  return useContext(DropdownMenuContext)
}

const DropdownMenuTrigger = ({ children, ...props }: ButtonProps) => {
  const { isOpen } = useDropdownMenu()
  return (
    <DropdownMenuTriggerPrimitive {...props} asChild>
      <Button variant={isOpen ? 'selected' : props.variant}>{children}</Button>
    </DropdownMenuTriggerPrimitive>
  )
}

const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  useEffect(() => {
    // add data-vision-os-ui to html
    if (isOpen) {
      document.documentElement.setAttribute('data-vision-os-ui', 'true')
    } else {
      setTimeout(() => {
        document.documentElement.removeAttribute('data-vision-os-ui')
      }, 800)
    }
  }, [isOpen])
  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isMouseDown,
        setIsMouseDown,
      }}
    >
      <DropdownMenuPrimitive open={isOpen} onOpenChange={setIsOpen} {...props}>
        {children}
      </DropdownMenuPrimitive>
    </DropdownMenuContext.Provider>
  )
}

DropdownMenu.displayName = 'DropdownMenu'

const DropdownMenuContent = ({
  children,
  ...props
}: Omit<DropdownMenuContentProps, 'asChild' | 'forceMount'>) => {
  const { isOpen, isMouseDown } = useDropdownMenu()
  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuContentPrimitive forceMount asChild {...props}>
          <Window
            key="dropdown-menu-content"
            className="flex min-w-[200px] flex-col gap-2 p-4"
            initial={{
              opacity: 0,
              scale: 0.65,
              y: -30,
            }}
            animate={{
              opacity: 1,
              scale: isMouseDown ? 0.95 : 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.65,
              y: -30,
            }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 22,
            }}
          >
            {children}
          </Window>
        </DropdownMenuContentPrimitive>
      )}
    </AnimatePresence>
  )
}

DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuPrimitive.Item> & {
    inset?: boolean
    variant?: 'secondary' | 'destructive'
  }
>(({ inset, className, children, variant, onMouseDown, onMouseUp, ...props }, ref) => {
  const { setIsMouseDown, setIsOpen } = useDropdownMenu()
  return (
    <RadixDropdownMenuPrimitive.Item
      ref={ref}
      onMouseDown={(e) => {
        setIsMouseDown(true)
        onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        setIsMouseDown(false)
        onMouseUp?.(e)
      }}
      onSelect={(e) => {
        e.preventDefault()
        setTimeout(() => {
          setIsOpen(false)
        }, 300)
      }}
      {...props}
      asChild
    >
      <Button
        variant={variant ?? 'secondary'}
        size="list"
        className={cn(
          //TODO: hover causing focus-visiable to trigger
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          'w-full justify-start rounded-[16px] before:rounded-[16px]',
          'flex justify-between gap-2',
          "[&_[data-slot='icon']]:ml-2",
          textVariants({ size: 'body' }),
          inset && 'pl-8',
          className
        )}
        disabled={props?.disabled}
      >
        {children}
      </Button>
    </RadixDropdownMenuPrimitive.Item>
  )
})

DropdownMenuItem.displayName = 'DropdownMenuItem'
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
