'use client'

import React from 'react'
import { useAuthStore, useAuthSelectors } from '@/lib/store'
import SettingsPageComponent from './SettingsPageComponent'

export default function SettingsPage() {
  const user = useAuthStore(state => state.user)
  const { isLoading: authLoading } = useAuthSelectors()

  if (authLoading) {
    return <div className="p-6">Loading settings...</div>
  }
  
  if (!user) {
    return null
  }

  return <SettingsPageComponent />
}