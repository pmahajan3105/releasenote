'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/components/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  SearchIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UsersIcon,
  ExternalLinkIcon,
  FolderIcon
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

interface LinearTeam {
  id: string
  name: string
  key: string
  description?: string
  color: string
  icon?: string
  private: boolean
  issueCount: number
  activeCycleCount: number
  createdAt: string
  updatedAt: string
  organization: {
    id: string
    name: string
  }
}

interface LinearTeamManagerProps {
  selectedTeams: string[]
  onTeamSelect: (teamIds: string[]) => void
  selectionMode?: 'single' | 'multiple'
}

export function LinearTeamManager({ 
  selectedTeams, 
  onTeamSelect, 
  selectionMode = 'multiple' 
}: LinearTeamManagerProps) {
  const [teams, setTeams] = useState<LinearTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      loadTeams()
    }
  }, [user])

  const loadTeams = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/integrations/linear/teams')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.statusText}`)
      }

      const data = await response.json()
      setTeams(data.teams || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleTeamToggle = (teamId: string) => {
    if (selectionMode === 'single') {
      onTeamSelect([teamId])
    } else {
      const isSelected = selectedTeams.includes(teamId)
      if (isSelected) {
        onTeamSelect(selectedTeams.filter(id => id !== teamId))
      } else {
        onTeamSelect([...selectedTeams, teamId])
      }
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && teams.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCwIcon className="h-8 w-8 animate-spin mr-3" />
            <span>Loading Linear teams...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Team Selection</CardTitle>
              <CardDescription>
                {selectionMode === 'single' 
                  ? 'Choose a team for release note generation'
                  : 'Select teams you want to include in release notes'
                }
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTeams}
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
              placeholder="Search teams by name, key, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection Summary */}
          {selectedTeams.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                {selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected
              </span>
              {selectedTeams.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTeamSelect([])}
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
                onClick={loadTeams}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTeams.map((team) => {
          const isSelected = selectedTeams.includes(team.id)
          
          return (
            <Card 
              key={team.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTeamToggle(team.id)}
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
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.icon || team.key.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{team.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {team.key}
                          </Badge>
                          {team.private && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Private
                            </Badge>
                          )}
                        </div>
                        
                        {team.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {team.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FolderIcon className="w-3 h-3" />
                            <span>{team.issueCount} issues</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            <span>{team.activeCycleCount} active cycles</span>
                          </div>
                          
                          <span>
                            Created {new Date(team.createdAt).toLocaleDateString()}
                          </span>
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
                        // Linear team URL format
                        const orgUrlKey = team.organization?.id || 'linear'
                        window.open(`https://linear.app/${orgUrlKey}/team/${team.key}`, '_blank')
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

        {filteredTeams.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No teams found' : 'No teams available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No teams are available in this Linear workspace'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}