'use client'

import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { Material } from '@/components/core/material'
import { galleryItemsAtom } from '@/lib/marble-atoms'
import { fetchGallery } from '@/lib/api'

export default function GalleryPage() {
  const [items, setItems] = useAtom(galleryItemsAtom)
  const router = useRouter()

  useEffect(() => {
    fetchGallery()
      .then((data) =>
        setItems(
          data.items.map((item) => ({
            id: item.id,
            plyUrl: item.ply_url,
            plyFilename: item.ply_filename,
            createdAt: item.created_at,
          })),
        ),
      )
      .catch(console.error)
  }, [setItems])

  return (
    <Stack material options={{ title: 'My Worlds', headerShown: true }}>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6 pt-2">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Text size="title3" variant="secondary">
              No worlds yet
            </Text>
            <Text size="callout" variant="tertiary">
              Upload an image in the Create tab to generate your first 3D
              world.
            </Text>
            <Button
              variant="primary"
              className="mt-2 rounded-full px-6"
              onClick={() => router.push('/openmarble')}
            >
              Create World
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <Material
              key={item.id}
              thickness="thinnest"
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Text size="headline" className="truncate">
                  {item.plyFilename}
                </Text>
                <Text size="caption1" variant="tertiary">
                  {new Date(item.createdAt * 1000).toLocaleString()}
                </Text>
              </div>
              <Button
                variant="default"
                className="shrink-0 rounded-full"
                onClick={() =>
                  router.push(
                    `/openmarble/viewer?ply=${encodeURIComponent(item.plyUrl)}`,
                  )
                }
              >
                View
              </Button>
            </Material>
          ))
        )}
      </div>
    </Stack>
  )
}
