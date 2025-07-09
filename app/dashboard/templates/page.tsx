"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash, Eye, Upload, Download } from "lucide-react"
import { AI_TEMPLATES, AITemplate } from "@/lib/ai/templates"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CardSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<AITemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<AITemplate | null>(null)
  const [preview, setPreview] = useState<AITemplate | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)

  // Fetch templates from API on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/templates')
        const json: any = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch templates')
        setTemplates(json.templates)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch templates')
        toast.error(err.message || 'Failed to fetch templates')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handleAdd = () => {
    setEditing({} as AITemplate)
    setShowDialog(true)
  }

  const handleEdit = (t: AITemplate) => {
    setEditing(t)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })
      const json: any = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete template')
      setTemplates(prev => prev.filter(t => t.id !== id))
      toast.success('Template deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete template')
    }
  }

  const handleSave = async (t: AITemplate) => {
    let res, json: any
    const isEdit = !!t.id && templates.some(pt => pt.id === t.id)
    try {
      if (isEdit) {
        res = await fetch(`/api/templates/${t.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t),
        })
        json = await res.json() as any
        if (!res.ok) throw new Error(json.error || 'Failed to update template')
        setTemplates(prev => prev.map(pt => pt.id === t.id ? json.template : pt))
        toast.success('Template updated')
      } else {
        res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t),
        })
        json = await res.json() as any
        if (!res.ok) throw new Error(json.error || 'Failed to create template')
        setTemplates(prev => [...prev, json.template])
        toast.success('Template created')
      }
      setShowDialog(false)
      setEditing(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template')
    }
  }

  const handleExport = () => {
    if (templates.length === 0) {
      toast.error('No templates to export')
      return
    }
    
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      templates: templates.map(t => ({
        ...t,
        // Remove organization-specific fields
        id: undefined,
        organization_id: undefined,
        created_at: undefined,
        updated_at: undefined,
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `templates-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Templates exported successfully')
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (!importData.templates || !Array.isArray(importData.templates)) {
        throw new Error('Invalid template file format')
      }
      
      let imported = 0
      for (const template of importData.templates) {
        try {
          // Generate new ID and add required fields
          const newTemplate = {
            ...template,
            id: crypto.randomUUID(),
          }
          
          const res = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTemplate),
          })
          
          if (res.ok) {
            const json = await res.json()
            setTemplates(prev => [...prev, json.template])
            imported++
          }
        } catch (err) {
          console.error('Failed to import template:', template.name, err)
        }
      }
      
      toast.success(`Successfully imported ${imported} template${imported !== 1 ? 's' : ''}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to import templates')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('Please select a JSON file')
        return
      }
      setImportFile(file)
      handleImport(file)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }
  if (error) {
    return <div className="max-w-3xl mx-auto py-8 text-center text-red-500">{error}</div>
  }
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Template Management</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="import-file"
          />
          <Button
            onClick={() => document.getElementById('import-file')?.click()}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Plus className="w-10 h-10 mx-auto" />}
                headline="No Templates Yet"
                subtext="Create your first AI template to get started."
                action={
                  <Button onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          templates.map(t => (
            <Card key={t.id} className="relative group">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <CardTitle className="text-lg font-medium">{t.name}</CardTitle>
                    <div className="text-xs text-gray-500">{t.description}</div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => setPreview(t)}><Eye className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}><Trash className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{t.category}</Badge>
                <Badge className="text-xs">{t.tone}</Badge>
                <Badge className="text-xs">{t.targetAudience}</Badge>
                <Badge variant="outline" className="text-xs">{t.outputFormat}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
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
