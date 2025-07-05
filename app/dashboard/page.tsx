'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome to Release Notes Generator! 👋
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Let's help you get started with generating release notes for your projects.
            </p>
          </div>

          {/* Quick Start Guide */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Start Guide
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Connect Your First Ticket Source
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Start by connecting your project management tool (GitHub Issues or Jira) to automatically fetch your tickets.
                  </p>
                  <Link
                    href="/integrations/new"
                    className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Connect Source →
                  </Link>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Configure Your First Project
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select which repository or project you want to generate release notes for.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Generate Your First Release Notes
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Once connected, you can start generating AI-powered release notes from your tickets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="rounded-lg bg-primary-50 p-6 dark:bg-primary-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  Need Help?
                </h3>
                <p className="mt-2 text-sm text-primary-700 dark:text-primary-300">
                  Check out our documentation or reach out to support if you need assistance getting started.
                </p>
                <div className="mt-3">
                  <Link
                    href="/docs"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    View Documentation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 