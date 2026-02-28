'use client'

import { useAtom } from 'jotai'
import { Switch } from '@/components/core/switch'
import { debugModeAtom } from '@/lib/atoms'

export function DebugModeSwitch() {
  const [debugMode, setDebugMode] = useAtom(debugModeAtom)

  return <Switch checked={debugMode} onCheckedChange={setDebugMode} />
}
