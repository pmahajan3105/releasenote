'use client'

import React, { useState, useMemo } from 'react'
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface ReleaseNote {
  id: string
  title: string
  slug: string
  published_at: string
  content_html?: string
  category?: string
  tags?: string[]
}

interface SearchFilterProps {
  releaseNotes: ReleaseNote[]
  onFilter: (filteredNotes: ReleaseNote[]) => void
  brandColor?: string
}

export function SearchFilter({ releaseNotes, onFilter, brandColor = '#7F56D9' }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('all')

  // Helper function to strip HTML
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  // Extract unique categories and tags from release notes
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set<string>()
    const tagSet = new Set<string>()

    releaseNotes.forEach(note => {
      if (note.category) {
        categorySet.add(note.category)
      }
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag))
      }
    })

    return {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort()
    }
  }, [releaseNotes])

  // Filter logic
  const filteredNotes = useMemo(() => {
    let filtered = releaseNotes

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(term) ||
        (note.content_html && stripHtml(note.content_html).toLowerCase().includes(term))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags && selectedTags.some(tag => note.tags?.includes(tag))
      )
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()

      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(note => 
        new Date(note.published_at) >= cutoffDate
      )
    }

    return filtered
  }, [releaseNotes, searchTerm, selectedCategory, selectedTags, dateRange])

  // Update parent component when filters change
  React.useEffect(() => {
    onFilter(filteredNotes)
  }, [filteredNotes, onFilter])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTags([])
    setDateRange('all')
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedTags.length > 0 || dateRange !== 'all'

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search release notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-9 text-base sm:text-sm"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10 sm:h-9 min-w-0 sm:min-w-[auto] justify-center sm:justify-start">
              <FilterIcon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem] h-5 text-xs">
                  {(selectedCategory ? 1 : 0) + selectedTags.length + (dateRange !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 sm:w-56 max-h-[70vh] overflow-y-auto">
            {/* Categories */}
            {categories.length > 0 && (
              <>
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory('')}
                  className={selectedCategory === '' ? 'bg-accent' : ''}
                >
                  All Categories
                </DropdownMenuItem>
                {categories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-accent' : ''}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Date Range */}
            <DropdownMenuLabel>Date Range</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All Time' },
              { value: 'week', label: 'Past Week' },
              { value: 'month', label: 'Past Month' },
              { value: 'quarter', label: 'Past 3 Months' },
              { value: 'year', label: 'Past Year' },
            ].map(range => (
              <DropdownMenuItem
                key={range.value}
                onClick={() => setDateRange(range.value as any)}
                className={dateRange === range.value ? 'bg-accent' : ''}
              >
                {range.label}
              </DropdownMenuItem>
            ))}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters} className="text-red-600">
                  <XIcon className="w-4 h-4 mr-2" />
                  Clear Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm max-w-[calc(50%-0.375rem)] sm:max-w-none"
              onClick={() => setSelectedCategory('')}
            >
              <span className="truncate">Category: {selectedCategory}</span>
              <XIcon className="w-3 h-3 ml-1 flex-shrink-0" />
            </Badge>
          )}
          
          {selectedTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm max-w-[calc(50%-0.375rem)] sm:max-w-none"
              onClick={() => toggleTag(tag)}
            >
              <span className="truncate">Tag: {tag}</span>
              <XIcon className="w-3 h-3 ml-1 flex-shrink-0" />
            </Badge>
          ))}
          
          {dateRange !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 text-xs sm:text-sm"
              onClick={() => setDateRange('all')}
            >
              <span className="truncate">
                {dateRange === 'week' ? 'Past Week' :
                 dateRange === 'month' ? 'Past Month' :
                 dateRange === 'quarter' ? 'Past 3 Months' : 'Past Year'}
              </span>
              <XIcon className="w-3 h-3 ml-1 flex-shrink-0" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-xs sm:text-sm text-gray-600 px-1">
        {filteredNotes.length === releaseNotes.length 
          ? `Showing all ${releaseNotes.length} release notes`
          : `Showing ${filteredNotes.length} of ${releaseNotes.length} release notes`
        }
      </div>
    </div>
  )
}