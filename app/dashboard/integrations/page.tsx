'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  TestTubeIcon,
  XCircleIcon,
} from 'lucide-react'

type IntegrationType = 'github' | 'jira' | 'linear'

type IntegrationRow = {
  id: string
  type: string
  created_at: string | null
  is_active: boolean | null
}

type IntegrationDefinition = {
  type: IntegrationType
  name: string
  description: string
  icon: string
  connectUrl: string
  testEndpoint: string
}

type IntegrationStatus = 'active' | 'error' | 'pending'

type IntegrationCard = IntegrationDefinition & {
  id: string
  connected: boolean
  connectedAt: string | null
  status: IntegrationStatus
  stats?: string
}

const INTEGRATIONS: IntegrationDefinition[] = [
  {
    type: 'github',
    name: 'GitHub',
    description: 'Import pull requests and commits for automated release notes.',
    icon: '🐙',
    connectUrl: '/api/auth/github',
    testEndpoint: '/api/integrations/github/repositories?per_page=1',
  },
  {
    type: 'jira',
    name: 'Jira',
    description: 'Sync Jira issues to power AI-assisted release notes.',
    icon: '🔷',
    connectUrl: '/api/auth/jira',
    testEndpoint: '/api/integrations/jira/projects?maxResults=1',
  },
  {
    type: 'linear',
    name: 'Linear',
    description: 'Import Linear issues to power AI-assisted release notes.',
    icon: '📐',
    connectUrl: '/api/auth/linear',
    testEndpoint: '/api/integrations/linear/teams?first=1&includeArchived=false',
  },
]

function mapOAuthSuccessMessage(value: string) {
  switch (value) {
    case 'github_connected':
      return 'GitHub connected successfully.'
    case 'jira_connected':
      return 'Jira connected successfully.'
    case 'linear_connected':
      return 'Linear connected successfully.'
    default:
      return 'Integration connected successfully.'
  }
}

