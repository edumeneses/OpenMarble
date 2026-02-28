'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'motion/react'
import React, { createContext, useContext, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../core/button'
import { Text } from '../ui/typography'
import { Window, type WindowProps } from './window'

const CONSTANTS = {
  EXPANDED_WIDTH: '100%',
  COLLAPSED_WIDTH: 44,
  ENTERANCE_TIMEOUT: 700,
  EXITANCE_TIMEOUT: 500,
  TAB_EXIT_TIMEOUT: 480,
  TEXT_TRANSITION_CONFIG: {
    duration: 0.4,
  },
  ORNAMENT_TRANSITION_CONFIG: {
    type: 'spring',
    bounce: 0,
    duration: 0.7,
  },
} as const

const WINDOW_VARIANTS = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 90,
      delay: 0.25,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 90,
    },
  },
} as const

const FOOTER_VARIANTS = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      duration: 0.2,
      bounce: 0,
      delay: 0.7,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
} as const

// Create a context for the active tab
const OrnamentContext = createContext<{
  activeTab: string
  isExpanded: boolean
  isMouseDown: boolean
  isUnmounting: boolean
  contentClassName?: string
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
  setContentClassName: React.Dispatch<React.SetStateAction<string>>
  setIsUnmounting: React.Dispatch<React.SetStateAction<boolean>>
  handleOrnamentItemClick: () => void
  handleOrnamentItemMouseDown: () => void
  handleOrnamentItemMouseUp: () => void
  handleOrnamentItemFocus: () => void
  handleOrnamentItemBlur: () => void
}>({
  activeTab: '',
  isExpanded: false,
  isMouseDown: false,
  isUnmounting: false,
  contentClassName: '',
  setIsMouseDown: () => {},
  setActiveTab: () => {},
  setIsExpanded: () => {},
  setContentClassName: () => {},
  setIsUnmounting: () => {},
  handleOrnamentItemClick: () => {},
  handleOrnamentItemMouseDown: () => {},
  handleOrnamentItemMouseUp: () => {},
  handleOrnamentItemFocus: () => {},
  handleOrnamentItemBlur: () => {},
})

export function useOrnament() {
  const context = useContext(OrnamentContext)
  if (!context) {
    throw new Error('useOrnament must be used within a OrnamentContext')
  }
  return context
}

const Ornament = ({
  children,
  className,
  defaultTab,
}: {
  children: React.ReactNode
  className?: string
  defaultTab?: string
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || '')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isUnmounting, setIsUnmounting] = useState(false)
  const timeoutEnterRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutLeaveRef = useRef<NodeJS.Timeout | null>(null)
  const [contentClassName, setContentClassName] = useState('')
  const handleMouseEnter = () => {
    if (timeoutLeaveRef.current) {
      clearTimeout(timeoutLeaveRef.current)
    }
    timeoutEnterRef.current = setTimeout(() => {
      setIsExpanded(true)
    }, CONSTANTS.ENTERANCE_TIMEOUT)
  }

  const handleMouseLeave = () => {
    if (timeoutEnterRef.current) {
      clearTimeout(timeoutEnterRef.current)
    }
    timeoutLeaveRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, CONSTANTS.EXITANCE_TIMEOUT)
  }

  const handleOrnamentItemMouseDown = () => {
    setIsMouseDown(true)
  }

  const handleOrnamentItemMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleOrnamentItemClick = () => {
    if (timeoutEnterRef.current) clearTimeout(timeoutEnterRef.current)
    if (timeoutLeaveRef.current) clearTimeout(timeoutLeaveRef.current)
  }

  const handleOrnamentItemFocus = () => {
    handleMouseEnter()
  }

  const handleOrnamentItemBlur = () => {
    handleMouseLeave()
  }

  return (
    <OrnamentContext.Provider
      value={{
        activeTab,
        isExpanded,
        isMouseDown,
        isUnmounting,
        contentClassName,
        setIsUnmounting,
        setIsMouseDown,
        setActiveTab,
        setIsExpanded,
        setContentClassName,
        handleOrnamentItemClick,
        handleOrnamentItemMouseDown,
        handleOrnamentItemMouseUp,
        handleOrnamentItemFocus,
        handleOrnamentItemBlur,
      }}
    >
      <Tabs
        orientation="vertical"
        className={cn(
          'relative grid h-full w-full flex-1 grid-cols-[68px_1fr] place-content-center gap-4 md:gap-7 lg:ml-[-96px]',
          'max-w-3xl xl:max-w-4xl 2xl:max-w-6xl',
          className
        )}
        defaultValue={defaultTab}
        aria-label="Navigation and content panels"
      >
        <div className="sr-only">
          This navigation menu expands when focused. Use tab key to navigate between tabs.
        </div>
        {children}
      </Tabs>
    </OrnamentContext.Provider>
  )
}

