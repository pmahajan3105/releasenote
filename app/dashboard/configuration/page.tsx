'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore, useAuthSelectors } from '@/lib/store'

import { toast } from '@/lib/toast'
import { handleApiError, handleAsyncOperation } from '@/lib/error-handler-standard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
      <Card className="dark:bg-gray-800 rounded-lg shadow">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="companyDetails">
                Company Details
              </Label>
              <Textarea
                id="companyDetails"
                name="companyDetails"
                rows={3}
                value={settings.companyDetails}
                onChange={handleChange}
                className="mt-1"
                placeholder="Brief description of your company/product."
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="ai_tone">
                AI Tone
              </Label>
              <Select
                value={settings.ai_tone || ""}
                onValueChange={(value) => setSettings(prev => ({ ...prev, ai_tone: value }))}
                disabled={isSaving}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Default (Neutral)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default (Neutral)</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="marketing-friendly">Marketing-Friendly</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}