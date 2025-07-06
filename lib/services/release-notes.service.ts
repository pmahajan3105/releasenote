import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateSlug } from '@/lib/utils'
import type { Database, ReleaseNote, ReleaseNoteInsert, ReleaseNoteUpdate } from '@/types/database'

type SupabaseClient = ReturnType<typeof createRouteHandlerClient<Database>>

export interface CreateReleaseNoteData {
  title?: string
  slug?: string
  version?: string
  content?: string
  content_markdown?: string
  content_html?: string
  status?: 'draft' | 'published' | 'scheduled'
  author_id?: string
  published_at?: string
  source_ticket_ids?: string[]
}

export interface UpdateReleaseNoteData {
  title?: string
  slug?: string
  version?: string
  content?: string
  content_markdown?: string
  content_html?: string
  status?: 'draft' | 'published' | 'scheduled'
  published_at?: string
  source_ticket_ids?: string[]
}

export interface ReleaseNoteFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Service class for managing release notes operations
 * Provides CRUD operations and business logic for release notes
 */
export class ReleaseNotesService {
  private supabase = createRouteHandlerClient<Database>({ cookies })

  /**
   * Retrieves all release notes for an organization with optional filtering
   * Uses optimized queries with proper indexing for better performance
   * @param organizationId - The organization's unique identifier
   * @param filters - Optional filters for status, search, pagination
   * @returns Promise containing release notes data and pagination info
   * @example
   * ```typescript
   * const service = new ReleaseNotesService()
   * const result = await service.findAll('org-123', { 
   *   status: 'published', 
   *   page: 1, 
   *   limit: 10 
   * })
   * ```
   */
  async findAll(
    organizationId: string, 
    filters: ReleaseNoteFilters = {}
  ): Promise<{ data: ReleaseNote[]; pagination: any }> {
    const { status, search, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    // Use optimized search function for full-text search
    if (search) {
      const { data: searchResults, error: searchError } = await this.supabase
        .rpc('search_release_notes', {
          p_organization_id: organizationId,
          p_search_query: search,
          p_status: status || null,
          p_limit: limit,
          p_offset: offset
        })

      if (searchError) {
        throw new Error(`Failed to search release notes: ${searchError.message}`)
      }

      // Get count for search results
      const { data: countResults, error: countError } = await this.supabase
        .rpc('search_release_notes', {
          p_organization_id: organizationId,
          p_search_query: search,
          p_status: status || null,
          p_limit: 999999, // Large number to get all results for count
          p_offset: 0
        })

      if (countError) {
        throw new Error(`Failed to count search results: ${countError.message}`)
      }

      return {
        data: searchResults || [],
        pagination: {
          page,
          limit,
          total: countResults?.length || 0,
          totalPages: Math.ceil((countResults?.length || 0) / limit)
        }
      }
    }

    // Use optimized index-backed query for non-search queries
    let query = this.supabase
      .from('release_notes')
      .select(`
        *,
        author:users!author_id(name, email)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter (utilizes idx_release_notes_org_status_created index)
    if (status) {
      query = query.eq('status', status)
    }

    const { data: releaseNotes, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch release notes: ${error.message}`)
    }

    return {
      data: releaseNotes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * Retrieves a single release note by ID for a specific organization
   * @param id - The release note's unique identifier
   * @param organizationId - The organization's unique identifier
   * @returns Promise containing the release note or null if not found
   * @example
   * ```typescript
   * const releaseNote = await service.findById('note-123', 'org-456')
   * if (releaseNote) {
   *   console.log(`Found: ${releaseNote.title}`)
   * }
   * ```
   */
  async findById(id: string, organizationId: string): Promise<ReleaseNote | null> {
    const { data: releaseNote, error } = await this.supabase
      .from('release_notes')
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single()

    if (error || !releaseNote) {
      return null
    }

    return releaseNote
  }

  /**
   * Create a new release note
   */
  async create(
    organizationId: string, 
    authorId: string, 
    data: CreateReleaseNoteData
  ): Promise<ReleaseNote> {
    // Generate unique slug
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data: existing } = await this.supabase
        .from('release_notes')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('slug', slug)
        .single()

      if (!existing) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const { data: releaseNote, error } = await this.supabase
      .from('release_notes')
      .insert({
        organization_id: organizationId,
        title: data.title,
        description: data.description,
        content_markdown: data.content_markdown,
        content_html: data.content_html || data.content_markdown,
        slug,
        version: data.version,
        status: data.status || 'draft',
        author_id: authorId,
        is_public: data.is_public || false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create release note: ${error.message}`)
    }

    return releaseNote
  }

  /**
   * Update a release note
   */
  async update(
    id: string, 
    organizationId: string, 
    data: UpdateReleaseNoteData
  ): Promise<ReleaseNote> {
    const updateData: any = {}

    const allowedFields = [
      'title', 'description', 'content_markdown', 'content_html',
      'version', 'is_public'
    ]

    // Only update provided fields
    allowedFields.forEach(field => {
      if (data[field as keyof UpdateReleaseNoteData] !== undefined) {
        updateData[field] = data[field as keyof UpdateReleaseNoteData]
      }
    })

    // Update slug if title changed
    if (data.title) {
      const baseSlug = generateSlug(data.title)
      let slug = baseSlug
      let counter = 1

      while (true) {
        const { data: existing } = await this.supabase
          .from('release_notes')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('slug', slug)
          .neq('id', id)
          .single()

        if (!existing) break

        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    const { data: updatedNote, error } = await this.supabase
      .from('release_notes')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update release note: ${error.message}`)
    }

    return updatedNote
  }

  /**
   * Delete a release note
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('release_notes')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete release note: ${error.message}`)
    }
  }

  /**
   * Publish a release note
   */
  async publish(id: string, organizationId: string): Promise<ReleaseNote> {
    const { data: updatedNote, error } = await this.supabase
      .from('release_notes')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to publish release note: ${error.message}`)
    }

    return updatedNote
  }

  /**
   * Get public release notes for an organization
   * Uses optimized index for public pages (idx_release_notes_public_published)
   */
  async findPublic(organizationId: string, limit = 10): Promise<ReleaseNote[]> {
    const { data: releaseNotes, error } = await this.supabase
      .from('release_notes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch public release notes: ${error.message}`)
    }

