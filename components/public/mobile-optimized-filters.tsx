'use client'

import React, { useState } from 'react'
import { SearchIcon, FilterIcon, XIcon, ChevronDownIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/components/Button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ReleaseNote {
  id: string
  title: string
  slug: string
  published_at: string
  content_html?: string
  category?: string
  tags?: string[]
}

interface MobileOptimizedFiltersProps {
  releaseNotes: ReleaseNote[]
  onFilter: (filteredNotes: ReleaseNote[]) => void
  brandColor?: string
}

export function MobileOptimizedFilters({ 
  releaseNotes, 
  onFilter, 
  brandColor = '#7F56D9' 
}: MobileOptimizedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)

  // Extract unique categories and tags
  const categories = React.useMemo(() => {
    const categorySet = new Set<string>()
    releaseNotes.forEach(note => {
      if (note.category) categorySet.add(note.category)
    })
    return Array.from(categorySet).sort()
  }, [releaseNotes])

  const tags = React.useMemo(() => {
    const tagSet = new Set<string>()
    releaseNotes.forEach(note => {
      if (note.tags) note.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [releaseNotes])

  // Filter logic
  const filteredNotes = React.useMemo(() => {
    let filtered = releaseNotes

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(term) ||
        (note.content_html && stripHtml(note.content_html).toLowerCase().includes(term))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags && selectedTags.some(tag => note.tags?.includes(tag))
      )
    }

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

  React.useEffect(() => {
    onFilter(filteredNotes)
  }, [filteredNotes, onFilter])

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

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
    setFiltersOpen(false)
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedTags.length > 0 || dateRange !== 'all'
  const activeFilterCount = (selectedCategory ? 1 : 0) + selectedTags.length + (dateRange !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Mobile-First Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search release notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-3 text-base rounded-xl border-2 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Mobile Filter Sheet */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="relative rounded-xl px-4 py-3 h-auto"
                style={{ borderColor: brandColor }}
              >
                <FilterIcon className="w-5 h-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    className="ml-2 px-2 py-1 text-xs min-w-[1.5rem] h-6"
                    style={{ backgroundColor: brandColor }}
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader className="text-left pb-6">
                <SheetTitle>Filter Release Notes</SheetTitle>
                <SheetDescription>
                  Narrow down your search with these filter options
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Categories */}
                {categories.length > 0 && (
                  <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
                      <h3 className="font-semibold text-lg">Categories</h3>
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-3">
                      <Button
                        variant={selectedCategory === '' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('')}
                        className="w-full justify-start text-left rounded-xl py-3 h-auto"
                        style={selectedCategory === '' ? { backgroundColor: brandColor } : {}}
                      >
                        All Categories
                      </Button>
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(category)}
                          className="w-full justify-start text-left rounded-xl py-3 h-auto"
                          style={selectedCategory === category ? { backgroundColor: brandColor } : {}}
                        >
                          {category}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
                      <h3 className="font-semibold text-lg">Tags</h3>
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${tagsOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                            onClick={() => toggleTag(tag)}
                            className="cursor-pointer px-3 py-2 text-sm rounded-full"
                            style={selectedTags.includes(tag) ? { backgroundColor: brandColor } : {}}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Date Range */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Date Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: 'week', label: 'Past Week' },
                      { value: 'month', label: 'Past Month' },
                      { value: 'quarter', label: '3 Months' },
                      { value: 'year', label: 'Past Year' },
                    ].map(range => (
                      <Button
                        key={range.value}
                        variant={dateRange === range.value ? 'default' : 'outline'}
                        onClick={() => setDateRange(range.value as any)}
                        className="rounded-xl py-3 h-auto"
                        style={dateRange === range.value ? { backgroundColor: brandColor } : {}}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full rounded-xl py-3 h-auto text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XIcon className="w-5 h-5 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredNotes.length === releaseNotes.length 
            ? `${releaseNotes.length} notes`
            : `${filteredNotes.length} of ${releaseNotes.length}`
          }
        </div>
      </div>

      {/* Active Filters Display (Mobile Optimized) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-red-100 px-3 py-1 rounded-full"
              onClick={() => setSelectedCategory('')}
            >
              Category: {selectedCategory}
              <XIcon className="w-3 h-3 ml-1" />
            </Badge>
          )}
          
          {selectedTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 px-3 py-1 rounded-full"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <XIcon className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {dateRange !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 px-3 py-1 rounded-full"
              onClick={() => setDateRange('all')}
            >
              {dateRange === 'week' ? 'Past Week' :
               dateRange === 'month' ? 'Past Month' :
               dateRange === 'quarter' ? '3 Months' : 'Past Year'}
              <XIcon className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}