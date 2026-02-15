'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  SearchIcon,
  SettingsIcon,
  ExternalLinkIcon,
  FolderIcon,
  UsersIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  projectTypeKey: string
  simplified: boolean
  style: string
  isPrivate: boolean
  url: string
  avatarUrls?: Record<string, string>
  lead?: {
    accountId: string
    displayName: string
    emailAddress?: string
    avatarUrls?: Record<string, string>
  }
  issueTypes: Array<{
    id: string
    name: string
    description?: string
    iconUrl?: string
    subtask: boolean
  }>
}

interface JiraSite {
  id: string
  name: string
}

interface JiraConnectionTestResponse {
  tests?: Array<{
    name?: string
    details?: {
      sites?: JiraSite[]
    }
  }>
}

interface JiraProjectManagerProps {
  selectedProjects: string[]
  onProjectSelect: (projectKeys: string[]) => void
  selectionMode?: 'single' | 'multiple'
}

export function JiraProjectManager({ 
  selectedProjects, 
  onProjectSelect, 
  selectionMode = 'multiple' 
}: JiraProjectManagerProps) {
  const [projects, setProjects] = useState<JiraProject[]>([])
  const [sites, setSites] = useState<JiraSite[]>([])
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const user = useAuthStore((state) => state.user)

  const loadSites = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get available sites from integration metadata
      const response = await fetch('/api/integrations/jira/test-connection', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json() as JiraConnectionTestResponse
        const availableSites = data.tests?.find((test) => 
          test.name === 'Authentication & Resources' && test.details?.sites
        )?.details?.sites || []

        setSites(availableSites)
        
        if (availableSites.length > 0 && !selectedSite) {
          setSelectedSite(availableSites[0].id)
        }
      } else {
        setError('Failed to load Jira sites')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sites')
    } finally {
      setLoading(false)
    }
  }, [selectedSite])

  const loadProjects = useCallback(async () => {
    if (!selectedSite) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/integrations/jira/projects?siteId=${selectedSite}&maxResults=100`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [selectedSite])

  useEffect(() => {
    if (user) {
      void loadSites()
    }
  }, [loadSites, user])

  useEffect(() => {
    if (selectedSite) {
      void loadProjects()
    }
  }, [loadProjects, selectedSite])

  const handleProjectToggle = (projectKey: string) => {
    if (selectionMode === 'single') {
      onProjectSelect([projectKey])
    } else {
      const isSelected = selectedProjects.includes(projectKey)
      if (isSelected) {
        onProjectSelect(selectedProjects.filter(key => key !== projectKey))
      } else {
        onProjectSelect([...selectedProjects, projectKey])
      }
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProjectTypeIcon = (projectTypeKey: string) => {
    switch (projectTypeKey) {
      case 'software':
        return '⚙️'
      case 'service_desk':
        return '🎧'
      case 'business':
        return '📊'
      default:
        return '📁'
    }
  }

  const getProjectTypeName = (projectTypeKey: string) => {
    switch (projectTypeKey) {
      case 'software':
        return 'Software'
      case 'service_desk':
        return 'Service Desk'
      case 'business':
        return 'Business'
      default:
        return 'Project'
    }
  }

  if (loading && projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCwIcon className="h-8 w-8 animate-spin mr-3" />
            <span>Loading Jira projects...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Site Selection */}
      {sites.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jira Site</CardTitle>
            <CardDescription>
              Select which Jira site to browse projects from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {sites.map((site) => (
                <Button
                  key={site.id}
                  variant={selectedSite === site.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSite(site.id)}
                  className="flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  {site.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Project Selection</CardTitle>
              <CardDescription>
                {selectionMode === 'single' 
                  ? 'Choose a project for release note generation'
                  : 'Select projects you want to include in release notes'
                }
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              disabled={loading}
            >
              <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects by name, key, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection Summary */}
          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
              </span>
              {selectedProjects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onProjectSelect([])}
                  className="ml-auto text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadProjects}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const isSelected = selectedProjects.includes(project.key)
          
          return (
            <Card 
              key={project.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleProjectToggle(project.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {selectionMode === 'multiple' && (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1"
                      />
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {project.avatarUrls?.['48x48'] ? (
                          <Image
                            src={project.avatarUrls['48x48']}
                            alt={project.name}
                            width={32}
                            height={32}
                            unoptimized
                            className="w-8 h-8 rounded"
                          />
                        ) : (
                          <span className="text-lg">
                            {getProjectTypeIcon(project.projectTypeKey)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {project.key}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getProjectTypeName(project.projectTypeKey)}
                          </Badge>
                          {project.isPrivate && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Private
                            </Badge>
                          )}
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {project.lead && (
                            <div className="flex items-center gap-1">
                              <UsersIcon className="w-3 h-3" />
                              <span>{project.lead.displayName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <FolderIcon className="w-3 h-3" />
                            <span>{project.issueTypes.length} issue types</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(project.url, '_blank')
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredProjects.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No projects found' : 'No projects available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No projects are available in this Jira site'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
