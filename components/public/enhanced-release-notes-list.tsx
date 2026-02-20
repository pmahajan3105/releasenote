'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SearchFilter } from './search-filter'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, EyeIcon, TagIcon } from 'lucide-react'

interface ReleaseNote {
  id: string
  title: string
  slug: string
  published_at: string
  content_html?: string
  category?: string
  tags?: string[]
  featured_image_url?: string
  excerpt?: string
  views?: number
}

interface Organization {
  name: string
  description?: string
  logo_url?: string
  brand_color?: string
}

interface EnhancedReleaseNotesListProps {
  organization: Organization
  releaseNotes: ReleaseNote[]
  orgSlug: string
}

type GroupedNotes = {
  month: string
  notes: ReleaseNote[]
}

function extractTextPreview(html: string, maxLength = 220): string {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function monthLabel(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function EnhancedReleaseNotesList({
  organization,
  releaseNotes,
  orgSlug,
}: EnhancedReleaseNotesListProps) {
  const [filteredNotes, setFilteredNotes] = useState<ReleaseNote[]>(releaseNotes)
  const brandColor = organization.brand_color || '#1062fe'

  const groupedNotes = useMemo<GroupedNotes[]>(() => {
    const map = new Map<string, ReleaseNote[]>()
    for (const note of filteredNotes) {
      const key = monthLabel(note.published_at)
      const current = map.get(key) ?? []
      current.push(note)
      map.set(key, current)
    }

    return [...map.entries()].map(([month, notes]) => ({
      month,
      notes,
    }))
  }, [filteredNotes])

  return (
    <div
      className="release-notes-container min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      style={{
        background:
          'radial-gradient(1200px 700px at 10% -20%, rgba(16, 98, 254, 0.1), transparent 60%), #f6f8fc',
        '--brand-color': brandColor,
      } as React.CSSProperties}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-2xl border border-[#e4e7ec] bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Image
              src={organization.logo_url || '/branding/org-logo-placeholder.svg'}
              alt={`${organization.name} logo`}
              width={64}
              height={64}
              className="rounded-xl border border-[#eaecf0] bg-[#f9fafb] object-cover"
              unoptimized
            />

            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#101828] sm:text-4xl">
                {organization.name}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475467] sm:text-base">
                {organization.description || 'Product updates, improvements, and fixes published by this organization.'}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-6">
          <SearchFilter releaseNotes={releaseNotes} onFilter={setFilteredNotes} brandColor={brandColor} />
        </section>

        {filteredNotes.length === 0 ? (
          <section className="rounded-xl border border-dashed border-[#d0d5dd] bg-white px-6 py-14 text-center">
            <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-[#98a2b3]" />
            <h2 className="text-lg font-semibold text-[#101828]">No release notes found</h2>
            <p className="mt-2 text-sm text-[#667085]">
              {releaseNotes.length === 0
                ? `${organization.name} has not published release notes yet.`
                : 'Try a different search term or remove filters.'}
            </p>
          </section>
        ) : (
          <section className="space-y-8">
            {groupedNotes.map((group) => (
              <div key={group.month} className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-[#101828]">{group.month}</h2>

                <div className="space-y-4">
                  {group.notes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-xl border border-[#e4e7ec] bg-white px-5 py-5 shadow-sm transition-shadow hover:shadow-md sm:px-6"
                    >
                      <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-6">
                        <div className="sm:border-r sm:border-[#eaecf0] sm:pr-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Published</p>
                          <p className="mt-1 text-sm font-medium text-[#101828]">{formatDate(note.published_at)}</p>

                          {(note.views ?? 0) > 0 && (
                            <p className="mt-3 flex items-center gap-1 text-xs text-[#667085]">
                              <EyeIcon className="h-3.5 w-3.5" />
                              {note.views?.toLocaleString()} views
                            </p>
                          )}
                        </div>

                        <div>
                          <h3 className="font-display text-xl font-semibold leading-tight text-[#101828]">
                            <Link
                              href={`/notes/${orgSlug}/${note.slug}`}
                              className="hover:opacity-80"
                              style={{ color: 'var(--brand-color)' }}
                            >
                              {note.title}
                            </Link>
                          </h3>

                          <p className="mt-3 text-sm leading-6 text-[#475467] sm:text-base">
                            {note.excerpt || extractTextPreview(note.content_html || '')}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {note.category && (
                              <Badge variant="outline" className="border-[#d0d5dd] bg-[#f9fafb] text-[#344054]">
                                {note.category}
                              </Badge>
                            )}

                            {note.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-[#f2f4f7] text-[#344054]">
                                <TagIcon className="mr-1 h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}

                            {note.tags && note.tags.length > 3 && (
                              <Badge variant="outline">+{note.tags.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <footer className="mt-14 border-t border-[#e4e7ec] pt-6 text-center text-xs text-[#667085] sm:text-sm">
          Powered by <span className="font-semibold">ReleaseNoteAI</span>
        </footer>
      </div>
    </div>
  )
}
