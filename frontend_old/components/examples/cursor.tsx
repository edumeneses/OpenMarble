import { ALargeSmall, ListOrdered, Redo2, Undo2 } from 'lucide-react'
import { Button, ButtonGroup } from '@/components/core/button'
import { Window } from '@/components/core/window'
import { Separator } from '@/components/ui/separator'

export const WithButtonGroup = () => {
  return (
    <Window>
      <ButtonGroup>
        <Button variant="secondary" size="icon">
          <Undo2 data-slot="icon" />
        </Button>
        <Button variant="secondary" size="icon">
          <Redo2 data-slot="icon" />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <Button variant="secondary" size="icon">
          <ALargeSmall data-slot="icon" />
        </Button>
        <Button variant="secondary" size="icon">
          <ListOrdered data-slot="icon" />
        </Button>
      </ButtonGroup>
    </Window>
  )
}
