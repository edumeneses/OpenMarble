import Image from 'next/image'
import {
  type HoneycombItem,
  HoneycombLayout,
  honeycombIconClassName,
} from '@/components/core/grid-layout'
import appStoreIcon from '@/public/assets/landing/home/icon-app-store.avif'
import docsIcon from '@/public/assets/landing/home/icon-docs.avif'
import fumadocsIcon from '@/public/assets/landing/home/icon-fumadocs.avif'
import githubIcon from '@/public/assets/landing/home/icon-github.avif'
import photosIcon from '@/public/assets/landing/home/icon-photos.avif'
import settingsIcon from '@/public/assets/landing/home/icon-settings.avif'

const items: HoneycombItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    background: <div className="h-full w-full bg-[#2E2E2F]"></div>,
    icon: <Image src={settingsIcon} alt="Settings" className={honeycombIconClassName} />,
    href: '/settings',
  },
  {
    id: 'app-store',
    label: 'App Store',
    icon: <Image src={appStoreIcon} alt="App Store" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-blue-600 to-sky-400"></div>,
    href: '/app-store',
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: <Image src={photosIcon} alt="Photos" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-white"></div>,
    href: '/photos',
  },
  {
    id: 'github',
    label: 'Source Code',
    icon: <Image src={githubIcon} alt="Github" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#060606] to-[#333b40]"></div>,
    href: 'https://github.com/fluid-design-io/vision-ui',
  },
  {
    id: 'docs',
    label: 'API Docs',
    icon: <Image src={docsIcon} alt="Docs" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#FCC804] to-[#FFAC04]"></div>,
    href: '/docs',
  },
  {
    id: 'fumadocs',
    label: 'Fumadocs',
    icon: <Image src={fumadocsIcon} alt="Fumadocs" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#5A5962] to-[#151515]"></div>,
    href: 'https://fumadocs.vercel.app/',
  },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `test-${i}`,
    label: `Test ${i}`,
    background: <div className="h-full w-full bg-[#333333]"></div>,
    icon: <Image src={settingsIcon} alt="Settings" fill className={honeycombIconClassName} />,
    debug: true,
  })),
]

function HomeView() {
  return <HoneycombLayout items={items} />
}

export default HomeView
