"use client"

import React, { useState } from "react"
import Link from "next/link"
import { SettingsMenu } from "../../../../components/ui/settings-menu"
import { IconButton } from "../../../../components/ui/icon-button"
import { Alert } from "../../../../components/ui/alert"
import { TextField } from "../../../../components/ui/text-field"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Modal } from "../../../../components/ui/modal"
import { 
  Building, 
  Image, 
  FileText, 
  Globe, 
  Lock, 
  Users, 
  X, 
  Plus,
  Check,
  MoreVertical,
  Clock,
  Shield,
  Copy,
  ShieldCheck,
  HelpCircle
} from "lucide-react"

interface Domain {
  id: string
  name: string
  status: 'verified' | 'pending' | 'failed'
  type: 'primary' | 'development' | 'staging'
  sslExpiry?: string
}

export default function DomainManagement() {
  const [showAlert, setShowAlert] = useState(true)
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: '1',
      name: 'example.com',
      status: 'verified',
      type: 'primary',
      sslExpiry: '89 days'
    },
    {
      id: '2', 
      name: 'staging.example.com',
      status: 'pending',
      type: 'development'
    }
  ])
  const [verificationCode] = useState("verification-code-abc123xyz789")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDomainName, setNewDomainName] = useState("")

  const getStatusBadge = (status: Domain['status']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" icon={<Check className="w-3 h-3" />}>
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" icon={<Clock className="w-3 h-3" />}>
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            Failed
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: Domain['type']) => {
    return <Badge variant="neutral">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  const handleCopyVerificationCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode)
      alert("Verification code copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleAddDomain = () => {
    setShowAddModal(true)
  }

  const handleAddDomainSubmit = () => {
    if (newDomainName.trim()) {
      const newDomain: Domain = {
        id: Date.now().toString(),
        name: newDomainName.trim(),
        status: 'pending',
        type: 'development'
      }
      setDomains([...domains, newDomain])
      setNewDomainName("")
      setShowAddModal(false)
    }
  }

  const handleVerifyAllDomains = async () => {
    setIsLoading(true)
    // Simulate verification process
    setTimeout(() => {
      setIsLoading(false)
      alert("Domain verification initiated!")
    }, 2000)
  }

  return (
    <div className="flex h-full w-full items-start flex-col md:flex-row">
      {/* Settings Menu Sidebar */}
      <SettingsMenu className="w-full md:w-64 md:flex-shrink-0 md:border-r border-b md:border-b-0">
        <span className="w-full text-xl font-semibold text-gray-900 dark:text-white">
          Settings
        </span>
        
        <div className="flex w-full flex-col items-start gap-4">
          <div className="w-full">
            <span className="w-full text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Organization
            </span>
            <div className="flex w-full flex-col items-start gap-1">
              <Link href="/dashboard/settings/organization-enhanced">
                <SettingsMenu.Item
                  icon={<Building className="w-4 h-4" />}
                  label="Organization Settings"
                />
              </Link>
              <Link href="/dashboard/settings/branding">
                <SettingsMenu.Item
                  icon={<Image className="w-4 h-4" />}
                  label="Branding"
                />
              </Link>
              <Link href="/dashboard/templates">
                <SettingsMenu.Item
                  icon={<FileText className="w-4 h-4" />}
                  label="Templates"
                />
              </Link>
            </div>
          </div>
          
          <div className="w-full">
            <span className="w-full text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Access
            </span>
            <div className="flex w-full flex-col items-start gap-1">
              <SettingsMenu.Item
                selected={true}
                icon={<Globe className="w-4 h-4" />}
                label="Domain"
              />
              <Link href="/dashboard/settings/sso">
                <SettingsMenu.Item
                  icon={<Lock className="w-4 h-4" />}
                  label="SSO"
                />
              </Link>
              <Link href="/dashboard/settings/team">
                <SettingsMenu.Item
                  icon={<Users className="w-4 h-4" />}
                  label="Team Members"
                />
              </Link>
            </div>
          </div>
        </div>
      </SettingsMenu>

      {/* Main Content */}
      <div className="container max-w-none flex flex-1 flex-col items-center gap-12 bg-gray-50 dark:bg-gray-900 py-12 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12 px-4">
          {/* Header */}
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="w-full text-2xl font-semibold text-gray-900 dark:text-white">
              Domains
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and verify your organization's domains
            </p>
          </div>

          {/* Content */}
          <div className="flex w-full flex-col items-start gap-6">
            {/* Alert */}
            {showAlert && (
              <Alert variant="brand">
                <Globe className="h-4 w-4" />
                <Alert.Title>Set up your domain</Alert.Title>
                <Alert.Description>
                  Add and verify your domain to enable custom branding and SSO capabilities.
                </Alert.Description>
                <Alert.Actions>
                  <IconButton
                    size="medium"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setShowAlert(false)}
                  />
                </Alert.Actions>
              </Alert>
            )}

            {/* Domains List */}
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Your domains
                </span>
                <Button
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddDomain}
                >
                  Add domain
                </Button>
              </div>

              <div className="flex w-full flex-col items-start gap-4">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex w-full items-center gap-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-6"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <Globe className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {domain.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(domain.status)}
                          {getTypeBadge(domain.type)}
                        </div>
                      </div>
                    </div>
                    <IconButton
                      icon={<MoreVertical className="w-4 h-4" />}
                      onClick={() => alert(`Menu for ${domain.name}`)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Verification */}
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Domain verification
              </span>
              <div className="flex w-full flex-col items-start gap-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-6">
                <div className="flex w-full items-center gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      DNS verification
                    </span>
                  </div>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add this TXT record to your DNS configuration to verify domain ownership
                </p>
                <TextField>
                  <TextField.Input
                    value={verificationCode}
                    readOnly
                    className="bg-white dark:bg-gray-700"
                  />
                </TextField>
                <Button
                  variant="neutral-secondary"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyVerificationCode}
                >
                  Copy DNS record
                </Button>
              </div>
            </div>

            {/* SSL Certificate */}
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                SSL Certificate
              </span>
              <div className="flex w-full items-center gap-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-6">
                <div className="flex flex-1 items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Certificate active
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Expires in 89 days
                    </span>
                  </div>
                </div>
                <Button
                  variant="neutral-secondary"
                  onClick={() => alert("SSL certificate details would be shown here")}
                >
                  View details
                </Button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex h-px w-full bg-gray-200 dark:bg-gray-700" />

          {/* Actions */}
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              <Button
                variant="neutral-tertiary"
                icon={<HelpCircle className="w-4 h-4" />}
                onClick={() => window.open('/docs/domains', '_blank')}
              >
                View documentation
              </Button>
              <Button
                onClick={handleVerifyAllDomains}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify All Domains"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Domain"
      >
        <div className="space-y-4">
          <TextField
            label="Domain Name"
            helpText="Enter the domain you want to add (e.g., example.com)"
          >
            <TextField.Input
              placeholder="example.com"
              value={newDomainName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDomainName(e.target.value)}
            />
          </TextField>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="neutral-tertiary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDomainSubmit}
              disabled={!newDomainName.trim()}
            >
              Add Domain
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
