'use client'

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react'
import { Material } from '@/components/core/material'
import { Text } from '@/components/core/text'

export interface StreetViewInputHandle {
  captureImage: () => Promise<File>
}

interface StreetViewInputProps {
  onLocationSet: (hasLocation: boolean) => void
  ref?: Ref<StreetViewInputHandle>
}

/** Convert panorama zoom level to Street View Static API fov degrees. */
function zoomToFov(zoom: number): number {
  return Math.round(Math.max(10, Math.min(120, 90 / Math.pow(2, zoom))))
}

export function StreetViewInput({ onLocationSet, ref }: StreetViewInputProps) {
  const searchRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null)
  const povRef = useRef({ heading: 0, pitch: 0, fov: 90 })
  const latlngRef = useRef<{ lat: number; lng: number } | null>(null)

  const [mapsReady, setMapsReady] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useImperativeHandle(ref, () => ({
    captureImage: async () => {
      if (!latlngRef.current) throw new Error('No location selected')
      const { lat, lng } = latlngRef.current
      const { heading, pitch, fov } = povRef.current
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        heading: String(Math.round(heading)),
        pitch: String(Math.round(pitch)),
        fov: String(fov),
      })
      const response = await fetch(`/api/streetview?${params}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          (body as { error?: string }).error ?? 'Failed to capture Street View image',
        )
      }
      const blob = await response.blob()
      return new File([blob], 'streetview.jpg', { type: 'image/jpeg' })
    },
  }))

  // Load the Maps JS API once
  useEffect(() => {
    if (!apiKey) return
    import('@googlemaps/js-api-loader').then(({ setOptions, importLibrary }) => {
      setOptions({ key: apiKey, v: 'weekly' })
      importLibrary('places')
        .then(() => setMapsReady(true))
        .catch(() => setLoadError('Failed to load Google Maps'))
    })
  }, [apiKey])

  // Wire up Places Autocomplete once Maps is ready
  useEffect(() => {
    if (!mapsReady || !searchRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    })

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      latlngRef.current = { lat, lng }
      setLocationName(place.formatted_address ?? place.name ?? null)
      povRef.current = { heading: 0, pitch: 0, fov: 90 }

      if (panoramaRef.current) {
        // Move existing panorama to new location
        panoramaRef.current.setPosition({ lat, lng })
        panoramaRef.current.setPov({ heading: 0, pitch: 0 })
        panoramaRef.current.setZoom(0)
      } else if (containerRef.current) {
        // Create panorama on first location selection
        const pano = new google.maps.StreetViewPanorama(containerRef.current, {
          position: { lat, lng },
          pov: { heading: 0, pitch: 0 },
          zoom: 0,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        })

        const syncPov = () => {
          const pov = pano.getPov()
          povRef.current = {
            heading: pov.heading,
            pitch: pov.pitch,
            fov: zoomToFov(pano.getZoom()),
          }
        }
        pano.addListener('pov_changed', syncPov)
        pano.addListener('zoom_changed', syncPov)

        // Track position when user navigates between panoramas
        pano.addListener('pano_changed', () => {
          const pos = pano.getPosition()
          if (pos) latlngRef.current = { lat: pos.lat(), lng: pos.lng() }
        })

        panoramaRef.current = pano
      }

      setHasLocation(true)
      onLocationSet(true)
    })

    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [mapsReady, onLocationSet])

  // ── Not configured ──────────────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <Material
        thickness="thin"
        className="flex min-h-[300px] w-full max-w-[500px] flex-col items-center justify-center gap-3 p-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-10 text-white/30"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <Text size="body" variant="secondary">
          Google Maps not configured
        </Text>
        <Text size="caption1" variant="tertiary" className="text-center">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
        </Text>
      </Material>
    )
  }

  // ── Load error ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <Material
        thickness="thin"
        className="flex min-h-[300px] w-full max-w-[500px] flex-col items-center justify-center gap-3 p-8"
      >
        <Text size="body" className="text-red-400">
          {loadError}
        </Text>
      </Material>
    )
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-[500px] flex-col gap-3">
      {/* Autocomplete styles injected once — dark-themes the .pac-container dropdown */}
      <style>{`
        .pac-container {
          background: rgba(20, 20, 28, 0.97);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          margin-top: 4px;
          padding: 4px;
          font-family: inherit;
        }
        .pac-item {
          border: none;
          border-radius: 8px;
          color: rgba(255,255,255,0.75);
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          line-height: 1.4;
        }
        .pac-item:hover { background: rgba(255,255,255,0.08); }
        .pac-item-selected { background: rgba(255,255,255,0.12); }
        .pac-item-query { color: white; font-size: 13px; }
        .pac-matched { color: white; font-weight: 600; }
        .pac-icon { display: none; }
        .pac-logo::after { display: none; }
      `}</style>

      {/* Search box */}
      <Material thickness="thin" className="flex items-center gap-3 px-4 py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-white/50"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search for a location…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
      </Material>

      {/* Street View panorama */}
      <Material
        thickness="thin"
        className="relative h-[280px] w-full overflow-hidden"
      >
        {!hasLocation && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-10 text-white/25"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <Text size="body" variant="secondary">
              Search for a location to preview
            </Text>
            <Text size="caption1" variant="tertiary">
              Pan &amp; tilt to pick the exact angle
            </Text>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </Material>

      {locationName && (
        <Text size="callout" variant="secondary">
          {locationName}
        </Text>
      )}
    </div>
  )
}
