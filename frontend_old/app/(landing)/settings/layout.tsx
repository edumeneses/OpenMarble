import { IconBellRingingFilled, IconHourglassHigh, IconMoonFilled } from '@tabler/icons-react'
import { Dialog, WithDialogEffect } from '@/components/core/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/core/sidebar'
import { Window } from '@/components/core/window'
import { AppStoreIcon, CogIcon, EnvironmentsIcon, PeopleIcon } from '@/components/icons'
import { Text } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { defaultWindowProps } from '../constants'
import { DebugModeSwitch } from './debug-mode-switch'

const section_1 = [
  {
    title: 'General',
    icon: CogIcon,
    gradient: 'from-gray-400 to-gray-600',
    isActive: true,
  },
  {
    title: 'Apps',
    icon: AppStoreIcon,
    gradient: 'from-sky-500 to-blue-700',
  },
  {
    title: 'People',
    icon: PeopleIcon,
    gradient: 'from-green-400 to-green-600',
  },
  {
    title: 'Environments',
    icon: EnvironmentsIcon,
    gradient: 'from-indigo-400 to-indigo-800',
  },
]

const section_2 = [
  {
    title: 'Notifications',
    icon: IconBellRingingFilled,
    gradient: 'from-rose-400 to-red-600',
  },
  {
    title: 'Focus',
    href: '#',
    icon: IconMoonFilled,
    gradient: 'from-indigo-400 to-indigo-800',
  },
  {
    title: 'Screen Time',
    href: '#',
    icon: IconHourglassHigh,
    gradient: 'from-indigo-400 to-indigo-800',
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      {/* Wrap the content that should scale down when dialog opens */}
      <WithDialogEffect>
        <Window {...defaultWindowProps}>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <SidebarInput placeholder="Search" />
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section_1.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            className="gap-4 px-[22px] [&_[data-slot='icon']]:opacity-75"
                            isActive={item.isActive}
                          >
                            <item.icon data-slot="icon" />
                            <span
                              className={cn(
                                'absolute top-2 left-3.5 z-[-1] size-10 rounded-full',
                                'bg-gradient-to-b',
                                item.gradient
                              )}
                            />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="pt-0">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section_2.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton className="gap-4 px-[22px] [&_[data-slot='icon']]:opacity-75">
                            <item.icon data-slot="icon" />
                            <span
                              className={cn(
                                'absolute top-2 left-3.5 z-[-1] size-10 rounded-full',
                                'bg-gradient-to-b',
                                item.gradient
                              )}
                            />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem className="gap- flex items-center justify-between p-2">
                    <Text variant="secondary" size="callout">
                      Debug Mode
                    </Text>
                    <DebugModeSwitch />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <main className="relative w-full">{children}</main>
          </SidebarProvider>
        </Window>
      </WithDialogEffect>
    </Dialog>
  )
}
