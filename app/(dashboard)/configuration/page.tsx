'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore, useAuthSelectors } from '@/lib/store'

// Type for the organization settings
// Adjust based on your actual settings structure within the JSONB column
type OrgSettings = {
  companyDetails?: string
  ai_tone?: string
  // Add other settings like default template, etc.
}

export default function ConfigurationPage() {
  const supabase = createClientComponentClient()
  const user = useAuthStore((state) => state.user)
  const { isLoading: authLoading } = useAuthSelectors()
  
  const [settings, setSettings] = useState<OrgSettings>({ companyDetails: '', ai_tone: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Using user.id as organization ID for simplicity
      const orgId = user.id 

      const { data, error: fetchError } = await supabase
        .from('organizations') // Replace with your actual table name if different
        .select('settings')
        .eq('id', orgId) // Adjust field if org ID is different from user ID
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore row not found
        throw fetchError
      }

      if (data?.settings) {
        // Ensure defaults if fields are missing
        setSettings({
            companyDetails: data.settings.companyDetails || '',
            ai_tone: data.settings.ai_tone || '',
        });
      } else {
         // Set default empty state if no settings found
         setSettings({ companyDetails: '', ai_tone: '' });
      }

    } catch (err) {
      console.error('Failed to fetch settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!authLoading) {
      fetchSettings()
    }
  }, [authLoading, fetchSettings])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  // Handle saving settings
  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Using user.id as organization ID for simplicity
      const orgId = user.id 

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ 
            settings: settings, // Update the whole settings object
            updated_at: new Date().toISOString() // Optional: update timestamp
         })
        .eq('id', orgId)

      if (updateError) {
        throw updateError
      }

      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3s

    } catch (err) {
      console.error('Failed to save settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return <div className="p-6">Loading configuration...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuration</h1>
      
      {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
      )}
      {successMessage && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 space-y-6">
        {/* Company Details */}
        <div>
          <label htmlFor="companyDetails" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
            Company Details
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Brief description of your company/product for AI context.</p>
          <textarea
            id="companyDetails"
            name="companyDetails"
            rows={3}
            value={settings.companyDetails}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., We build innovative solutions for cloud infrastructure management."
            disabled={isSaving}
          />
        </div>

        {/* AI Tone */}
        <div>
          <label htmlFor="ai_tone" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
            AI Tone
          </label>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Default tone for AI-generated release notes.</p>
          {/* Example using a select, could also be a text input */}
          <select
            id="ai_tone"
            name="ai_tone"
            value={settings.ai_tone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSaving}
          >
            <option value="">Default (Neutral)</option>
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
            <option value="technical">Technical</option>
            <option value="marketing-friendly">Marketing-Friendly</option>
            <option value="concise">Concise</option>
            {/* Add more tones as needed */}
          </select>
          {/* Or use a text input: */}
          {/* <input
            type="text"
            name="ai_tone"
            id="ai_tone"
            value={settings.ai_tone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., friendly and slightly informal"
            disabled={isSaving}
          /> */}
        </div>

         {/* Placeholder for Default Template Selection */}
         {/* <div>
           <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Default Template</label>
           <p className="text-gray-600 dark:text-gray-400 mt-1">Template management coming soon.</p>
         </div> */}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
} 