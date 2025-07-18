'use client'
import React from 'react'
import EnhancedSidebar from '../../components/sidebar-enhanced'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
        <EnhancedSidebar />
      </div>

      {/* Main content */}
      <main className="py-10 lg:pl-48">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 