import type React from 'react'
import { Window } from '@/components/core/window'
import { defaultWindowProps } from '../constants'
import { AppStoreWrapper } from './store-wrapper'

function AppStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Window {...defaultWindowProps}>
      <AppStoreWrapper>{children}</AppStoreWrapper>
    </Window>
  )
}

export default AppStoreLayout