const OrnamentTabs = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { isExpanded, isMouseDown, handleOrnamentItemFocus, handleOrnamentItemBlur } = useOrnament()

  return (
    <Window
      className={'hide-scrollbar relative z-[42] mx-auto flex items-center justify-start p-3'}
      initial={{
        opacity: 0,
        scale: 1,
      }}
      animate={{
        opacity: 1,
        scale: isMouseDown ? 1 : isExpanded ? 1.05 : 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={CONSTANTS.ORNAMENT_TRANSITION_CONFIG}
      aria-label="Navigation tabs"
    >
      <TabsList asChild>
        <motion.div
          onMouseEnter={handleOrnamentItemFocus}
          onMouseLeave={handleOrnamentItemBlur}
          className={cn('flex flex-col items-start gap-2', className)}
        >
          {children}
        </motion.div>
      </TabsList>
    </Window>
  )
}

const OrnamentTab = ({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onClick?: () => void
}) => {
  const {
    activeTab,
    setActiveTab,
    isExpanded,
    setIsUnmounting,
    handleOrnamentItemClick,
    handleOrnamentItemMouseDown,
    handleOrnamentItemMouseUp,
    handleOrnamentItemFocus,
    handleOrnamentItemBlur,
  } = useOrnament()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    setIsUnmounting(true)
    setTimeout(() => {
      setActiveTab(value)
      setIsUnmounting(false)
    }, CONSTANTS.TAB_EXIT_TIMEOUT)
    handleOrnamentItemClick()
    onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const isActive = activeTab === value
  const variant = isHovered ? 'default' : isActive ? 'default' : 'secondary'

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? CONSTANTS.EXPANDED_WIDTH : CONSTANTS.COLLAPSED_WIDTH,
      }}
      transition={CONSTANTS.ORNAMENT_TRANSITION_CONFIG}
    >
      <TabsTrigger value={value} asChild>
        <Button
          id={`ornament-tab-${value}`}
          className="flex w-full items-center justify-stretch rounded-full px-[10px] before:rounded-full"
          onClick={handleClick}
          onMouseDown={handleOrnamentItemMouseDown}
          onMouseUp={handleOrnamentItemMouseUp}
          onFocus={handleOrnamentItemFocus}
          onBlur={handleOrnamentItemBlur}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={handleKeyDown}
          variant={variant}
          aria-expanded={isExpanded}
        >
          <div
            className="relative mr-4 flex-shrink-0 [&_[data-slot='icon']]:size-6"
            aria-hidden="true"
          >
            {icon}
          </div>
          <motion.span
            className="flex-1 overflow-hidden text-start"
            initial={{
              width: 0,
            }}
            animate={{
              width: isExpanded ? 'auto' : 0,
            }}
            transition={CONSTANTS.TEXT_TRANSITION_CONFIG}
          >
            <Text
              size="title3"
              variant={isHovered ? 'default' : variant}
              className="line-clamp-1 w-fit min-w-[60px] truncate font-medium leading-[24px]"
            >
              {label}
            </Text>
          </motion.span>
        </Button>
      </TabsTrigger>
    </motion.div>
  )
}

