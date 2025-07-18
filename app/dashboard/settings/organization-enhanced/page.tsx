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

export default function EnhancedOrganizationSettings() {
  const [showAlert, setShowAlert] = useState(true)
  const [orgDetails, setOrgDetails] = useState("")
  const [publicName, setPublicName] = useState("")
  const [defaultTemplate, setDefaultTemplate] = useState("")
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
    setDefaultTemplate("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File selected:", file.name)
      // Handle file upload logic here
    }
  }

  return (
    <div className="flex h-full w-full items-start">
      {/* Settings Menu Sidebar */}
      <SettingsMenu className="flex-shrink-0">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">
          Settings
        </span>
        
        <div className="flex w-full flex-col items-start gap-4">
          <div className="w-full">
            <span className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Organization
            </span>
            <div className="space-y-1">
              <Link href="/dashboard/settings/organization">
                <SettingsMenu.Item
                  selected={true}
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
            <span className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Access
            </span>
            <div className="space-y-1">
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

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-12 min-h-screen">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Organization Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your organization's settings and preferences
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
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
            <div className="space-y-6">
              {/* Organization Details */}
              <TextArea 
                label="Organization Details" 
                helpText="Provide information about your organization"
              >
                <TextArea.Input
                  className="min-h-[112px]"
                  placeholder="Enter your organization details..."
                  value={orgDetails}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrgDetails(e.target.value)}
                />
              </TextArea>

              {/* Logo Upload */}
              <div className="space-y-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Organization Logo
                </span>
                <div 
                  className="flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-8 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <UploadCloud className="w-12 h-12 text-gray-400" />
                  <div className="text-center space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Drop your logo here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG or JPG (max. 800x400px)
                    </p>
                  </div>
                  <input
                    id="logo-upload"
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
                onValueChange={setDefaultTemplate}
              >
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="neutral-tertiary"
              icon={<HelpCircle className="w-4 h-4" />}
              onClick={() => window.open('/docs', '_blank')}
            >
              View documentation
            </Button>
            
            <div className="flex items-center gap-2">
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
  )
}
