import { cn } from '@/lib/utils'
import { ButtonGroup } from '../core/button'
import { Window, type WindowProps } from './window'

const Toolbar = ({ className, children, ...props }: WindowProps) => {
  return (
    <Window className={cn('-mb-[34px]', className)} layoutId="toolbar" thickness="thin" {...props}>
      <ButtonGroup>{children}</ButtonGroup>
    </Window>
  )
}
export { Toolbar }
