"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!context) return
    setContext({ ...context, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!context) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/ai-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save AI context")
      setContext(json.aiContext)
      toast.success("AI context saved")
    } catch (err: any) {
      setError(err.message || "Failed to save AI context")
      toast.error(err.message || "Failed to save AI context")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        </div>
        <FormSkeleton />
      </div>
    )
  }
  if (error) {
    return <div className="max-w-2xl mx-auto py-10 text-center text-red-500">{error}</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">AI Context Settings</h1>
      <div className="space-y-4">
        <Textarea
          name="system_prompt"
          label="System Prompt"
          placeholder="System prompt for the AI model"
          value={context?.system_prompt || ""}
          onChange={handleChange}
        />
        <Textarea
          name="user_prompt_template"
          label="User Prompt Template"
          placeholder="Template for the user prompt sent to the AI"
          value={context?.user_prompt_template || ""}
          onChange={handleChange}
        />
        <Textarea
          name="example_output"
          label="Example Output"
          placeholder="Example output for this context"
          value={context?.example_output || ""}
          onChange={handleChange}
        />
        <Input
          name="tone"
          placeholder="Tone (e.g. professional, casual)"
          value={context?.tone || ""}
          onChange={handleChange}
        />
        <Input
          name="audience"
          placeholder="Audience (e.g. developers, business)"
          value={context?.audience || ""}
          onChange={handleChange}
        />
        <Input
          name="output_format"
          placeholder="Output Format (e.g. markdown, html)"
          value={context?.output_format || ""}
          onChange={handleChange}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
