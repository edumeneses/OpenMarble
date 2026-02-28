import './global.css'

import { RootProvider } from 'fumadocs-ui/provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import ReactScan from './(landing)/react-scan'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata = {
  title: 'Vision UI',
  description: 'UI Experiment for Vision OS',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
} satisfies Metadata

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <ReactScan />
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
        }}
      >
        <RootProvider
          theme={{
            themes: ['dark'],
            defaultTheme: 'dark',
            enableColorScheme: false,
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
