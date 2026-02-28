import type React from 'react'
import { AlertProvider } from '@/components/core/alert'
import { Window } from '@/components/core/window'
import { defaultWindowProps } from '../constants'
import { AppStoreWrapper } from './store-wrapper'

function AppStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Window {...defaultWindowProps}>
      <AlertProvider>
        <AppStoreWrapper>{children}</AppStoreWrapper>
      </AlertProvider>
    </Window>
  )
}

export default AppStoreLayout
