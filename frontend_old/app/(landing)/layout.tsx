import { Cursor } from '@/components/core/cursor'
import Environment from '@/components/environment'

function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Environment>{children}</Environment>
    </>
  )
}

export default LandingLayout