export default function DashboardIntegrationsPage() {
  const supabase = createClientComponentClient()
  const user = useAuthStore((state) => state.user)
  const [cards, setCards] = useState<IntegrationCard[]>([])
  const [loading, setLoading] = useState(true)
  const [testingType, setTestingType] = useState<IntegrationType | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const cardIndexByType = useMemo(() => {
    const map = new Map<IntegrationType, number>()
    cards.forEach((card, idx) => map.set(card.type, idx))
    return map
  }, [cards])

  const loadIntegrations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { data, error: loadError } = await supabase
        .from('integrations')
        .select('id,type,created_at,is_active')
        .eq('organization_id', user.id)

      if (loadError) throw loadError

      const rows = (data ?? []) as IntegrationRow[]

      const nextCards: IntegrationCard[] = INTEGRATIONS.map((definition) => {
        const row = rows.find((candidate) => candidate.type === definition.type)
        const connected = Boolean(row?.id) && row?.is_active !== false

        return {
          ...definition,
          id: row?.id ?? definition.type,
          connected,
          connectedAt: row?.created_at ?? null,
          status: connected ? 'pending' : 'pending',
        }
      })

      setCards(nextCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      void loadIntegrations()
    }
  }, [loadIntegrations, user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('error')
    const oauthSuccess = params.get('success')

    if (oauthError) {
      setError(oauthError)
    } else if (oauthSuccess) {
      setSuccess(mapOAuthSuccessMessage(oauthSuccess))
    }

    if (oauthError || oauthSuccess) {
      params.delete('error')
      params.delete('success')
      const nextQuery = params.toString()
      const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname
      window.history.replaceState({}, '', nextUrl)
    }
  }, [])

  const handleConnect = (integration: IntegrationCard) => {
    window.location.href = integration.connectUrl
  }

  const updateCard = useCallback(
    (type: IntegrationType, updater: (card: IntegrationCard) => IntegrationCard) => {
      const idx = cardIndexByType.get(type)
      if (idx === undefined) return
      setCards((prev) => prev.map((card, index) => (index === idx ? updater(card) : card)))
    },
    [cardIndexByType]
  )

  const handleTest = async (integration: IntegrationCard) => {
    if (!integration.connected) return

    setTestingType(integration.type)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(integration.testEndpoint)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = typeof data?.error === 'string' ? data.error : response.statusText
        throw new Error(message || 'Test failed')
      }

      const data = await response.json().catch(() => ({}))
      let stats: string | undefined
      if (integration.type === 'github') {
        const count = Array.isArray(data?.repositories) ? data.repositories.length : undefined
        stats = typeof count === 'number' ? `${count} repo(s) returned` : undefined
      }
      if (integration.type === 'jira') {
        const count = Array.isArray(data?.projects) ? data.projects.length : undefined
        stats = typeof count === 'number' ? `${count} project(s) returned` : undefined
      }
      if (integration.type === 'linear') {
        const count = Array.isArray(data?.teams) ? data.teams.length : undefined
        stats = typeof count === 'number' ? `${count} team(s) returned` : undefined
      }

      updateCard(integration.type, (card) => ({
        ...card,
        status: 'active',
        stats,
      }))
      setSuccess(`${integration.name} connection looks good.`)
    } catch (err) {
      updateCard(integration.type, (card) => ({
        ...card,
        status: 'error',
        stats: undefined,
      }))
      setError(`${integration.name} test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setTestingType(null)
    }
  }

  const handleDisconnect = async (integration: IntegrationCard) => {
    if (!user || !integration.connected) return

    setError('')
    setSuccess('')

    try {
      const { error: deleteError } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integration.id)
        .eq('organization_id', user.id)

      if (deleteError) throw deleteError

      setSuccess(`${integration.name} disconnected.`)
      await loadIntegrations()
    } catch (err) {
      setError(`Failed to disconnect ${integration.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getStatusIcon = (integration: IntegrationCard) => {
    if (!integration.connected) return null

    switch (integration.status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pt-2 pb-12 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-[#101828] mb-2">Integrations</h1>
        <p className="text-[#667085]">
          Connect GitHub, Jira, or Linear, then generate publish-ready release notes.
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[#101828]">Available Integrations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((integration) => (
            <Card key={integration.type} className="border-[#e4e7ec] hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{integration.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={
                            integration.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {integration.connected ? 'Connected' : 'Not Connected'}
                        </Badge>
                        {getStatusIcon(integration)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-[#667085]">{integration.description}</p>

                {integration.connected && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1 text-sm">
                      {integration.connectedAt && (
                        <div className="flex justify-between">
                          <span className="text-[#667085]">Connected:</span>
                          <span className="text-[#101828]">{new Date(integration.connectedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {integration.stats && (
                        <div className="flex justify-between">
                          <span className="text-[#667085]">Last test:</span>
                          <span className="text-[#101828]">{integration.stats}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {integration.connected ? (
                    <>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={testingType === integration.type}
                          onClick={() => handleTest(integration)}
                        >
                          <TestTubeIcon className="h-4 w-4 mr-2" />
                          {testingType === integration.type ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration)}>
                          Disconnect
                        </Button>
                      </div>

                      <Link href="/dashboard/releases/new/ai" className="w-full">
                        <Button className="w-full bg-[#7F56D9] text-white hover:bg-[#6941C6]">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Generate Release Notes
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration)}
                      className="w-full bg-[#7F56D9] text-white hover:bg-[#6941C6]"
                    >
                      Connect {integration.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-[#e4e7ec]">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-[#667085]">
              If you&apos;re having trouble connecting, confirm your OAuth app settings and permissions for the provider.
            </p>
            <div className="pt-2">
              <Link href="/dashboard/settings" className="text-[#7F56D9] hover:text-[#6941C6] text-sm">
                View Settings →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

