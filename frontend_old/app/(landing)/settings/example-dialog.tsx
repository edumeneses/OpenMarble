'use client'

import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '@/components/core/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/core/dialog'
import { Text } from '@/components/ui/typography'

export default function ExampleDialog() {
  return (
    <>
      <DialogTrigger asChild>
        <Button>Open VisionOS Dialog</Button>
      </DialogTrigger>

      {/* The dialog content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>VisionOS Dialog</DialogTitle>
          <DialogDescription>
            This dialog mimics the VisionOS style where the background content scales down and dims
            when the dialog opens.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Text size="body">
            The dialog uses the Window component with glass effect and animates in and out with a
            smooth transition. When this dialog is open, notice how the background content is scaled
            down and dimmed.
          </Text>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}
