'use client'

import { BrandVoiceManager } from '@/components/ui/brand-voice-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function AICustomizationPage() {
  return (
    <div className="flex flex-col gap-8 pt-8 pb-12 px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] mb-2">
            AI Customization
          </h1>
          <p className="text-[#667085]">
            Customize AI behavior with brand voices and custom prompts for your release notes
          </p>
        </div>
        <div className="text-[#7F56D9]">
          <SparklesIcon className="w-8 h-8" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#e4e7ec]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#101828]">Brand Voices</CardTitle>
            <CardDescription className="text-[#667085]">
              Define your organization's tone, personality, and writing style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#667085]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Consistent brand messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Customizable vocabulary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Writing style preferences</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e4e7ec]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#101828]">Custom Prompts</CardTitle>
            <CardDescription className="text-[#667085]">
              Create specialized prompts for different types of releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#667085]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Feature announcements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Bug fix releases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Security updates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e4e7ec]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#101828]">AI Templates</CardTitle>
            <CardDescription className="text-[#667085]">
              Pre-built templates for quick setup and inspiration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#667085]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Professional & authoritative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Friendly & approachable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Technical & precise</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-[#e4e7ec] shadow-sm">
        <BrandVoiceManager />
      </div>
    </div>
  )
}