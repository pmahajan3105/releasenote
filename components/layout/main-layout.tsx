'use client'

import React from 'react'
import { Sidebar } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}