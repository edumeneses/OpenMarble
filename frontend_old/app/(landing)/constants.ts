import type { WindowProps } from '@/components/core/window'

export const defaultWindowClassName = 'h-[min(768px,70vh)] min-h-[400px] w-[calc(min(85vw,1024px))]'
export const defaultWindowProps: Partial<WindowProps> = {
  scroll: true,
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  transition: {
    duration: 0.35,
  },
  className: defaultWindowClassName,
  controls: true,
}
