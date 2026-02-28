'use client'

import { useCallback, useRef, useState } from 'react'
import { Material } from '@/components/core/material'
import { Text } from '@/components/core/text'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  previewUrl: string | null
  className?: string
}

export function ImageUpload({
  onFileSelect,
  previewUrl,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect],
  )

  return (
    <Material
      thickness="thin"
      className={cn(
        'relative flex cursor-pointer items-center justify-center overflow-hidden',
        'min-h-[300px] w-full max-w-[500px]',
        isDragging && 'ring-2 ring-white/30',
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-full w-full rounded-[var(--view-radius)] object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/40"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <Text size="body" variant="secondary">
            Drop an image or click to upload
          </Text>
          <Text size="caption1" variant="tertiary">
            PNG, JPG, or WebP
          </Text>
        </div>
      )}
    </Material>
  )
}
