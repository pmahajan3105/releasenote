"use client"

import { useState, useEffect } from "react"
import { 
  Download, 
  Upload, 
  Plus, 
  Search, 
  ChevronDown, 
  Clock, 
  Layout, 
  Users, 
  FileText, 
  MessageCircle, 
  Copy, 
  Eye, 
  Edit2, 
  MoreVertical, 
  TrendingUp, 
  Code,
  Trash,
  Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { TextField } from "@/components/ui/text-field"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AI_TEMPLATES, AITemplate } from "@/lib/ai/templates"
import { CardSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// Sample template data based on the design
const sampleTemplates = [
  {
    id: "traditional",
    name: "Traditional Release Notes",
    description: "Professional format for enterprise software updates",
    category: "Traditional",
    targetAudience: "Developers", 
    outputFormat: "Markdown",
    tone: "Professional",
    lastEdited: "2d ago",
    wordCount: "2,450",
    usageCount: "48",
    icon: "📝",
    systemPrompt: "You are a professional technical writer...",
    userPromptTemplate: "Generate traditional release notes...",
    exampleOutput: "# Release Notes v1.0.0\n\n## New Features\n- Feature 1\n- Feature 2"
  },
  {
    id: "modern", 
    name: "Modern Changelog",
    description: "Contemporary style with emojis and casual tone",
    category: "Modern",
    targetAudience: "Mixed",
    outputFormat: "HTML", 
    tone: "Casual",
    lastEdited: "5h ago",
    wordCount: "1,850",
    usageCount: "36",
    icon: "🚀",
    systemPrompt: "You are a modern content writer...",
    userPromptTemplate: "Generate modern changelog...",
    exampleOutput: "## 🎉 What's New\n\n🚀 Amazing new features\n🐛 Bug fixes"
  }
]

function TemplateForm({ template, onSave, onCancel }: {
  template?: Partial<AITemplate>
  onSave: (t: AITemplate) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<AITemplate>>(template || {})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.name || !form.id || !form.description) {
      toast.error("Name, ID, and Description are required.")
      return
    }
    onSave(form as AITemplate)
  }

  return (
    <div className="space-y-3">
      <Input name="id" placeholder="ID" value={form.id || ""} onChange={handleChange} />
      <Input name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} />
      <Textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} />
      <Input name="icon" placeholder="Icon (emoji)" value={form.icon || ""} onChange={handleChange} />
      <Input name="category" placeholder="Category" value={form.category || ""} onChange={handleChange} />
      <Input name="tone" placeholder="Tone" value={form.tone || ""} onChange={handleChange} />
      <Input name="targetAudience" placeholder="Target Audience" value={form.targetAudience || ""} onChange={handleChange} />
      <Input name="outputFormat" placeholder="Output Format" value={form.outputFormat || ""} onChange={handleChange} />
      <Textarea name="systemPrompt" placeholder="System Prompt" value={form.systemPrompt || ""} onChange={handleChange} />
      <Textarea name="userPromptTemplate" placeholder="User Prompt Template" value={form.userPromptTemplate || ""} onChange={handleChange} />
      <Textarea name="exampleOutput" placeholder="Example Output" value={form.exampleOutput || ""} onChange={handleChange} />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Partial<AITemplate> | null>(null)
  const [preview, setPreview] = useState<AITemplate | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      try {
        // For demo purposes, use sample data. In real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        setTemplates([...AI_TEMPLATES, ...sampleTemplates])
      } catch (error) {
        toast.error("Failed to load templates")
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handleNewTemplate = () => {
    setEditing({})
    setShowDialog(true)
  }

  const handleEdit = (template: AITemplate) => {
    setEditing(template)
    setShowDialog(true)
  }

  const handleSave = async (template: AITemplate) => {
    try {
      if (editing?.id) {
        setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
        toast.success("Template updated")
      } else {
        setTemplates(prev => [...prev, template])
        toast.success("Template created")
      }
      setShowDialog(false)
      setEditing(null)
    } catch (error) {
      toast.error("Failed to save template")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setTemplates(prev => prev.filter(t => t.id !== id))
      toast.success("Template deleted")
    } catch (error) {
      toast.error("Failed to delete template")
    }
  }

  const handleDuplicate = (template: any) => {
    const duplicated = { ...template, id: `${template.id}_copy`, name: `${template.name} (Copy)` }
    setTemplates(prev => [...prev, duplicated])
    toast.success("Template duplicated")
  }

  const handleExport = () => {
    toast.info("Export functionality coming soon!")
  }

  const handleImport = () => {
    toast.info("Import functionality coming soon!")
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-start">
        <div className="flex w-full items-center justify-between border-b border-border px-6 py-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex w-full grow flex-col gap-6 px-6 py-6">
          {[1, 2, 3].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-start">
      {/* Header */}
      <div className="flex w-full items-center justify-between border-b border-border px-6 py-6">
        <div className="flex flex-col items-start gap-2">
          <span className="text-3xl font-bold text-foreground">
            Templates
          </span>
          <span className="text-base text-muted-foreground">
            Manage your release note templates
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-tertiary"
            icon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="neutral-tertiary"
            icon={<Upload />}
            onClick={handleImport}
          >
            Import
          </Button>
          <Button
            icon={<Plus />}
            onClick={handleNewTemplate}
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full grow flex-col items-start gap-6 px-6 py-6 overflow-auto">
        {/* Search and Filter */}
        <div className="flex w-full items-center gap-4">
          <TextField
            className="grow"
            label=""
            helpText=""
          >
            <TextField.Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </TextField>
          <Button
            variant="neutral-tertiary"
            iconRight={<ChevronDown />}
          >
            All categories
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="w-full items-start gap-6 grid grid-cols-1">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col items-start gap-6 rounded-md border border-border bg-background px-6 py-6"
            >
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-start justify-between">
                  <div className="flex grow flex-col items-start gap-2">
                    <span className="text-xl font-semibold text-foreground">
                      {template.name}
                    </span>
                    <span className="text-base text-muted-foreground">
                      {template.description}
                    </span>
                  </div>
                  <Badge variant="neutral" icon={<Clock />}>
                    Last edited {template.lastEdited || 'recently'}
                  </Badge>
                </div>

                <div className="flex w-full flex-col items-start gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral" icon={<Layout />}>
                      {template.category}
                    </Badge>
                    <Badge variant="neutral" icon={<Users />}>
                      {template.targetAudience}
                    </Badge>
                    <Badge variant="neutral" icon={<FileText />}>
                      {template.outputFormat}
                    </Badge>
                    <Badge variant="neutral" icon={<MessageCircle />}>
                      {template.tone}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {template.wordCount || '1,000'} words
                    </span>
                    <Copy className="h-4 w-4 text-muted-foreground ml-4" />
                    <span className="text-sm text-muted-foreground">
                      {template.usageCount || '0'} uses
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-end gap-2">
                <IconButton
                  icon={<Eye />}
                  onClick={() => setPreview(template)}
                />
                <IconButton
                  icon={<Edit2 />}
                  onClick={() => handleEdit(template)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton icon={<MoreVertical />} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Template" : "Add Template"}</DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editing || {}}
            onSave={handleSave}
            onCancel={() => { setShowDialog(false); setEditing(null) }}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview: {preview?.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono">
            {preview?.exampleOutput || "No example output."}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
