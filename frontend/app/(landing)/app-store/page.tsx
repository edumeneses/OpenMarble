'use client'

import { ChevronRight, Clock } from 'lucide-react'
import Image from 'next/image'
import { Alert } from '@/components/core/alert'
import { Button, ButtonGroup } from '@/components/core/button'
import { Hoverable } from '@/components/core/hoverable'
import { NavigationBar, NavigationBarTitle } from '@/components/core/navigation-bar'
import { HeroDropdownMenu } from '@/components/landing/hero-dropdown-menu'
import { Text } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import acmeSky from '@/public/assets/acme-sky.jpg'

const connectorApps = [
  {
    name: 'IsaacSim Connector',
    description: 'Build robotics environments',
    color: 'from-green-600 to-green-900',
    initials: 'IS',
  },
  {
    name: 'Unreal Engine Connector',
    description: 'Design immersive game worlds',
    color: 'from-blue-600 to-blue-900',
    initials: 'UE',
  },
  {
    name: 'Unity 3D Connector',
    description: 'Ship cross-platform experiences',
    color: 'from-purple-600 to-purple-900',
    initials: 'U3',
  },
  {
    name: 'Blender 3D Connector',
    description: 'Sculpt & animate 3D assets',
    color: 'from-orange-600 to-orange-900',
    initials: 'BL',
  },
  {
    name: 'VisionOS Connector',
    description: 'Stream to Apple Vision Pro',
    color: 'from-indigo-600 to-indigo-900',
    initials: 'VS',
  },
]

export default function AppStorePage() {
  return (
    <>
      <div className="relative isolate mb-4 flex-1">
        <NavigationBar className="sticky">
          <NavigationBarTitle variant="leading">MarbleOS App Store</NavigationBarTitle>
          <ButtonGroup>
            <HeroDropdownMenu />
          </ButtonGroup>
        </NavigationBar>
        <Image
          src={acmeSky}
          alt="Google Maps Connector"
          className={cn(
            'absolute inset-0 z-[-2] h-[550px] w-full flex-shrink-0 object-cover',
            '[mask-image:linear-gradient(to_top,transparent,black_150px)]'
          )}
        />
        <div className="flex max-w-md flex-col items-start gap-2 px-12">
          <Text size="subheadline" className="uppercase">
            Editor's Choice
          </Text>
          <Text size="XLTitle2" className="text-start leading-tight">
            Explore the <br /> MarbleOS Ecosystem
          </Text>
          <Text size="body" className="text-start" variant="secondary">
            Connect your favorite tools and platforms to the MarbleOS ecosystem.
          </Text>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-black/30 p-4 backdrop-blur backdrop-saturate-150">
            <div>
              <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/40">
                <Text size="title3">GM</Text>
              </div>
            </div>
            <div className="flex min-w-[200px] flex-col gap-1">
              <Text size="title3" className="text-start">
                Google Maps Connector
              </Text>
              <Text size="caption1" className="text-start" variant="secondary">
                Explore the world with immersive spatial maps
              </Text>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="default" className="w-[86px]">
                Installed
              </Button>
              <Text className="text-center text-[10px]" variant="tertiary">
                Free
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-[1] mt-4 flex flex-col gap-2 px-6">
        <div className="flex items-center justify-start gap-2">
          <Text size="title3">Get Started</Text>
          <ChevronRight className="size-4 text-foreground/80" />
        </div>

        <div className="relative z-[1] grid grid-cols-3 gap-4">
          {connectorApps.map((app) => (
            <Hoverable
              key={app.name}
              className="flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-gray-300/10 p-3"
              onClick={() =>
                Alert.alert(
                  'Coming Soon',
                  `${app.name} is not yet available. Stay tuned for updates!`,
                  [{ text: 'OK', style: 'primary' }]
                )
              }
            >
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br',
                  app.color
                )}
              >
                <Text size="footnote" className="font-semibold">
                  {app.initials}
                </Text>
              </div>
              <Text size="caption2" className="text-center leading-tight">
                {app.name}
              </Text>
              <Text size="caption2" className="text-center leading-tight text-foreground/50">
                {app.description}
              </Text>
              <Button variant="secondary" className="h-6 px-3 text-xs" onClick={(e) => e.stopPropagation()}>
                Open
              </Button>
            </Hoverable>
          ))}
          <Hoverable
            className="flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-gray-300/10 p-3"
            onClick={() =>
              Alert.alert('Coming Soon', 'More connectors are on the way. Stay tuned!', [
                { text: 'OK', style: 'primary' },
              ])
            }
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-gray-500/30">
              <Clock className="size-6 text-foreground/50" />
            </div>
            <Text size="caption2" className="text-center leading-tight text-foreground/50">
              Coming Soon
            </Text>
            <Button variant="secondary" className="h-6 px-3 text-xs" disabled>
              Soon
            </Button>
          </Hoverable>
        </div>
      </div>
    </>
  )
}
