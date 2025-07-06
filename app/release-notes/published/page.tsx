'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useReleaseNotesStore } from '@/lib/store/use-release-notes'
import { PlusIcon, SearchIcon, FilterIcon, EyeIcon, EditIcon, ShareIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

export default function PublishedReleaseNotesPage() {
  const { releaseNotes } = useReleaseNotesStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const publishedNotes = releaseNotes.filter(note => note.status === 'published')

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = publishedNotes.filter(note => {
      const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (note.content_markdown || note.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || true // Categories not implemented yet
      return matchesSearch && matchesCategory
    })

    // Sort notes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_at || b.created_at || '').getTime() - new Date(a.published_at || a.created_at || '').getTime()
        case 'oldest':
          return new Date(a.published_at || a.created_at || '').getTime() - new Date(b.published_at || b.created_at || '').getTime()
        case 'views':
          return (b.views || 0) - (a.views || 0)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })

    return filtered
  }, [publishedNotes, searchTerm, filterCategory, sortBy])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-purple-100 text-purple-800'
      case 'improvement': return 'bg-blue-100 text-blue-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'bugfix': return 'bg-orange-100 text-orange-800'
      case 'performance': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col gap-8 pt-8 pb-12 px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] mb-2">
            Published Release Notes
          </h1>
          <p className="text-[#667085]">
            Manage and view your published release notes
          </p>
        </div>
        <Link href="/release-notes/create">
          <Button className="bg-[#7F56D9] text-white hover:bg-[#6941C6]">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="border-[#e4e7ec]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search release notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="bugfix">Bug Fix</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-[#667085]">
              {filteredAndSortedNotes.length} result{filteredAndSortedNotes.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Release Notes List */}
      <div className="space-y-4">
        {filteredAndSortedNotes.length === 0 ? (
          <Card className="border-[#e4e7ec]">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No published release notes found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Create your first release note to get started.'}
              </p>
              <Link href="/release-notes/create">
                <Button className="bg-[#7F56D9] text-white hover:bg-[#6941C6]">
                  Create Release Note
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedNotes.map((note) => (
            <Card key={note.id} className="border-[#e4e7ec] hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#101828] hover:text-[#7F56D9] cursor-pointer">
                        {note.title}
                      </h3>
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#667085] mb-3">
                      <span>Published {formatDate(note.publishedDate!)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {note.views.toLocaleString()} views
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {note.categories.map((category) => (
                        <Badge key={category} className={`text-xs ${getCategoryColor(category)}`}>
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div 
                      className="text-[#667085] line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: note.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Link href={`/release-notes/edit/${note.id}`}>
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}