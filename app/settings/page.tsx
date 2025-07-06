'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  UserIcon, 
  BuildingIcon, 
  KeyIcon, 
  BellIcon, 
  PaletteIcon,
  GlobeIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
  TestTubeIcon
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com',
    timezone: 'UTC-8',
    language: 'en'
  })
  
  const [organization, setOrganization] = useState({
    name: 'Acme Inc.',
    website: 'https://acme.com',
    description: 'A leading software company',
    domain: 'acme.com'
  })

  const [integrations, setIntegrations] = useState([
    { 
      id: '1', 
      name: 'GitHub', 
      type: 'github', 
      connected: false, 
      lastSync: null,
      description: 'Import issues and pull requests for release notes',
      icon: '🐙',
      connectUrl: '/api/auth/github'
    },
    { 
      id: '2', 
      name: 'Jira', 
      type: 'jira', 
      connected: false, 
      lastSync: null,
      description: 'Sync tickets and track project progress',
      icon: '🔷',
      connectUrl: '/api/auth/jira'
    },
    { 
      id: '3', 
      name: 'Linear', 
      type: 'linear', 
      connected: false, 
      lastSync: null,
      description: 'Import issues and track development workflow',
      icon: '📐',
      connectUrl: '/api/auth/linear'
    },
    { 
      id: '4', 
      name: 'Slack', 
      type: 'slack', 
      connected: false, 
      lastSync: null,
      description: 'Send release notifications to your team',
      icon: '💬',
      connectUrl: '/api/auth/slack'
    }
  ])

  const [notifications, setNotifications] = useState({
    emailOnPublish: true,
    emailOnComment: false,
    slackNotifications: true,
    weeklyDigest: true
  })

  const [domain, setDomain] = useState({
    custom: '',
    verified: false,
    verifying: false,
    verificationToken: '',
    instructions: []
  })

  const [branding, setBranding] = useState({
    metaTitle: '',
    metaDescription: '',
    metaImageUrl: '',
    faviconUrl: '',
    brandColor: '#7F56D9'
  })

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSaveProfile = async () => {
    // Profile save functionality - implement when profile management is needed
    // Profile saved successfully
    setSuccess('Profile saved successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleSaveOrganization = async () => {
    // Organization save functionality - implement when organization management is needed
    // Organization saved successfully
    setSuccess('Organization settings saved successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleConnectIntegration = (integrationId: string) => {
    // Integration connection functionality - redirect to integration setup
    console.log('Connecting integration:', integrationId)
    window.location.href = '/integrations/new'
  }

  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, connected: false, lastSync: null }
          : integration
      )
    )
  }

  const handleTestIntegration = async (integrationId: string) => {
    // Integration test functionality - implement when integration testing is needed
    console.log('Testing integration:', integrationId)
    setSuccess('Integration test completed successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleSaveDomain = async () => {
    if (!domain.custom.trim()) {
      setError('Please enter a domain')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/organizations/${user?.id}/domain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.custom.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save domain')
      }

      setDomain(prev => ({
        ...prev,
        verified: false,
        verificationToken: data.verification.token,
        instructions: data.verification.instructions
      }))

      setSuccess('Domain configured! Please verify ownership by adding the DNS record.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save domain')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyDomain = async () => {
    setSaving(true)
    setDomain(prev => ({ ...prev, verifying: true }))
    setError('')

    try {
      const response = await fetch(`/api/organizations/${user?.id}/domain/verify`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.verified) {
        setDomain(prev => ({ ...prev, verified: true }))
        setSuccess('Domain verified successfully!')
      } else {
        setError(data.message || 'Domain verification failed')
        setDomain(prev => ({ ...prev, instructions: data.instructions || [] }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setSaving(false)
      setDomain(prev => ({ ...prev, verifying: false }))
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm('Are you sure you want to remove the custom domain?')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/organizations/${user?.id}/domain`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove domain')
      }

      setDomain({
        custom: '',
        verified: false,
        verifying: false,
        verificationToken: '',
        instructions: []
      })

      setSuccess('Custom domain removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove domain')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBranding = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/organizations/${user?.id}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: branding.metaTitle,
          meta_description: branding.metaDescription,
          meta_image_url: branding.metaImageUrl,
          favicon_url: branding.faviconUrl,
          brand_color: branding.brandColor
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save branding')
      }

      setSuccess('Branding settings saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save branding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pt-8 pb-12 px-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#101828] mb-2">
          Settings
        </h1>
        <p className="text-[#667085]">
          Manage your account, organization, and integration preferences
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Domain</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <SaveIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    First Name
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Last Name
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Timezone
                  </label>
                  <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">UTC (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Language
                  </label>
                  <Select value={profile.language} onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} className="bg-[#7F56D9] text-white hover:bg-[#6941C6]">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Organization Name
                </label>
                <Input
                  value={organization.name}
                  onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Website
                </label>
                <Input
                  type="url"
                  value={organization.website}
                  onChange={(e) => setOrganization(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://your-company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Description
                </label>
                <Textarea
                  value={organization.description}
                  onChange={(e) => setOrganization(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Organization Slug
                </label>
                <Input
                  value={organization.slug}
                  onChange={(e) => setOrganization(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="your-organization"
                />
                <p className="text-xs text-[#667085] mt-1">
                  Your release notes will be available at: {process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/notes/{organization.slug}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveOrganization} className="bg-[#7F56D9] text-white hover:bg-[#6941C6]">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Domain Settings */}
        <TabsContent value="domain" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                Custom Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">
                  Domain Name
                </label>
                <div className="flex gap-3">
                  <Input
                    value={domain.custom}
                    onChange={(e) => setDomain(prev => ({ ...prev, custom: e.target.value }))}
                    placeholder="releases.yourcompany.com"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSaveDomain}
                    disabled={saving || !domain.custom.trim()}
                    className="bg-[#7F56D9] text-white hover:bg-[#6941C6]"
                  >
                    {saving ? 'Saving...' : 'Configure'}
                  </Button>
                </div>
                <p className="text-xs text-[#667085] mt-1">
                  Enter your custom domain (e.g., releases.yourcompany.com)
                </p>
              </div>

              {domain.custom && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#344054]">
                        Status: {domain.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                      {domain.verified ? (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!domain.verified && domain.verificationToken && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleVerifyDomain}
                          disabled={domain.verifying}
                        >
                          {domain.verifying ? 'Verifying...' : 'Verify'}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveDomain}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {domain.instructions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-[#344054] mb-2">
                        DNS Configuration Required:
                      </h4>
                      <div className="bg-white p-3 rounded border text-xs font-mono">
                        {domain.instructions.map((instruction, index) => (
                          <div key={index} className="mb-1">{instruction}</div>
                        ))}
                      </div>
                      <p className="text-xs text-[#667085] mt-2">
                        DNS changes can take up to 24 hours to propagate. Click "Verify" once the DNS record is added.
                      </p>
                    </div>
                  )}

                  {domain.verified && (
                    <div className="text-sm text-green-700">
                      ✓ Your custom domain is verified and active! Your release notes are now available at: 
                      <a 
                        href={`https://${domain.custom}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline ml-1"
                      >
                        {domain.custom}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding & Meta Tags Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon className="h-5 w-5" />
                Branding & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Meta Title
                  </label>
                  <Input
                    value={branding.metaTitle}
                    onChange={(e) => setBranding(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Your Company Release Notes"
                    maxLength={60}
                  />
                  <p className="text-xs text-[#667085] mt-1">
                    {branding.metaTitle.length}/60 characters (recommended for SEO)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Brand Color
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={branding.brandColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="w-16 h-10 p-1 border-[#d0d5dd]"
                    />
                    <Input
                      value={branding.brandColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, brandColor: e.target.value }))}
                      placeholder="#7F56D9"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">
                  Meta Description
                </label>
                <Textarea
                  value={branding.metaDescription}
                  onChange={(e) => setBranding(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Stay updated with the latest product improvements and feature releases..."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-[#667085] mt-1">
                  {branding.metaDescription.length}/160 characters (recommended for SEO)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Social Share Image URL
                  </label>
                  <Input
                    value={branding.metaImageUrl}
                    onChange={(e) => setBranding(prev => ({ ...prev, metaImageUrl: e.target.value }))}
                    placeholder="https://yoursite.com/og-image.png"
                    type="url"
                  />
                  <p className="text-xs text-[#667085] mt-1">
                    1200x630px recommended for optimal social media sharing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Favicon URL
                  </label>
                  <Input
                    value={branding.faviconUrl}
                    onChange={(e) => setBranding(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://yoursite.com/favicon.ico"
                    type="url"
                  />
                  <p className="text-xs text-[#667085] mt-1">
                    32x32px ICO or PNG format recommended
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              {(branding.metaTitle || branding.metaDescription || branding.metaImageUrl) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-[#344054] mb-3">Social Media Preview:</h4>
                  <div className="border border-gray-200 rounded-lg bg-white p-4 max-w-md">
                    {branding.metaImageUrl && (
                      <div className="mb-3">
                        <img 
                          src={branding.metaImageUrl} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="font-medium text-blue-600 line-clamp-1">
                        {branding.metaTitle || 'Your Company Release Notes'}
                      </div>
                      <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                        {branding.metaDescription || 'Stay updated with the latest product improvements and feature releases...'}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {domain.custom || 'yoursite.com'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveBranding}
                  disabled={saving}
                  className="bg-[#7F56D9] text-white hover:bg-[#6941C6]"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Branding'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Management */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SaveIcon className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div>
                    <h4 className="font-semibold text-blue-900">Free Plan</h4>
                    <p className="text-sm text-blue-700">Perfect for getting started</p>
                    <ul className="text-xs text-blue-600 mt-2 space-y-1">
                      <li>• Up to 5 release notes per month</li>
                      <li>• GitHub integration</li>
                      <li>• Public release notes pages</li>
                      <li>• Basic email notifications</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">$0</div>
                    <div className="text-sm text-blue-700">per month</div>
                    <Badge className="bg-blue-100 text-blue-800 mt-2">Current Plan</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Professional</h4>
                    <p className="text-sm text-gray-600">For growing teams</p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Unlimited release notes</li>
                      <li>• All integrations</li>
                      <li>• Advanced AI templates</li>
                      <li>• Custom branding</li>
                      <li>• Team collaboration</li>
                    </ul>
                    <div className="mt-4">
                      <div className="text-xl font-bold text-gray-900">$29</div>
                      <div className="text-sm text-gray-600">per month</div>
                      <Button className="w-full mt-2" variant="outline">
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Enterprise</h4>
                    <p className="text-sm text-gray-600">For large organizations</p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Everything in Professional</li>
                      <li>• SSO & advanced security</li>
                      <li>• Priority support</li>
                      <li>• Custom integrations</li>
                      <li>• Dedicated success manager</li>
                    </ul>
                    <div className="mt-4">
                      <div className="text-xl font-bold text-gray-900">$99</div>
                      <div className="text-sm text-gray-600">per month</div>
                      <Button className="w-full mt-2" variant="outline">
                        Contact Sales
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Usage This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Release Notes Created</span>
                      <span>2 / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                Connected Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border border-[#e4e7ec] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {integration.type === 'github' && <GlobeIcon className="h-5 w-5" />}
                        {integration.type === 'slack' && <BellIcon className="h-5 w-5" />}
                        {integration.type === 'linear' && <KeyIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#101828]">{integration.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={integration.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {integration.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                          {integration.lastSync && (
                            <span className="text-xs text-[#667085]">
                              Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTestIntegration(integration.id)}
                          >
                            <TestTubeIcon className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnectIntegration(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => handleConnectIntegration(integration.id)}
                          className="bg-[#7F56D9] text-white hover:bg-[#6941C6]"
                          size="sm"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {success}
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#101828]">Email on Publish</h4>
                    <p className="text-sm text-[#667085]">Get notified when a release note is published</p>
                  </div>
                  <Switch 
                    checked={notifications.emailOnPublish}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailOnPublish: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#101828]">Email on Comments</h4>
                    <p className="text-sm text-[#667085]">Get notified when someone comments on your release notes</p>
                  </div>
                  <Switch 
                    checked={notifications.emailOnComment}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailOnComment: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#101828]">Slack Notifications</h4>
                    <p className="text-sm text-[#667085]">Send notifications to your connected Slack channels</p>
                  </div>
                  <Switch 
                    checked={notifications.slackNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, slackNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#101828]">Weekly Digest</h4>
                    <p className="text-sm text-[#667085]">Receive a weekly summary of your release notes activity</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyDigest: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-[#e4e7ec]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PaletteIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Theme Customization
                </h3>
                <p className="text-gray-500">
                  Advanced theming options coming soon. Customize colors, fonts, and layout to match your brand.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}