'use client'

import React from 'react'
import { useAuthStore, useAuthSelectors } from '@/lib/store'
import Link from 'next/link'

export default function SettingsPage() {
  const user = useAuthStore(state => state.user)
  const { isLoading: authLoading } = useAuthSelectors()

  if (authLoading) {
    return <div className="p-6">Loading settings...</div>
  }
  if (!user) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Configure default templates, user preferences, and other settings.
      </p>
      {/* Placeholder for default template selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Default Release Note Template</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Template management coming soon.</p>
        <Link href="/dashboard/settings" className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          Manage templates &rarr;
        </Link>
      </div>
    </div>
  )
}
