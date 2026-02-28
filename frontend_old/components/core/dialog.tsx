'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import {
  // TODO: Wait for this to be stable
  // unstable_Activity as Activity,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import { type GlassThickness, Window } from './window'

// Context to manage the dialog state
const DialogContext = createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
})

interface DialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  children: React.ReactNode
}

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = useCallback(
    (value: boolean | ((prevState: boolean) => boolean)) => {
      if (controlledOnOpenChange) {
        const nextValue = typeof value === 'function' ? value(open) : value
        controlledOnOpenChange(nextValue)
      } else {
        setUncontrolledOpen(value)
      }
    },
    [controlledOnOpenChange, open]
  )

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  )
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}

interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /**
   * The thickness of the glass effect.
   * @default "normal"
   */
  thickness?: GlassThickness
  /**
   * Whether to show the close button.
   * @default true
   */
  showCloseButton?: boolean
}

function DialogContent({
  className,
  children,
  thickness = 'normal',
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const { open } = useContext(DialogContext)

  return (
    <AnimatePresence>
      {/* <Activity mode={open ? "visible" : "hidden"}> */}
      {open && (
        <DialogPrimitive.Portal forceMount>
          {/* Background overlay that dims and scales the window behind */}
          <DialogPrimitive.Overlay asChild>
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
              animate={{ opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              exit={{ opacity: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </DialogPrimitive.Overlay>

          {/* The actual dialog content */}
          <DialogPrimitive.Content asChild {...props}>
            <motion.div
              className={cn(
                'fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]',
                className
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0 }}
            >
              <Window thickness={thickness} className="overflow-hidden" aria-label="Dialog">
                <div className="relative flex flex-col gap-4 p-6">
                  {children}

                  {showCloseButton && (
                    <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50">
                      <XIcon className="h-4 w-4 text-gray-500" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  )}
                </div>
              </Window>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
      {/* </Activity> */}
    </AnimatePresence>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-semibold text-lg leading-none', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-gray-500 text-sm', className)} {...props} />
  )
}

// Higher-order component to apply the VisionOS effect to any content
interface WithVisionDialogEffectProps {
  children: React.ReactNode
}

function WithDialogEffect({ children }: WithVisionDialogEffectProps) {
  const { open } = useContext(DialogContext)

  return (
    <motion.div
      animate={{
        scale: open ? 0.95 : 1,
        // filter: open ? "brightness(0.9)" : "brightness(1)",
      }}
      transition={{ type: 'spring', bounce: 0 }}
    >
      {children}
    </motion.div>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  WithDialogEffect,
  DialogContext,
}
