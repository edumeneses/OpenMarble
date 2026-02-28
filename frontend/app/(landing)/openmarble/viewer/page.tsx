'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { ActivityIndicator } from '@/components/activity-indicator'
import { getSuperSplatViewerUrl } from '@/lib/api'

function ViewerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plyUrl = searchParams.get('ply')

  if (!plyUrl) {
    return (
      <Stack material options={{ title: 'Viewer', headerShown: true }}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Text size="title3" variant="secondary">
            No world selected
          </Text>
          <Button
            variant="primary"
            className="rounded-full px-6"
            onClick={() => router.push('/openmarble')}
          >
            Create World
          </Button>
        </div>
      </Stack>
    )
  }

  const iframeSrc = getSuperSplatViewerUrl(plyUrl)

  return (
    <Stack
      material
      options={{
        title: 'World Viewer',
        headerShown: true,
        headerLeft: (
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => router.back()}
          >
            Back
          </Button>
        ),
        headerRight: (
          <Button
            variant="secondary"
            className="rounded-full"
            asChild
          >
            <a href={plyUrl} download>
              Download
            </a>
          </Button>
        ),
      }}
    >
      <iframe
        src={iframeSrc}
        className="h-full w-full rounded-b-[var(--view-radius)]"
        style={{ border: 'none' }}
        allow="autoplay; fullscreen"
        title="3D World Viewer"
      />
    </Stack>
  )
}

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <ActivityIndicator className="size-8 animate-spin text-white" />
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  )
}
