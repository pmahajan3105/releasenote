'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GlobeIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  ClockIcon,
  CopyIcon,
  RefreshCwIcon,
  TrashIcon,
  ExternalLinkIcon
} from 'lucide-react'

interface DomainSSLManagerProps {
  organizationId: string
}

interface DomainStatus {
  custom: string
  verified: boolean
  verifying: boolean
  verificationToken: string
  instructions: string[]
}

interface SSLStatus {
  enabled: boolean
  status: 'no_domain' | 'not_configured' | 'active' | 'expired' | 'expiring_soon'
  domain?: string
  expiresAt?: string
  daysUntilExpiry?: number
  autoRenew?: boolean
  issuedAt?: string
  message?: string
}

export function DomainSSLManager({ organizationId }: DomainSSLManagerProps) {
  const [domain, setDomain] = useState<DomainStatus>({
    custom: '',
    verified: false,
    verifying: false,
    verificationToken: '',
    instructions: []
  })

  const [ssl, setSSL] = useState<SSLStatus>({
    enabled: false,
    status: 'no_domain'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load current domain and SSL status
  useEffect(() => {
    loadDomainStatus()
    loadSSLStatus()
  }, [organizationId])

  const loadDomainStatus = async () => {
    try {
      // In a real implementation, this would fetch from the domain API
      // For demo purposes, we'll use mock data
      setDomain({
        custom: 'releases.example.com',
        verified: true,
        verifying: false,
        verificationToken: 'abc123def456',
        instructions: []
      })
    } catch (error) {
      console.error('Failed to load domain status:', error)
    }
  }

  const loadSSLStatus = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/ssl`)
      const data = await response.json()
      
      if (response.ok) {
        setSSL(data.ssl)
      } else {
        setError(data.error || 'Failed to load SSL status')
      }
    } catch (error) {
      console.error('Failed to load SSL status:', error)
      setError('Failed to load SSL status')
    }
  }

  const handleDomainSubmit = async () => {
    if (!domain.custom.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizations/${organizationId}/domain`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.custom }),
      })

      const data = await response.json()

      if (response.ok) {
        setDomain({
          ...domain,
          verified: false,
          verifying: true,
          verificationToken: data.verification.token,
          instructions: data.verification.instructions
        })
      } else {
        setError(data.error || 'Failed to configure domain')
      }
    } catch (error) {
      setError('Failed to configure domain')
    } finally {
      setLoading(false)
    }
  }

  const handleDomainVerify = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizations/${organizationId}/domain/verify`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setDomain({
          ...domain,
          verified: true,
          verifying: false
        })
        // Reload SSL status after domain verification
        loadSSLStatus()
      } else {
        setError(data.error || 'Domain verification failed')
      }
    } catch (error) {
      setError('Domain verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm('Are you sure you want to remove the custom domain? This will also remove any SSL certificates.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizations/${organizationId}/domain`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDomain({
          custom: '',
          verified: false,
          verifying: false,
          verificationToken: '',
          instructions: []
        })
        setSSL({
          enabled: false,
          status: 'no_domain'
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove domain')
      }
    } catch (error) {
      setError('Failed to remove domain')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableSSL = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizations/${organizationId}/ssl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider: 'letsencrypt',
          autoRenew: true 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSSL(data.ssl)
      } else {
        setError(data.error || 'Failed to enable SSL')
      }
    } catch (error) {
      setError('Failed to enable SSL')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSSL = async () => {
    if (!confirm('Are you sure you want to remove the SSL certificate?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizations/${organizationId}/ssl`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSSL({
          enabled: false,
          status: 'not_configured',
          domain: domain.custom
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove SSL')
      }
    } catch (error) {
      setError('Failed to remove SSL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSSLStatusBadge = () => {
    switch (ssl.status) {
      case 'active':
        return <Badge className="bg-green-600 text-white"><CheckCircleIcon className="w-3 h-3 mr-1" />Active</Badge>
      case 'expiring_soon':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><AlertTriangleIcon className="w-3 h-3 mr-1" />Expiring Soon</Badge>
      case 'expired':
        return <Badge variant="destructive"><XCircleIcon className="w-3 h-3 mr-1" />Expired</Badge>
      case 'not_configured':
        return <Badge variant="outline"><ClockIcon className="w-3 h-3 mr-1" />Not Configured</Badge>
      default:
        return <Badge variant="outline"><XCircleIcon className="w-3 h-3 mr-1" />Not Available</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Custom Domain Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeIcon className="w-5 h-5" />
            Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!domain.verified ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="releases.yourcompany.com"
                  value={domain.custom}
                  onChange={(e) => setDomain({ ...domain, custom: e.target.value })}
                  disabled={loading || domain.verifying}
                />
                <Button 
                  onClick={handleDomainSubmit}
                  disabled={loading || !domain.custom.trim() || domain.verifying}
                >
                  Configure
                </Button>
              </div>

              {domain.verifying && (
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangleIcon className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Domain verification required</strong>
                      <br />
                      Add the following TXT record to your DNS settings:
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-3 rounded border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">_releasenotes-verify.{domain.custom}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`_releasenotes-verify.${domain.custom}`)}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{domain.verificationToken}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(domain.verificationToken)}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleDomainVerify} disabled={loading}>
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Verify Domain
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{domain.custom}</span>
                  <Badge className="bg-green-600 text-white">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${domain.custom}`, '_blank')}
                  >
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    Visit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveDomain}
                    disabled={loading}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              
              <Alert>
                <CheckCircleIcon className="w-4 h-4" />
                <AlertDescription>
                  Your custom domain is configured and verified. Release notes will be available at{' '}
                  <strong>https://{domain.custom}</strong>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SSL Certificate Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            SSL Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!domain.verified ? (
            <Alert>
              <AlertTriangleIcon className="w-4 h-4" />
              <AlertDescription>
                SSL certificates require a verified custom domain. Please configure and verify your domain first.
              </AlertDescription>
            </Alert>
          ) : ssl.status === 'not_configured' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable SSL Certificate</p>
                  <p className="text-sm text-gray-600">
                    Automatically provision and manage SSL certificates for your custom domain.
                  </p>
                </div>
                <Button onClick={handleEnableSSL} disabled={loading}>
                  Enable SSL
                </Button>
              </div>
              
              <Alert>
                <ShieldCheckIcon className="w-4 h-4" />
                <AlertDescription>
                  SSL certificates are provided by Let's Encrypt and automatically renewed every 90 days.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ssl.domain}</span>
                  {getSSLStatusBadge()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSSL}
                  disabled={loading}
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>

              {ssl.status === 'active' && ssl.expiresAt && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Expires:</span>
                    <br />
                    <span>{formatDate(ssl.expiresAt)}</span>
                    {ssl.daysUntilExpiry && (
                      <span className="text-gray-600"> ({ssl.daysUntilExpiry} days)</span>
                    )}
                  </div>
                  {ssl.issuedAt && (
                    <div>
                      <span className="font-medium">Issued:</span>
                      <br />
                      <span>{formatDate(ssl.issuedAt)}</span>
                    </div>
                  )}
                </div>
              )}

              {ssl.autoRenew !== undefined && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Auto-renew</span>
                    <p className="text-sm text-gray-600">
                      Automatically renew certificates before expiration
                    </p>
                  </div>
                  <Switch checked={ssl.autoRenew} disabled />
                </div>
              )}

              {ssl.status === 'expiring_soon' && (
                <Alert>
                  <AlertTriangleIcon className="w-4 h-4" />
                  <AlertDescription>
                    Your SSL certificate is expiring soon. It will be automatically renewed if auto-renew is enabled.
                  </AlertDescription>
                </Alert>
              )}

              {ssl.status === 'expired' && (
                <Alert variant="destructive">
                  <XCircleIcon className="w-4 h-4" />
                  <AlertDescription>
                    Your SSL certificate has expired. Enable auto-renew to prevent this in the future.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}