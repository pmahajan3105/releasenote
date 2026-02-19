import React from 'react'
import { useAuthStore, useAuthSelectors } from '../../../lib/store'
import Link from 'next/link'
import { LogoFaviconUploader } from '../../../components/settings/logo-favicon-uploader'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { handleApiError, handleAsyncOperation } from '../../../lib/error-handler-standard'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { EmptyState } from '../../../components/ui/empty-state'
import { Button } from '../../../components/ui/button'
import { PlusIcon } from 'lucide-react'
import type { Template } from '@/types/database'

export default function SettingsPageComponent() {
    const user = useAuthStore(state => state.user)
    const { isLoading: authLoading } = useAuthSelectors()
    const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
    const [faviconUrl, setFaviconUrl] = React.useState<string | null>(null)
    const [templates, setTemplates] = React.useState<Template[]>([])
    const [defaultTemplateId, setDefaultTemplateId] = React.useState<string | null>(null)
    const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(false)
    const [isSavingTemplate, setIsSavingTemplate] = React.useState(false)
    const supabase = createClientComponentClient()

    React.useEffect(() => {
        if (!user?.id) return
        fetch(`/api/organizations/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setLogoUrl(data.logo_url || null)
                setFaviconUrl(data.favicon_url || null)
                const settings = data.settings || {}
                setDefaultTemplateId(settings.default_template_id || null)
            })
    }, [user?.id])

    React.useEffect(() => {
        if (!user?.id) return
        setIsLoadingTemplates(true)
        handleAsyncOperation(
            fetch('/api/templates').then(res => res.json()),
            'Loading templates',
            'SettingsPage'
        )
            .then(data => {
                setTemplates(data.templates || [])
            })
            .catch(err => {
                handleApiError(err, 'fetch templates', 'SettingsPage')
            })
            .finally(() => setIsLoadingTemplates(false))
    }, [user?.id])

    const handleSaveDefaultTemplate = async (templateId: string) => {
        if (!user?.id) return
        setIsSavingTemplate(true)
        try {
            await handleAsyncOperation(
                (async () => {
                    const { data: org, error: fetchError } = await supabase
                        .from('organizations')
                        .select('settings')
                        .eq('id', user.id)
                        .single()
                    if (fetchError) throw fetchError
                    const currentSettings = org.settings || {}
                    const newSettings = {
                        ...currentSettings,
                        default_template_id: templateId
                    }
                    const { error: updateError } = await supabase
                        .from('organizations')
                        .update({ settings: newSettings })
                        .eq('id', user.id)
                    if (updateError) throw updateError
                    return templateId
                })(),
                'Saving default template',
                'SettingsPage'
            )
            setDefaultTemplateId(templateId)
        } catch (error) {
            handleApiError(error, 'save default template', 'SettingsPage')
        } finally {
            setIsSavingTemplate(false)
        }
    }

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
            <Card>
                <CardHeader>
                    <CardTitle>Organization Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <LogoFaviconUploader
                        orgId={user.id}
                        logoUrl={logoUrl}
                        faviconUrl={faviconUrl}
                        onChange={(type, url) => {
                            if (type === 'logo') setLogoUrl(url)
                            else setFaviconUrl(url)
                        }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Default Release Note Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-500 dark:text-gray-400">
                        Choose a default template for new release notes. This can be overridden during creation.
                    </p>
                    {isLoadingTemplates ? (
                        <div className="text-gray-500 dark:text-gray-400">Loading templates...</div>
                    ) : (
                        <div className="space-y-4">
                            {templates.length === 0 ? (
                                <EmptyState
                                    icon={<span className="text-4xl">📝</span>}
                                    headline="No Templates Available"
                                    subtext="Create a template to use as the default for new release notes."
                                    action={
                                        <Link href="/dashboard/templates">
                                            <Button>
                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                Create Template
                                            </Button>
                                        </Link>
                                    }
                                />
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {templates.map((template) => (
                                            <div
                                                key={template.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${defaultTemplateId === template.id
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                                onClick={() => handleSaveDefaultTemplate(template.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">📝</span>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{template.content.slice(0, 120)}</p>
                                                        </div>
                                                    </div>
                                                    {defaultTemplateId === template.id && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-2 py-1 rounded">
                                                                Default
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href="/dashboard/templates"
                                            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                                        >
                                            Manage all templates &rarr;
                                        </Link>
                                        {isSavingTemplate && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Saving...</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Domain Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Domain Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DomainSettingsSection userId={user.id} />
                </CardContent>
            </Card>
        </div>
    )
}

// --- Domain Settings Section ---
function DomainSettingsSection({ userId }: { userId: string }) {
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    const [publicUrl, setPublicUrl] = React.useState('')
    const [customDomain, setCustomDomain] = React.useState('')
    const [saving, setSaving] = React.useState(false)
    React.useEffect(() => {
        setLoading(true)
        setError(null)
        setSuccess(null)
        fetch(`/api/organizations/${encodeURIComponent(userId)}/domain`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setPublicUrl(data.public_portal_url || '')
                setCustomDomain(data.custom_domain || '')
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [userId])

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const normalizedDomain = customDomain.trim()
            const endpoint = `/api/organizations/${encodeURIComponent(userId)}/domain`
            const res = normalizedDomain
                ? await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain: normalizedDomain })
                })
                : await fetch(endpoint, { method: 'DELETE' })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update domain')
            const refresh = await fetch(endpoint)
            const refreshData = await refresh.json()
            if (refresh.ok && !refreshData.error) {
                setPublicUrl(refreshData.public_portal_url || '')
                setCustomDomain(refreshData.custom_domain || '')
            }
            setSuccess(normalizedDomain ? 'Domain updated successfully.' : 'Custom domain removed.')
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to update domain')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-2">
            {loading ? (
                <span className="text-gray-500">Loading domain settings...</span>
            ) : error ? (
                <span className="text-red-500">{error}</span>
            ) : (
                <>
                    {success && (
                        <span className="text-green-600">{success}</span>
                    )}
                    <div>
                        <label className="block text-sm font-medium">Public Portal URL</label>
                        <input
                            className="w-full mt-1 rounded border px-3 py-2 bg-gray-100 text-gray-700"
                            value={publicUrl}
                            disabled
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Custom Domain</label>
                        <input
                            className="w-full mt-1 rounded border px-3 py-2"
                            value={customDomain}
                            onChange={e => setCustomDomain(e.target.value)}
                            placeholder="yourcompany.com"
                            disabled={saving}
                        />
                    </div>
                    <button
                        className="mt-2 px-4 py-2 rounded bg-primary-600 text-white disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Domain'}
                    </button>
                </>
            )}
        </div>
    )
}
