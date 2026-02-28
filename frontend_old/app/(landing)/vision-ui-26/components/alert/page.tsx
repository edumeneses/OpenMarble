import { Stack } from '@/components/core/v2/stack'
import { AlertDemoContent } from '@/components/examples/alert-demo'

export default function AlertPage() {
  return (
    <Stack options={{ title: 'Alert Demo' }} className="p-6">
      <AlertDemoContent />
    </Stack>
  )
}
