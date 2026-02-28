'use client'

import Image, { type StaticImageData } from 'next/image'
import { useRouter } from 'next/navigation'
import { ButtonGroup } from '../../../components/core/button'
import { NavigationBar, NavigationBarTitle } from '../../../components/core/navigation-bar'
import { HeroDropdownMenu } from '../../../components/landing/hero-dropdown-menu'
import { Text } from '../../../components/ui/typography'

import img1 from './unsplash/aaron-burden-unsplash.avif'
import img2 from './unsplash/aaron-burden-unsplash-2.avif'
import img3 from './unsplash/clement-m-unsplash.avif'
import img4 from './unsplash/damiano-baschiera-unsplash.avif'
import img5 from './unsplash/dominik-schroder-unsplash.avif'
import img6 from './unsplash/kenrick-mills-unsplash.avif'
import img7 from './unsplash/matthew-smith-unsplash.avif'
import img8 from './unsplash/shifaaz-shamoon-unsplash.avif'
import img9 from './unsplash/wil-stewart-unsplash.avif'
import img10 from './unsplash/michael-olsen-unsplash.avif'

interface World {
  id: string
  name: string
  thumbnail: StaticImageData
  /** PLY file URL — empty string until real worlds are generated */
  plyUrl: string
}

const WORLDS_BY_CATEGORY: Record<string, World[]> = {
  stylized: [
    { id: 'stylized-1', name: 'Neon Alley', thumbnail: img1, plyUrl: '' },
    { id: 'stylized-2', name: 'Watercolor Gardens', thumbnail: img6, plyUrl: '' },
  ],
  interior: [
    { id: 'interior-1', name: 'Cozy Loft', thumbnail: img2, plyUrl: '' },
    { id: 'interior-2', name: 'Warm Studio', thumbnail: img7, plyUrl: '' },
  ],
  exterior: [
    { id: 'exterior-1', name: 'Misty Valley', thumbnail: img3, plyUrl: '' },
    { id: 'exterior-2', name: 'Sunset Cliffs', thumbnail: img4, plyUrl: '' },
    { id: 'exterior-3', name: 'Alpine Meadow', thumbnail: img5, plyUrl: '' },
  ],
  fantasy: [
    { id: 'fantasy-1', name: 'Crystal Lagoon', thumbnail: img8, plyUrl: '' },
    { id: 'fantasy-2', name: 'Enchanted Forest', thumbnail: img9, plyUrl: '' },
  ],
  'sci-fi': [
    { id: 'scifi-1', name: 'Orbital Station', thumbnail: img10, plyUrl: '' },
    { id: 'scifi-2', name: 'Quantum Lab', thumbnail: img1, plyUrl: '' },
  ],
}

const CATEGORY_LABELS: Record<string, string> = {
  stylized: 'Stylized',
  interior: 'Interior',
  exterior: 'Exterior',
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
}

function WorldGrid({ category }: { category: string }) {
  const router = useRouter()
  const worlds = WORLDS_BY_CATEGORY[category] ?? []
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <>
      <NavigationBar>
        <div />
        <NavigationBarTitle>{label}</NavigationBarTitle>
        <ButtonGroup>
          <HeroDropdownMenu />
        </ButtonGroup>
      </NavigationBar>

      {worlds.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <Text variant="tertiary" size="callout">
            No worlds yet in this category
          </Text>
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-3 px-4 py-4">
          {worlds.map((world) => (
            <button
              key={world.id}
              onClick={() =>
                router.push(
                  world.plyUrl
                    ? `/openmarble/viewer?ply=${encodeURIComponent(world.plyUrl)}`
                    : '/openmarble/viewer',
                )
              }
              className="group relative overflow-hidden rounded-2xl bg-white/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={world.thumbnail}
                  alt={world.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="truncate text-sm font-semibold text-white drop-shadow">
                    {world.name}
                  </p>
                  {!world.plyUrl && (
                    <p className="mt-0.5 text-[10px] font-medium text-white/50">Coming soon</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export { WorldGrid }
