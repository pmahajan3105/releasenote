'use client' // Top-level layout often needs client-side hooks for interactivity

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore, useAuthSelectors, useAuthActions } from '@/lib/store'

// Import icons (assuming heroicons is installed, adjust if using another library)
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Release Notes', href: '/releases', icon: DocumentTextIcon }, // Note: Changed from /dashboard/releases to /releases for brevity
  { name: 'Configuration', href: '/configuration', icon: Cog6ToothIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }, // Re-using Cog icon for Settings
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isLoading: loading } = useAuthSelectors()
  const { signOut } = useAuthActions()
  const user = useAuthStore((state) => state.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return <div>Loading user information...</div> // Or a proper skeleton loader
  }

  if (!user) {
    // This should ideally be handled by middleware, but as a fallback:
    // No need to redirect here as middleware should handle it.
    // You might want to show a message or redirect explicitly if needed.
    return <div>Redirecting to login...</div>;
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center bg-primary-700 px-4">
        {/* Your Logo Here */}
        <span className="text-white font-semibold text-xl">ReleaseNoteAI</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const current = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        current
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-200 hover:text-white hover:bg-primary-700',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          current ? 'text-white' : 'text-primary-200 group-hover:text-white',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <button
              onClick={signOut}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200 hover:bg-primary-700 hover:text-white"
            >
              <ArrowLeftOnRectangleIcon
                className="h-6 w-6 shrink-0 text-primary-200 group-hover:text-white"
                aria-hidden="true"
              />
              Sign out
            </button>
            <div className="p-2 mt-2 text-xs text-primary-300 truncate">
              {user?.email}
            </div>
          </li>
        </ul>
      </nav>
    </>
  )

  return (
    <div>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)}></div>

        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            {/* Close button */}
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            {/* Sidebar component */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden dark:bg-gray-800">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-300" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white">Dashboard</div>
        {/* You might add user avatar/menu here for mobile too */}
      </div>

      {/* Main content area */}
      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Your page content */}
          {children}
        </div>
      </main>
    </div>
  )
} 