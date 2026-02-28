'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { ImageUpload } from '@/components/marble/image-upload'
import { ProcessingOverlay } from '@/components/marble/processing-overlay'
import { currentJobAtom } from '@/lib/marble-atoms'
import { generateWorld } from '@/lib/api'

export default function CreatePage() {
  const router = useRouter()
  const [job, setJob] = useAtom(currentJobAtom)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return

    const jobId = Date.now().toString()
    setJob({
      id: jobId,
      status: 'uploading',
      imagePreviewUrl: previewUrl ?? undefined,
      createdAt: Date.now(),
    })

    try {
      setJob((prev) =>
        prev ? { ...prev, status: 'processing' } : null,
      )
      const result = await generateWorld(selectedFile)
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              plyUrl: result.ply_url,
              plyFilename: result.ply_filename,
              videoUrl: result.video_url ?? undefined,
            }
          : null,
      )
      router.push(
        `/openmarble/viewer?ply=${encodeURIComponent(result.ply_url)}`,
      )
    } catch (error) {
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error:
                error instanceof Error ? error.message : 'Unknown error',
            }
          : null,
      )
    }
  }, [selectedFile, previewUrl, setJob, router])

  return (
    <>
      <Stack
        material
        options={{ title: 'Create World', headerShown: true }}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <ImageUpload
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
          />

          {selectedFile && (
            <div className="flex flex-col items-center gap-3">
              <Text size="callout" variant="secondary">
                {selectedFile.name}
              </Text>
              <Button
                variant="primary"
                className="rounded-full px-8"
                onClick={handleGenerate}
                disabled={
                  job?.status === 'uploading' ||
                  job?.status === 'processing'
                }
              >
                Generate 3D World
              </Button>
            </div>
          )}

          {job?.status === 'error' && (
            <Text size="callout" className="text-red-400">
              {job.error}
            </Text>
          )}
        </div>
      </Stack>

      <ProcessingOverlay job={job} />
    </>
  )
}
