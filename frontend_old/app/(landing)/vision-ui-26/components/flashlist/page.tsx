import { Stack } from '@/components/core/v2/stack'
import DemoFlashlist from '@/components/examples/flash-list'

export default function HomePage() {
  return (
    <Stack options={{ title: 'Home' }}>
      <DemoFlashlist />
    </Stack>
  )
}
