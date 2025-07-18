'use client'

import React, { useState } from 'react'
import { X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Alert } from '@/components/ui/alert'
import { TextArea } from '@/components/ui/text-area'
import { Select as EnhancedSelect } from '@/components/ui/enhanced-select'

export default function OrganizationSettingsPage() {
  const [companyDetails, setCompanyDetails] = useState('')
  const [aiTone, setAiTone] = useState<string | undefined>(undefined)
  const [showAlert, setShowAlert] = useState(true)

  const handleSaveSettings = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', { companyDetails, aiTone })
  }

  const handleLearnMore = () => {
    // TODO: Implement learn more functionality
    console.log('Learn more clicked')
  }

  return (
    <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-center gap-6 bg-background py-12 shadow-sm">
      <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full items-center gap-2">
            <span className="grow shrink-0 basis-0 text-lg font-semibold text-foreground">
              Organization Settings
            </span>
          </div>
          
          {showAlert && (
            <Alert
              variant="brand"
              title="Configure your organization"
              description="These settings will be used to customize AI-generated release notes for your organization."
              actions={
                <IconButton
                  size="medium"
                  icon={<X />}
                  onClick={() => setShowAlert(false)}
                />
              }
            />
          )}
          
          <div className="flex w-full flex-col items-start gap-6">
            <TextArea
              label="Company Details"
              helpText="Provide information about your company that will help generate more relevant content"
            >
              <TextArea.Input
                className="h-auto min-h-[112px] w-full flex-none"
                placeholder="Enter your company details..."
                value={companyDetails}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setCompanyDetails(event.target.value)
                }}
              />
            </TextArea>
            
            <EnhancedSelect
              label="AI Tone"
              placeholder="Choose a tone"
              helpText="Select the writing style for AI-generated content"
              value={aiTone}
              onValueChange={(value: string) => setAiTone(value)}
            >
              <EnhancedSelect.Item value="formal">formal</EnhancedSelect.Item>
              <EnhancedSelect.Item value="informal">informal</EnhancedSelect.Item>
              <EnhancedSelect.Item value="technical">technical</EnhancedSelect.Item>
              <EnhancedSelect.Item value="marketing-friendly">
                marketing-friendly
              </EnhancedSelect.Item>
              <EnhancedSelect.Item value="concise">concise</EnhancedSelect.Item>
            </EnhancedSelect>
          </div>
        </div>
        
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-border" />
        
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full flex-wrap items-center justify-between">
            <Button
              variant="neutral-tertiary"
              icon={<HelpCircle />}
              onClick={handleLearnMore}
            >
              Learn more
            </Button>
            <div className="flex items-center justify-end gap-2">
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
