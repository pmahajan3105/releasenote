"use client"

import React, { useState } from "react"
import Link from "next/link"
import { SettingsMenu } from "../../../../components/ui/settings-menu"
import { IconButton } from "../../../../components/ui/icon-button"
import { Alert } from "../../../../components/ui/alert"
import { TextArea } from "../../../../components/ui/text-area"
import { TextField } from "../../../../components/ui/text-field"
import { Button } from "../../../../components/ui/button"
import { 
  Building, 
  Image, 
  FileText, 
  Globe, 
  Lock, 
  Users, 
  X, 
  UploadCloud, 
  HelpCircle 
} from "lucide-react"
import { Select } from "../../../../components/ui/enhanced-select"
import { SelectItem } from "../../../../components/ui/select"

export default function MinimalistSettingsHub() {
  const [showAlert, setShowAlert] = useState(true)
  const [orgDetails, setOrgDetails] = useState("")
  const [publicName, setPublicName] = useState("")
  const [defaultTemplate, setDefaultTemplate] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate save operation
    setTimeout(() => {
      setIsLoading(false)
      alert("Settings saved successfully!")
    }, 1500)
  }

  const handleReset = () => {
    setOrgDetails("")
    setPublicName("")
    setDefaultTemplate(undefined)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File selected:", file.name)
      // Handle file upload logic here
    }
  }

  return (
    <div className="flex h-full w-full items-start flex-col md:flex-row">
      {/* Settings Menu Sidebar - Mobile Responsive */}
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
              <SettingsMenu.Item
                selected={true}
                icon={<Building className="w-4 h-4" />}
                label="Organization Settings"
              />
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
              <Link href="/dashboard/settings/domain">
                <SettingsMenu.Item
                  icon={<Globe className="w-4 h-4" />}
                  label="Domain"
                />
              </Link>
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

      {/* Main Content - Mobile Responsive */}
      <div className="container max-w-none flex flex-1 flex-col items-center gap-12 bg-gray-50 dark:bg-gray-900 py-12 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12 px-4">
          {/* Header */}
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="w-full text-2xl font-semibold text-gray-900 dark:text-white">
              Organization Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure your organization's settings and preferences
            </p>
          </div>

          {/* Content */}
          <div className="flex w-full flex-col items-start gap-6">
            {/* Alert */}
            {showAlert && (
              <Alert variant="brand">
                <Alert.Title>Complete your organization setup</Alert.Title>
                <Alert.Description>
                  Upload your organization's logo and configure essential settings to get started.
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

            {/* Form Fields */}
            <div className="flex w-full flex-col items-start gap-6">
              {/* Organization Details */}
              <TextArea 
                label="Organization Details" 
                helpText="Provide information about your organization"
              >
                <TextArea.Input
                  className="min-h-[112px] w-full"
                  placeholder="Enter your organization details..."
                  value={orgDetails}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrgDetails(e.target.value)}
                />
              </TextArea>

              {/* Logo Upload */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Organization Logo
                </span>
                <div 
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-6 py-6 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick={() => document.getElementById('logo-upload-minimal')?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-sm text-gray-900 dark:text-white text-center">
                      Drop your logo here or click to upload
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      SVG, PNG or JPG (max. 800x400px)
                    </span>
                  </div>
                  <input
                    id="logo-upload-minimal"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Public Name */}
              <TextField 
                label="Public Name" 
                helpText="This name will be visible to your users"
              >
                <TextField.Input
                  placeholder="Enter your organization's public name"
                  value={publicName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublicName(e.target.value)}
                />
              </TextField>

              {/* Default Template */}
              <Select
                label="Default Template"
                placeholder="Select a default template"
                helpText="Choose the default template for new release notes"
                value={defaultTemplate}
                onValueChange={(value: string) => setDefaultTemplate(value)}
              >
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </Select>
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
                onClick={() => window.open('/docs', '_blank')}
              >
                View documentation
              </Button>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="neutral-tertiary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
