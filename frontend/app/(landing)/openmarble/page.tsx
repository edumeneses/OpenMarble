'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { Material } from '@/components/core/material'
import { ImageUpload } from '@/components/marble/image-upload'
import { ProcessingOverlay } from '@/components/marble/processing-overlay'
import { currentJobAtom } from '@/lib/marble-atoms'
import { generateWorld, generateImageFromText } from '@/lib/api'
import { cn } from '@/lib/utils'

type InputMode = 'image' | 'text'

export default function CreatePage() {
  const router = useRouter()
  const [job, setJob] = useAtom(currentJobAtom)
  const [mode, setMode] = useState<InputMode>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState('')

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (mode === 'image' && !selectedFile) return
    if (mode === 'text' && !textPrompt.trim()) return

    const jobId = Date.now().toString()
    setJob({
      id: jobId,
      status: mode === 'text' ? 'imagining' : 'uploading',
      imagePreviewUrl: previewUrl ?? undefined,
      createdAt: Date.now(),
    })

    try {
      let imageFile: File

      if (mode === 'text') {
        // Step 1: Generate image from text via Replicate Minimax
        const { image_url } = await generateImageFromText(textPrompt.trim())

        // Step 2: Download the generated image as a File
        const imgRes = await fetch(image_url)
        const blob = await imgRes.blob()
        imageFile = new File([blob], 'imagined.jpeg', { type: blob.type || 'image/jpeg' })

        setJob((prev) =>
          prev
            ? { ...prev, status: 'uploading', imagePreviewUrl: image_url }
            : null,
        )
      } else {
        imageFile = selectedFile!
      }

      // Step 3: Generate the 3D world from the image
      setJob((prev) =>
        prev ? { ...prev, status: 'processing' } : null,
      )
      const result = await generateWorld(imageFile)
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
  }, [mode, selectedFile, textPrompt, previewUrl, setJob, router])

  const canGenerate =
    mode === 'image' ? !!selectedFile : !!textPrompt.trim()

  return (
    <>
      <Stack
        material
        options={{ title: 'Create World', headerShown: true }}
      >
        <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto p-8">
          {/* Description */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Text size="title2">Imaging a World</Text>
            <Text size="body" variant="secondary">
              Turn an image or a text description into an explorable 3D
              environment.
            </Text>
          </div>

          {/* Mode Tabs */}
          <Material
            thickness="thinnest"
            className="flex items-center gap-1 p-1"
          >
            <button
              type="button"
              onClick={() => setMode('image')}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                mode === 'image'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white/80',
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              Image
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                mode === 'text'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white/80',
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M17 6.1H3" />
                <path d="M21 12.1H3" />
                <path d="M15.1 18H3" />
              </svg>
              Text
            </button>
          </Material>

          {/* Image Mode */}
          {mode === 'image' && (
            <>
              <ImageUpload
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
              />

              {selectedFile && (
                <Text size="callout" variant="secondary">
                  {selectedFile.name}
                </Text>
              )}
            </>
          )}

          {/* Text Mode */}
          {mode === 'text' && (
            <Material
              thickness="thin"
              className="flex w-full max-w-[500px] flex-col gap-3 p-6"
            >
              <Text size="callout" variant="secondary">
                Describe the world you want to create
              </Text>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="A serene Japanese garden with cherry blossoms, a koi pond, and a wooden bridge..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
              />
            </Material>
          )}

          {/* Generate Button */}
          {canGenerate && (
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
