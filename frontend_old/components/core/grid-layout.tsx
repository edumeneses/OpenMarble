'use client'

import { useAtomValue } from 'jotai'
import {
  animate,
  type MotionProps,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useIsMounted } from '@/hooks/use-is-mounted'
import useWindowSize from '@/hooks/use-window-size'
import { debugModeAtom } from '@/lib/atoms'
import { cn } from '@/lib/utils'
import { Window } from './window'

// ------------------------------------------------------------------
// 1. CONTEXT SETUP
// ------------------------------------------------------------------

/** The shape of the data we'll put in context */
interface HoneycombContextValue {
  debug: boolean
  scrollX: MotionValue<number>
  pageWidth: number
  itemSize: number
  labelSize: number
  gutter: number
  verticalSpacing: number
  /**
   * Used for exit transition when clicking on a href
   */
  animateOverwrite: boolean
  setAnimateOverwrite: (value: boolean) => void
}

/** Create the context object (and a safe hook to consume it). */
const HoneycombContext = createContext<HoneycombContextValue | undefined>(undefined)

function useHoneycombContext() {
  const value = useContext(HoneycombContext)
  if (!value) {
    throw new Error('useHoneycombContext must be used within a HoneycombProvider.')
  }
  return value
}

/** Wrap children in this provider once at the top of your layout. */
function HoneycombProvider({
  value,
  children,
}: {
  value: HoneycombContextValue
  children: ReactNode
}) {
  return <HoneycombContext.Provider value={value}>{children}</HoneycombContext.Provider>
}

// ------------------------------------------------------------------
// 2. MAIN HONEYCOMB LAYOUT
// ------------------------------------------------------------------

export interface HoneycombItem extends MotionProps {
  id: string
  label: string
  icon: React.ReactNode
  background?: React.ReactNode
  href?: string
  debug?: boolean
  onClick?: () => void
}

interface HoneycombLayoutProps {
  items: HoneycombItem[]
}

// Some sizing constants
const ITEM_SIZE = 96 // icon diameter
const LABEL_SIZE = 28
const GUTTER = 48
const PAGE_GUTTER = ITEM_SIZE * 2 + GUTTER // spacing between pages
const MAX_CONTAINER_WIDTH = 1024 - PAGE_GUTTER
const ORNAMENT_WIDTH = 68 + 16 * 2 + 1 * 16 // example offset
const GRID_VERTICAL_SPACING_FACTOR = {
  condensed: 0.9,
  default: 1.4,
}

const DEBUG_CLASSNAMES = [
  'after:absolute',
  'after:left-0',
  'after:top-0',
  'after:z-40',
  'after:text-xs',
  'after:p-2',
  'after:shadow-md',
  'after:tabular-nums',
  'outline',
]

