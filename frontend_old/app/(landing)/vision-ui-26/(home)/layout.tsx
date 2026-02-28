import { Ornament, type OrnamentTabProps } from '@/components/core/v2/ornament'
import { AppStoreIcon, EnvironmentsIcon, PeopleIcon } from '@/components/icons'
import { generateUrl } from '../constants'

const tabs: OrnamentTabProps[] = [
  { name: 'Home', href: generateUrl(), icon: <AppStoreIcon className="size-6" data-slot="icon" /> },
  {
    name: 'People',
    href: generateUrl('people'),
    icon: <PeopleIcon className="size-6" data-slot="icon" />,
  },
  {
    name: 'Environments',
    href: generateUrl('environments'),
    icon: <EnvironmentsIcon className="size-6" data-slot="icon" />,
  },
]

export default function V2DemoLayout({ children }: { children: React.ReactNode }) {
  return <Ornament tabs={tabs}>{children}</Ornament>
}