    return releaseNotes || []
  }

  /**
   * Get organization dashboard statistics using optimized function
   */
  async getOrganizationStats(organizationId: string): Promise<{
    totalReleaseNotes: number
    publishedNotes: number
    draftNotes: number
    totalSubscribers: number
    activeIntegrations: number
  }> {
    const { data: stats, error } = await this.supabase
      .rpc('get_organization_stats', {
        p_organization_id: organizationId
      })
      .single()

    if (error) {
      throw new Error(`Failed to fetch organization stats: ${error.message}`)
    }

    return {
      totalReleaseNotes: stats?.total_release_notes || 0,
      publishedNotes: stats?.published_notes || 0,
      draftNotes: stats?.draft_notes || 0,
      totalSubscribers: stats?.total_subscribers || 0,
      activeIntegrations: stats?.active_integrations || 0
    }
  }

  /**
   * Get recent activity feed for organization dashboard
   */
  async getRecentActivity(organizationId: string, limit = 10): Promise<Array<{
    activityType: string
    activityId: string
    title: string
    createdAt: string
  }>> {
    const { data: activities, error } = await this.supabase
      .rpc('get_recent_activity', {
        p_organization_id: organizationId,
        p_limit: limit
      })

    if (error) {
      throw new Error(`Failed to fetch recent activity: ${error.message}`)
    }

    return (activities || []).map(activity => ({
      activityType: activity.activity_type,
      activityId: activity.activity_id,
      title: activity.title,
      createdAt: activity.created_at
    }))
  }
}