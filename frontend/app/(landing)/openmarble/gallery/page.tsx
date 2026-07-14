'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { Material } from '@/components/core/material'
import { fetchGallery } from '@/lib/api'

interface GalleryEntry {
  id: string
  ply_url: string
  ply_filename: string
  created_at: number
  thumbnail_url: string | null
  video_url: string | null
}

export default function GalleryPage() {
  const router = useRouter()
  const [items, setItems] = useState<GalleryEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGallery()
      .then((data) => setItems(data.items))
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load gallery'),
      )
  }, [])

  return (
    <Stack material options={{ title: 'Gallery', headerShown: true }}>
      <div className="flex-1 overflow-y-auto p-8 pt-2">
        {error && (
          <div className="flex h-full items-center justify-center">
            <Text size="callout" className="text-red-400">
              {error}
            </Text>
          </div>
        )}

        {!error && items === null && (
          <div className="flex h-full items-center justify-center">
            <Text size="callout" variant="secondary">
              Loading…
            </Text>
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Text size="title3" variant="secondary">
              Nothing generated yet
            </Text>
            <Button
              variant="primary"
              className="rounded-full px-6"
              onClick={() => router.push('/openmarble')}
            >
              Create a World
            </Button>
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/openmarble/viewer?ply=${encodeURIComponent(item.ply_url)}${
                      // SHARP generations have a preview video; WorldGen 360°
                      // worlds don't — open those in inside-the-world mode.
                      item.video_url ? '' : '&mode=world'
                    }`,
                  )
                }
                className="group text-left"
              >
                <Material
                  thickness="thinnest"
                  className="overflow-hidden rounded-2xl transition-transform group-hover:scale-[1.02]"
                >
                  <div className="aspect-[4/3] w-full bg-white/5">
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.ply_filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Text size="caption2" variant="tertiary">
                          No preview
                        </Text>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <Text size="caption2" variant="secondary">
                      {new Date(item.created_at * 1000).toLocaleString()}
                    </Text>
                    <Text size="caption2" variant="tertiary">
                      {item.video_url ? '3D Photo' : '360° World'}
                    </Text>
                  </div>
                </Material>
              </button>
            ))}
          </div>
        )}
      </div>
    </Stack>
  )
}
