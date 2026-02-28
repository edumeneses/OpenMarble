'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { MotionView } from '@/components/core/view'
import {
  type AssetEntry,
  ASSET_CATEGORIES,
  fetchAssetManifest,
  getModelUrl,
} from '@/lib/asset-manifest'
import { cn } from '@/lib/utils'

const PANEL_WIDTH = 220

interface AssetPanelProps {
  onAddAsset: (url: string, name: string, defaultScale?: number) => void
  selectedModelId: string | null
  onRemoveSelected: () => void
  className?: string
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn('size-5', className)}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', className)}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function AssetPanel({
  onAddAsset,
  selectedModelId,
  onRemoveSelected,
  className,
}: AssetPanelProps) {
  const [assets, setAssets] = useState<AssetEntry[]>([])

  useEffect(() => {
    fetchAssetManifest().then(setAssets).catch(console.error)
  }, [])

  // Group by category
  const grouped = assets.reduce<Record<string, AssetEntry[]>>((acc, asset) => {
    const cat = asset.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(asset)
    return acc
  }, {})

  return (
    <MotionView
      material
      className={cn('relative z-[42] h-full', className)}
      style={{ width: PANEL_WIDTH }}
    >
      <div className="flex h-full flex-col gap-1 overflow-hidden p-2.5">
        {/* Header */}
        <div className="flex items-center gap-2 px-[10px] py-1">
          <BoxIcon className="size-6 shrink-0 text-white/70" />
          <span className="overflow-hidden">
            <Text
              size="title3"
              className="line-clamp-1 w-fit min-w-[60px] truncate font-medium leading-[24px] opacity-80"
            >
              Assets
            </Text>
          </span>
        </div>

        {/* Remove selected button */}
        {selectedModelId && (
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-full px-[10px] py-2 text-left transition-colors hover:bg-red-500/20"
            onClick={onRemoveSelected}
          >
            <TrashIcon className="size-6 shrink-0 text-red-400" />
            <span className="overflow-hidden">
              <Text
                size="callout"
                className="line-clamp-1 w-fit min-w-[60px] truncate text-red-400"
              >
                Remove
              </Text>
            </span>
          </button>
        )}

        {/* Asset list */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-[10px] py-1">
                <Text
                  size="caption1"
                  variant="tertiary"
                  className="line-clamp-1 w-fit min-w-[40px] truncate uppercase"
                >
                  {ASSET_CATEGORIES[category] || category}
                </Text>
              </div>
              {items.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={cn(
                    'vision-pro-ui-hoverable flex w-full items-center gap-2 rounded-full px-[10px] py-2 text-left',
                    'transition-colors hover:bg-white/10',
                  )}
                  onClick={() =>
                    onAddAsset(getModelUrl(asset), asset.name, asset.scale)
                  }
                >
                  <div className="flex size-6 shrink-0 items-center justify-center">
                    <BoxIcon className="size-5 text-white/50" />
                  </div>
                  <span className="overflow-hidden">
                    <Text
                      size="callout"
                      className="line-clamp-1 w-fit min-w-[60px] truncate opacity-60 hover:opacity-95"
                    >
                      {asset.name}
                    </Text>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <div className="flex items-center gap-2 px-[10px] py-2">
            <BoxIcon className="size-6 shrink-0 animate-pulse text-white/30" />
            <span className="overflow-hidden">
              <Text
                size="caption1"
                variant="tertiary"
                className="line-clamp-1 w-fit min-w-[60px] truncate"
              >
                Loading...
              </Text>
            </span>
          </div>
        )}
      </div>
    </MotionView>
  )
}
