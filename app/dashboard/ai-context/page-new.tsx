"use client"

import { useState, useEffect } from "react"
import { Zap, X, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Alert } from "@/components/ui/alert"
import { TextArea } from "@/components/ui/text-area"
import { TextField } from "@/components/ui/text-field"
import { FormSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface AIContext {
  id?: string
  organization_id?: string
  system_prompt: string
  user_prompt_template: string
  example_output: string
  tone?: string
  audience?: string
  output_format?: string
  created_at?: string
  updated_at?: string
}

export default function AIContextPage() {
  const [context, setContext] = useState<AIContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(true)

  useEffect(() => {
    const fetchContext = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/ai-context")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to fetch AI context")
        setContext(json.aiContext || {
          system_prompt: "",
          user_prompt_template: "",
          example_output: "",
          tone: "",
          audience: "",
          output_format: ""
        })
      } catch (err: any) {
        setError(err.message || "Failed to fetch AI context")
        toast.error(err.message || "Failed to fetch AI context")
      } finally {
        setLoading(false)
      }
    }
    fetchContext()
  }, [])

  const handleChange = (field: keyof AIContext) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContext(prev => prev ? { ...prev, [field]: e.target.value } : null)
  }

  const handleSave = async () => {
    if (!context) return
    setSaving(true)
    try {
      const res = await fetch("/api/ai-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save AI context")
      setContext(json.aiContext)
      toast.success("AI context saved successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to save AI context")
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    setContext({
      system_prompt: "You are an expert technical writer specializing in release notes. Generate clear, concise, and engaging release notes that highlight key features, improvements, and bug fixes.",
      user_prompt_template: "Generate release notes for the following changes: {{changes}}",
      example_output: "# Release Notes - v1.0.0\n\n## 🚀 New Features\n- Added user authentication\n- Implemented dark mode\n\n## 🐛 Bug Fixes\n- Fixed navigation issues\n- Resolved performance problems",
      tone: "professional",
      audience: "developers",
      output_format: "markdown"
    })
  }

  const handleViewDocumentation = () => {
    // TODO: Implement documentation view
    toast.info("Documentation coming soon!")
  }

  if (loading) {
    return (
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-16 bg-background px-6 py-16">
        <div className="flex w-full max-w-[1024px] flex-col items-start gap-16">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          </div>
          <FormSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-16 bg-background px-6 py-16">
        <div className="text-center text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-16 bg-background px-6 py-16">
      <div className="flex w-full max-w-[1024px] flex-col items-start gap-16">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary-600" />
                <span className="text-3xl font-bold text-primary-600">
                  AI Context Settings
                </span>
              </div>
              <span className="text-lg font-semibold text-muted-foreground">
                Configure how AI generates your release notes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="neutral-secondary"
                onClick={handleResetDefaults}
              >
                Reset defaults
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
          
          {showAlert && (
            <Alert
              variant="brand"
              title="Configure AI Behavior"
              description="These settings determine how the AI assistant generates and formats content. Configure the prompts, tone, and output format to match your needs."
              actions={
                <IconButton
                  size="medium"
                  icon={<X />}
                  onClick={() => setShowAlert(false)}
                />
              }
            />
          )}
        </div>
        
        <div className="flex w-full flex-col items-start gap-16">
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between pb-3 border-b border-border">
              <span className="text-xl font-semibold text-primary-600">
                AI Prompts
              </span>
              <Button
                variant="neutral-tertiary"
                icon={<HelpCircle />}
                onClick={handleViewDocumentation}
              >
                View documentation
              </Button>
            </div>
            
            <TextArea
              className="h-auto w-auto min-w-[448px] flex-none"
              label="System Prompt"
              helpText="Instructions that define the AI's role and behavior"
            >
              <TextArea.Input
                className="h-auto min-h-[160px] w-full flex-none"
                placeholder="You are an expert technical writer specializing in release notes..."
                value={context?.system_prompt || ""}
                onChange={handleChange('system_prompt')}
              />
            </TextArea>
            
            <TextArea
              className="h-auto w-auto min-w-[448px] flex-none"
              label="User Prompt Template"
              helpText="Template for user requests with placeholders"
            >
              <TextArea.Input
                className="h-auto min-h-[112px] w-full flex-none"
                placeholder="Generate release notes for the following changes: {{changes}}"
                value={context?.user_prompt_template || ""}
                onChange={handleChange('user_prompt_template')}
              />
            </TextArea>
            
            <TextArea
              className="h-auto w-auto min-w-[448px] flex-none"
              label="Example Output"
              helpText="Sample of desired AI response format"
            >
              <TextArea.Input
                className="h-auto min-h-[144px] w-full flex-none"
                placeholder="# Release Notes - v1.0.0..."
                value={context?.example_output || ""}
                onChange={handleChange('example_output')}
              />
            </TextArea>
          </div>
          
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between pb-3 border-b border-border">
              <span className="text-xl font-semibold text-primary-600">
                AI Behavior
              </span>
            </div>
            
            <TextField
              className="h-auto w-auto min-w-[448px] flex-none"
              label="Tone"
              helpText="Writing style for generated content"
            >
              <TextField.Input
                placeholder="e.g. professional, technical, casual"
                value={context?.tone || ""}
                onChange={handleChange('tone')}
              />
            </TextField>
            
            <TextField
              className="h-auto w-auto min-w-[448px] flex-none"
              label="Audience"
              helpText="Target readers for the content"
            >
              <TextField.Input
                placeholder="e.g. developers, business users"
                value={context?.audience || ""}
                onChange={handleChange('audience')}
              />
            </TextField>
            
            <TextField
              className="h-auto w-auto min-w-[448px] flex-none"
              label="Output Format"
              helpText="Desired format for generated content"
            >
              <TextField.Input
                placeholder="e.g. markdown, html"
                value={context?.output_format || ""}
                onChange={handleChange('output_format')}
              />
            </TextField>
          </div>
        </div>
      </div>
    </div>
  )
}
