import './globals.css'
import '@/components/editor/prism-theme.css'
import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { PrismLoader } from '@/components/editor/prism-loader'
import { initializeDatabaseOptimization } from '@/lib/database-config'
import '@/lib/startup-validation' // Run startup validation
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google'

// Initialize database optimization on server startup
if (typeof window === 'undefined') {
  initializeDatabaseOptimization()
}

export const metadata: Metadata = {
  title: 'Release Notes Generator',
  description: 'Generate and manage release notes for your software projects',
}

import { SpeedInsights } from "@vercel/speed-insights/next";

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <PrismLoader />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  )
} 
