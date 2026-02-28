import { AlertProvider } from '@/components/core/v2'

export default function V2DemoLayout({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children} </AlertProvider>
}
