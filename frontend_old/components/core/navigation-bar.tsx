'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'
import { Text } from '../ui/typography'
import { useWindow } from './window'

const navigationBarVariants = cva(
  'group absolute inset-x-[-1px] top-0 z-[41] inline-flex h-[var(--navigation-bar-height)] w-full items-center justify-between overflow-hidden rounded-t-[--radius] px-6',
  {
    variants: {
      size: {
        default: '[--navigation-bar-height:92px] [--navigation-bar-mask-height:64px]',
        sm: '[--navigation-bar-height:64px] [--navigation-bar-mask-height:40px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const navigationBarTitleVariants = cva('pointer-events-none text-[29px] font-bold', {
  variants: {
    variant: {
      leading: '',
      center: 'absolute inset-0 flex h-full items-center justify-center',
    },
    /**
     * Show the title after scroll
     */
    reveal: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'center',
    reveal: false,
  },
})

interface NavigationBarProps extends VariantProps<typeof navigationBarVariants> {
  className?: string
  children: React.ReactNode
}

interface NavigationBarTitleProps extends VariantProps<typeof navigationBarTitleVariants> {
  children: string
}

const NavigationBar = ({ className, children, size = 'default' }: NavigationBarProps) => {
  const { scrollY } = useWindow()
  const blurOpacity = useTransform(scrollY, [0, 100], [0, 1])
  return (
    <nav className={cn(navigationBarVariants({ size }), className)} data-size={size}>
      <motion.div
        // TODO: Alternative variable blur effect: https://codepen.io/silas/pen/rNYqZoz
        className={cn(
          'pointer-events-none absolute inset-[-4px] backdrop-blur',
          '[mask:linear-gradient(black,black_var(--navigation-bar-mask-height,64px),transparent)]'
        )}
        style={{
          opacity: blurOpacity,
        }}
      />
      {children}
    </nav>
  )
}

const NavigationBarTitle = ({
  variant = 'center',
  reveal = false,
  children,
}: NavigationBarTitleProps) => {
  const { scrollY } = useWindow()
  const opacity = useTransform(scrollY, [100, 180], [0, 0.96])
  return (
    <motion.div
      className={cn(navigationBarTitleVariants({ variant, reveal }))}
      style={{
        opacity: reveal ? opacity : 1,
      }}
    >
      <Text
        className="group-data-[size=default]:text-[29px] group-data-[size=sm]:text-[20px]"
        asChild
      >
        <h1>{children}</h1>
      </Text>
    </motion.div>
  )
}

export { NavigationBar, NavigationBarTitle }
