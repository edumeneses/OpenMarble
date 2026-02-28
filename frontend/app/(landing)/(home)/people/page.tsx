import Link from 'next/link'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'

export default function PeoplePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <Text variant="secondary" size="XLTitle2">
        Coming Soon...
      </Text>
      <Link href="/docs">
        <Button>View Docs</Button>
      </Link>
      <p className="text-xs opacity-50">
        Created by{' '}
        <Link
          href="https://twitter.com/useOptimistic"
          className="font-semibold text-fd-foreground underline"
        >
          Oliver
        </Link>
        <br />
        Docs powered by{' '}
        <Link
          href="https://fumadocs.vercel.app/"
          className="font-semibold text-fd-foreground underline"
        >
          Fumadocs
        </Link>
      </p>
    </div>
  )
}
