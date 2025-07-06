import './globals.css'
import '@/components/editor/prism-theme.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MainLayout } from '@/components/layout/main-layout'
import { ErrorBoundary } from '@/components/error-boundary'
import { PrismLoader } from '@/components/editor/prism-loader'
import { initializeDatabaseOptimization } from '@/lib/database-config'

const inter = Inter({ subsets: ['latin'] })

// Initialize database optimization on server startup
if (typeof window === 'undefined') {
  initializeDatabaseOptimization()
}

export const metadata: Metadata = {
  title: 'Release Notes Generator',
  description: 'Generate and manage release notes for your software projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrismLoader />
        <ErrorBoundary>
          <MainLayout>
            {children}
          </MainLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
} 