import { atom } from 'jotai'

export interface GenerationJob {
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  imagePreviewUrl?: string
  plyUrl?: string
  videoUrl?: string
  plyFilename?: string
  error?: string
  createdAt: number
}

export interface GalleryItem {
  id: string
  plyUrl: string
  plyFilename: string
  createdAt: number
}

export const currentJobAtom = atom<GenerationJob | null>(null)
export const galleryItemsAtom = atom<GalleryItem[]>([])
