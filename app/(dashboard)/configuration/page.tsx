'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { toast, Toaster } from 'react-hot-toast'

import { useAuthStore, useAuthSelectors } from '@/lib/store'

// Type for organization settings
type OrgSettings = {
  companyDetails?: string
  ai_tone?: string
}

export default function ConfigurationPage() {
  const supabase = createClientComponentClient()
  const user = useAuthStore((state) => state.user)
  const { isLoading: authLoading } = useAuthSelectors()
  const orgId = user?.id

  const [settings, setSettings] = useState<OrgSettings>({ companyDetails: '', ai_tone: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      if (data?.settings) {
        setSettings({
          companyDetails: data.settings.companyDetails || '',
          ai_tone: data.settings.ai_tone || '',
        })
      } else {
        setSettings({ companyDetails: '', ai_tone: '' })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load settings'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [orgId, supabase])

  useEffect(() => {
    if (!authLoading) fetchSettings()
  }, [authLoading, fetchSettings])

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  // Handle save
  const handleSave = async () => {
    if (!orgId) return
    setIsSaving(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ settings, updated_at: new Date().toISOString() })
        .eq('id', orgId)
      if (updateError) throw updateError
      const successText = 'Settings saved successfully!'
      setSuccessMessage(successText)
      toast.success(successText)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save settings'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuration
        </h1>
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Error: {error}
            </p>
          </div>
        )}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </div>
        )}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="companyDetails"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Company Details
            </label>
            <textarea
              id="companyDetails"
              name="companyDetails"
              rows={3}
              value={settings.companyDetails}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Brief description of your company/product."
              disabled={isSaving}
            />
          </div>
          <div>
            <label
              htmlFor="ai_tone"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              AI Tone
            </label>
            <select
              id="ai_tone"
              name="ai_tone"
              value={settings.ai_tone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSaving}
            >
              <option value="">Default (Neutral)</option>
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
              <option value="technical">Technical</option>
              <option value="marketing-friendly">Marketing-Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