interface OrnamentContentsApiProps {
  children: React.ReactNode
  /**
   * A helper class name for all children `OrnamentContent` components.
   *
   * You can also customize each `OrnamentContent` component individually.
   */
  contentClassName?: string
}

const OrnamentContents = ({ children, contentClassName }: OrnamentContentsApiProps) => {
  const { setContentClassName } = useOrnament()
  React.useEffect(() => {
    if (contentClassName) {
      setContentClassName(contentClassName)
    }
  }, [contentClassName, setContentClassName])

  return children
}

interface OrnamentContentApiProps {
  value: string
  /**
   * Rendered at the top of the content. Can be a React Component (e.g. SomeComponent), or a React element (e.g. <SomeComponent />).
   */
  HeaderComponent?: React.ReactNode | React.ComponentType
  /**
   * Rendered at the bottom of the content. Can be a React Component (e.g. SomeComponent), or a React element (e.g. <SomeComponent />).
   */
  FooterComponent?: React.ReactNode | React.ComponentType
}

interface OrnamentContentProps extends WindowProps, OrnamentContentApiProps {}

const OrnamentContent = ({
  value,
  HeaderComponent,
  FooterComponent,
  className,
  rootClassName,
  ...props
}: OrnamentContentProps) => {
  const { activeTab, contentClassName } = useOrnament()
  const isActive = activeTab === value

  return (
    <AnimatePresence mode="popLayout">
      {isActive && (
        <TabsContent
          value={value}
          key={`ornament-content-${value}`}
          forceMount
          className={cn('relative order-2 flex w-full flex-col', className)}
          data-slot="content"
          id={`ornament-content-${value}`}
          tabIndex={-1}
        >
          {HeaderComponent &&
            (typeof HeaderComponent === 'function' ? <HeaderComponent /> : HeaderComponent)}
          <Window
            className={cn(contentClassName, className)}
            rootClassName={cn('items-stretch', rootClassName)}
            scroll
            initial={WINDOW_VARIANTS.hidden}
            animate={WINDOW_VARIANTS.visible}
            exit={WINDOW_VARIANTS.exit}
            transition={CONSTANTS.ORNAMENT_TRANSITION_CONFIG}
            {...props}
          />
          {FooterComponent && (
            <motion.div
              initial={FOOTER_VARIANTS.hidden}
              animate={FOOTER_VARIANTS.visible}
              exit={FOOTER_VARIANTS.exit}
              transition={{
                duration: 0.1,
              }}
              className="absolute right-0 bottom-0 left-0 z-[41] flex items-center justify-center"
            >
              {typeof FooterComponent === 'function' ? <FooterComponent /> : FooterComponent}
            </motion.div>
          )}
        </TabsContent>
      )}
    </AnimatePresence>
  )
}

/**
 * A motion.div without a window, header or footer.
 */
const OrnamentContentBase = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) => {
  const { activeTab, contentClassName, isUnmounting } = useOrnament()
  const isActive = activeTab === value
  return (
    <AnimatePresence mode="popLayout">
      {isActive && !isUnmounting && (
        <TabsContent
          value={value}
          key={`ornament-content-${value}-active`}
          forceMount
          className="order-2 flex w-full flex-col"
          tabIndex={-1}
          asChild
        >
          <motion.div
            className={cn(className, contentClassName)}
            initial={WINDOW_VARIANTS.hidden}
            animate={WINDOW_VARIANTS.visible}
            exit={WINDOW_VARIANTS.exit}
            transition={CONSTANTS.ORNAMENT_TRANSITION_CONFIG}
          >
            {children}
          </motion.div>
        </TabsContent>
      )}
    </AnimatePresence>
  )
}

export {
  Ornament,
  OrnamentTabs,
  OrnamentTab,
  OrnamentContents,
  OrnamentContent,
  OrnamentContentBase,
}

export type { OrnamentContentApiProps, OrnamentContentsApiProps }