export function HoneycombLayout({ items }: HoneycombLayoutProps) {
  const [animateOverwrite, setAnimateOverwrite] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const DEBUG = useAtomValue(debugModeAtom)
  const { width = 600, height = 600 } = useWindowSize()

  // Motion values
  const x = useMotionValue(0)

  // Filter items based on debug mode
  const filteredItems = items.filter((item) => {
    if (DEBUG) return true
    return !item.debug
  })

  // Condensed or normal spacing based on window size
  const isCondensedWidth = width <= 896
  const isCondensedHeight = height <= 460
  const verticalSpacing = isCondensedHeight
    ? GRID_VERTICAL_SPACING_FACTOR.condensed
    : GRID_VERTICAL_SPACING_FACTOR.default

  // Container width
  let containerWidth = Math.min(width, MAX_CONTAINER_WIDTH)
  if (isCondensedWidth) {
    containerWidth = containerWidth - ORNAMENT_WIDTH
  }

  // Limit the number of columns
  const maxCols = Math.min(Math.floor((containerWidth - ITEM_SIZE) / (ITEM_SIZE + GUTTER)), 4)
  // items per page (3 rows with an extra middle cell => maxCols*3 + 1)
  const itemsPerPage = maxCols * 3 + 1

  // Break items into pages
  const pages: HoneycombItem[][] = []
  for (let i = 0; i < filteredItems.length; i += itemsPerPage) {
    pages.push(filteredItems.slice(i, i + itemsPerPage))
  }

  // Calculate actual page width
  const rawPageWidth = maxCols * (ITEM_SIZE + GUTTER) + PAGE_GUTTER
  // "padding" keeps pages from overshooting container width
  const padding = Math.max(0, containerWidth - rawPageWidth - ITEM_SIZE + PAGE_GUTTER)
  const pageWidth = rawPageWidth - padding

  // Debug logging when x changes
  useMotionValueEvent(x, 'change', (latest) => {
    if (DEBUG && containerRef.current) {
      containerRef.current.setAttribute(
        'data-debug',
        `View(${containerWidth}px) • ${Math.round(latest)}px`
      )
    }
  })

  function onDragEnd() {
    const currentX = x.get()
    const rawPageIndex = -currentX / pageWidth
    const nearestPage = Math.round(rawPageIndex)
    const clampedPage = Math.max(0, Math.min(nearestPage, pages.length - 1))
    const finalX = -clampedPage * pageWidth
    // Animate to final
    animate(x, finalX, { type: 'spring', stiffness: 90, damping: 18 })
  }

  // Reset x on unmount
  useEffect(() => {
    return () => x.set(0)
  }, [x])

  const providerValue: HoneycombContextValue = {
    debug: DEBUG,
    scrollX: x,
    pageWidth,
    itemSize: ITEM_SIZE,
    labelSize: LABEL_SIZE,
    gutter: GUTTER,
    verticalSpacing,
    animateOverwrite,
    setAnimateOverwrite,
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: containerWidth,
        height: (ITEM_SIZE + LABEL_SIZE) * 3 + GUTTER * verticalSpacing,
        marginLeft: 'auto',
        marginRight: 'auto',
        overflow: 'visible',
        position: 'relative',
        paddingLeft: padding / 2,
        paddingRight: padding / 2,
      }}
      data-debug={`View(${containerWidth}px) • 0px`}
      className={cn(
        DEBUG && [
          ...DEBUG_CLASSNAMES,
          'outline-yellow-500',
          'after:content-[attr(data-debug)]',
          'after:absolute after:top-0 after:left-0 after:z-40',
          'after:bg-yellow-500 after:p-2 after:text-xs after:text-yellow-900',
        ]
      )}
      role="region"
      aria-label="Interactive grid layout"
    >
      <motion.div
        ref={innerRef}
        drag="x"
        dragConstraints={{
          left: Math.min(-pageWidth * (pages.length - 1), 0),
          right: 0,
        }}
        dragElastic={0.25}
        onDragEnd={onDragEnd}
        data-debug={`Drag Constraints • Left: ${Math.min(
          -pageWidth * (pages.length - 1),
          0
        )}px, Right: 0px • padding: ${padding}px`}
        className={cn(
          'relative h-full',
          DEBUG && [
            ...DEBUG_CLASSNAMES,
            'outline-sky-500',
            'after:content-[attr(data-debug)]',
            'after:absolute after:top-[2rem] after:left-0 after:z-[41]',
            'after:bg-sky-500 after:p-2 after:text-sky-950 after:text-xs',
          ]
        )}
        style={{
          x,
          touchAction: 'none',
          userSelect: 'none',
        }}
        aria-roledescription="Draggable grid"
      >
        <HoneycombProvider value={providerValue}>
          {pages.map((pageItems, pageIndex) => {
            const pageOffset = pageIndex * pageWidth
            return (
              <PageContent
                key={`page-${pageIndex}`}
                pageItems={pageItems}
                pageIndex={pageIndex}
                pageOffset={pageOffset}
              />
            )
          })}
        </HoneycombProvider>
      </motion.div>
      {pages.length > 1 && (
        <div className="sr-only">
          This grid can be navigated by dragging left or right. Use tab key to navigate between
          items.
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// 3. PAGE (contains 3 rows of HoneycombCell)
// ------------------------------------------------------------------

const pageVariants = {
  hidden: {
    scale: 0.93,
  },
  visible: {
    scale: 1,
    transition: {
      delay: 0.2,
      type: 'spring',
      stiffness: 80,
      damping: 18,
      mass: 1.2,
    },
  },
  zoomOut: {
    scale: 1.08,
  },
} as const

function PageContent({
  pageItems,
  pageIndex,
  pageOffset,
}: {
  pageItems: HoneycombItem[]
  pageIndex: number
  pageOffset: number
}) {
  const isMounted = useIsMounted()
  const [show, setShow] = useState(false)
  const { debug, pageWidth, itemSize, gutter, animateOverwrite } = useHoneycombContext()

  // We figure out how many columns we can have by seeing how many fits into a single page
  // For consistency, we re-derive it from (pageWidth - PAGE_GUTTER) / (itemSize+gutter) or so.
  // Or you might pass `maxCols` in context if that's simpler.
  // For brevity, let's just guess 4 columns from the original logic:
  const maxCols = Math.min(Math.floor((pageWidth - 96) / (itemSize + gutter)), 4)

  useEffect(() => {
    if (isMounted()) setShow(true)
  }, [isMounted])

  if (!show) return null

  return (
    <motion.div
      key={pageIndex}
      style={{
        position: 'absolute',
        top: 0,
        left: pageOffset,
        width: pageWidth,
        height: '100%',
      }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit={animateOverwrite ? 'zoomOut' : 'hidden'}
      transition={{
        duration: 1,
        type: 'spring',
        bounce: 0,
      }}
      data-debug={`Page ${pageIndex}: ${pageWidth}px`}
      className={cn(
        debug && [
          ...DEBUG_CLASSNAMES,
          'outline-green-500',
          'after:content-[attr(data-debug)]',
          'after:absolute after:top-[-2rem] after:left-0',
          'after:bg-green-500 after:p-2 after:text-green-900 after:text-xs',
        ]
      )}
      role="group"
      aria-label={`Page ${pageIndex + 1}`}
    >
      <motion.ul
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
        aria-label={`Grid items on page ${pageIndex + 1}`}
      >
        {pageItems.map((item, i) => {
          // Row-col math
          let row: number
          let col: number
          if (i < maxCols) {
            row = 0
            col = i
          } else if (i < maxCols * 2 + 1) {
            row = 1
            col = i - maxCols
          } else {
            row = 2
            col = i - maxCols * 2 - 1
          }

          return (
            <HoneycombCell
              key={`${item.id}-${pageIndex}-${i}`}
              item={item}
              row={row}
              col={col}
              maxCols={maxCols}
              pageOffset={pageOffset}
            />
          )
        })}
      </motion.ul>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// 4. CELL (single circular icon + label)
// ------------------------------------------------------------------

const tapVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      bounce: 0,
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 8,
      mass: 0.1,
    },
  },
  focus: {
    scale: 1.08,
    transition: {
      type: 'spring',
      bounce: 0,
    },
  },
} as const

const cellXclassName = {
  '-4': '[--cell-x:-2.5px]',
  '-3': '[--cell-x:-2px]',
  '-2': '[--cell-x:-1.25px]',
  '-1': '[--cell-x:-0.5px]',
  '0': '[--cell-x:0px]',
  '1': '[--cell-x:1px]',
  '2': '[--cell-x:1.5px]',
  '3': '[--cell-x:2.25px]',
  '4': '[--cell-x:3px]',
}

const cellYclassName = {
  '-2': '[--cell-y:-2px]',
  '0': '[--cell-y:-1px]',
  '2': '[--cell-y:2px]',
}

function HoneycombCell({
  item,
  row,
  col,
  maxCols,
  pageOffset,
}: {
  item: HoneycombItem
  row: number
  col: number
  maxCols: number
  pageOffset: number
}) {
  const {
    debug,
    scrollX,
    pageWidth,
    itemSize,
    gutter,
    labelSize,
    verticalSpacing,
    animateOverwrite,
    setAnimateOverwrite,
  } = useHoneycombContext()

  const router = useRouter()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const cellRef = useRef<HTMLLIElement>(null)

  // Some geometry
  const halfOffset = (itemSize + gutter) / 2
  const cellX = row === 1 ? col * (itemSize + gutter) : halfOffset + col * (itemSize + gutter)
  const cellY = row * (itemSize + gutter * verticalSpacing)

  // 1) Opacity + scale transforms based on how far the page is from center
  const inputRange = [
    -cellX - pageOffset + pageWidth,
    -cellX - pageOffset + pageWidth - itemSize,
    -cellX - pageOffset,
    -cellX - itemSize - pageOffset,
  ]
  const opacity = useTransform(scrollX, inputRange, [0, 1, 1, 0])
  const scale = useTransform(scrollX, inputRange, [0.75, 1, 1, 0.75])
  const filter = useTransform(scrollX, inputRange, [
    'blur(16px)',
    'blur(0px)',
    'blur(0px)',
    'blur(16px)',
  ])

  // 2) Middle row parallax effect
  const middleRowParallax = useTransform(
    scrollX,
    [-pageOffset - pageWidth, -pageOffset, -pageOffset + pageWidth],
    [-itemSize * 0.7, 0, itemSize * 0.7]
  )

  // 3) "Center-out" reveal offsets for the first page
  const orderX = 2 * col - maxCols + (row !== 1 ? 1 : 0)
  const orderY = (row - 1) * 2
  const startX = ITEM_SIZE * -(orderX / maxCols) * 0.1 * (Math.abs(row - 1) + Math.abs(col - 2))
  const startY = -(itemSize / 3) * (row - 1)
  const wrapperVariants = {
    initialFirstPage: { x: startX, y: startY, filter: 'blur(16px)' },
    initialOtherPages: { scale: 1, filter: 'blur(0px)' },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: 0.15 + 0.1 * (Math.abs(row - 1) + Math.abs(col - 2)),
        type: 'spring',
        duration: 1.2,
        bounce: 0,
      },
    },
    exit: {
      x: startX,
      y: startY,
      filter: 'blur(16px)',
      transition: {
        duration: 0.5,
      },
    },
    zoomOut: {
      x: -startX,
      y: -startY,
      filter: 'blur(16px)',
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    focused: {
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      scale: 1.02,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  } as const

  const isOnFirstPage = pageOffset === 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate(e)
    }

    // Arrow key navigation
    const gridItems = Array.from(document.querySelectorAll('[role="button"][tabindex="0"]'))
    const currentIndex = gridItems.indexOf(cellRef.current as HTMLElement)

    let nextItem: HTMLElement | null = null

    switch (e.key) {
      case 'ArrowRight':
        if (currentIndex < gridItems.length - 1) {
          nextItem = gridItems[currentIndex + 1] as HTMLElement
        }
        break
      case 'ArrowLeft':
        if (currentIndex > 0) {
          nextItem = gridItems[currentIndex - 1] as HTMLElement
        }
        break
      case 'ArrowDown':
        // Try to find an item in the next row (approximately maxCols away)
        if (currentIndex + maxCols < gridItems.length) {
          nextItem = gridItems[currentIndex + maxCols] as HTMLElement
        }
        break
      case 'ArrowUp':
        // Try to find an item in the previous row
        if (currentIndex - maxCols >= 0) {
          nextItem = gridItems[currentIndex - maxCols] as HTMLElement
        }
        break
    }

    if (nextItem) {
      e.preventDefault()
      nextItem.focus()
    }
  }

  const onClick = () => {
    if (item.onClick) {
      item.onClick()
    }
  }

  const onNavigate = (e: { preventDefault: () => void }) => {
    if (item.href) {
      e.preventDefault()
      const href = item.href
      setAnimateOverwrite(true)
      setTimeout(() => {
        router.push(href as any, {
          scroll: false,
        })
      }, 600)
    }
  }

  return (
    <motion.li
      ref={cellRef}
      {...item}
      style={{
        position: 'absolute',
        left: cellX,
        top: cellY,
        x: row === 1 ? middleRowParallax : 0,
        scale,
      }}
      animate={
        isFocused ? 'focused' : animateOverwrite ? 'zoomOut' : isOnFirstPage ? 'animate' : undefined
      }
      initial={isOnFirstPage ? 'initialFirstPage' : 'initialOtherPages'}
      exit="exit"
      variants={wrapperVariants}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
      className={cn('group/cell outline-none', debug && ['outline', 'outline-pink-500'])}
      role="button"
      aria-label={item.label}
      onKeyDown={handleKeyDown}
    >
      <Link
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        href={item.href ?? ('' as any)}
        onNavigate={onNavigate}
        onClick={onClick}
        data-cursor-disabled
      >
        {/* Icon bubble */}
        <motion.div
          variants={tapVariants}
          animate={isMouseDown ? 'tap' : undefined}
          whileHover={isMouseDown ? undefined : 'hover'}
          transition={tapVariants.hover.transition}
          className={cn(
            'group/icon relative',
            cellXclassName[orderX.toString() as keyof typeof cellXclassName],
            cellYclassName[orderY.toString() as keyof typeof cellYclassName]
          )}
        >
          <Window
            className={cn(
              'rounded-full backdrop-blur [--diameter:96px] [--radius:48px] before:rounded-full',
              isFocused && 'ring-1 ring-white/50 ring-offset-1 ring-offset-transparent'
            )}
            thickness="none"
            style={{
              width: itemSize,
              height: itemSize,
              opacity,
              filter,
              position: 'relative',
              zIndex: 20,
              transition: 'all 0.3s ease-out',
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full">
              {debug && (
                <span className="absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-black/50 text-center font-light font-mono text-white/85 text-xs tabular-nums">
                  {Math.round(cellX)},{Math.round(cellY)}
                  <br />
                  row:{row} col:{col}
                  {isMouseDown ? ' 👆' : ''}
                  {isFocused ? ' 🔍' : ''}
                </span>
              )}
              {item.background && (
                <div className={'pointer-events-none absolute inset-0'}>
                  {item.background}
                  <div
                    className={cn(
                      'absolute inset-0 z-10 bg-white/10 opacity-0 transition-opacity duration-300',
                      'bg-blend-overlay',
                      'group-hover/cell:opacity-100',
                      isFocused ? 'opacity-100' : ''
                    )}
                  />
                </div>
              )}
              {item.icon && (
                <div
                  className={cn(
                    'absolute inset-0 z-[11] transition-all duration-300',
                    isFocused && 'scale-105 brightness-110'
                  )}
                >
                  {item.icon}
                </div>
              )}
            </div>
          </Window>
        </motion.div>

        {/* Label */}
        <motion.div
          className={cn(
            'pointer-events-none flex translate-y-0.5 items-center justify-center text-center font-medium text-shadow-md text-white/65 text-xs transition-all duration-300 group-hover/cell:text-white/85',
            '!delay-0 !duration-0',
            isFocused && 'translate-y-1 font-semibold text-white'
          )}
          style={{
            height: labelSize,
            width: itemSize,
            opacity,
            filter,
          }}
        >
          {item.label}
        </motion.div>
      </Link>
    </motion.li>
  )
}

export const honeycombIconClassName = cn(
  'object-contain p-3 transition-all duration-300 pointer-events-none touch-none',
  'translate-y-0 translate-x-0 group-hover/cell:!translate-y-[var(--cell-y,-1px)] group-hover/cell:!translate-x-[var(--cell-x,-1px)]',
  'group-focus-visible/cell:!translate-y-[var(--cell-y,-1px)] group-focus-visible/cell:!translate-x-[var(--cell-x,-1px)]',
  '[filter:drop-shadow(0px_0px_1px_rgba(12,12,12,0))] group-hover/cell:[filter:drop-shadow(calc(var(--cell-x,-1px)*-1.5)_calc(var(--cell-y,-1px)*-1.5)_1px_rgba(0,0,0,0.33))]',
  'group-focus-visible/cell:[filter:drop-shadow(calc(var(--cell-x,-1px)*-1.5)_calc(var(--cell-y,-1px)*-1.5)_1px_rgba(0,0,0,0.33))]'
)
