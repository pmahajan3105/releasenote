import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { 
  Database, 
  Organization, 
  OrganizationMember
} from '@/types/database'

export interface OrganizationWithMembership extends Organization {
  membership?: OrganizationMember
}

export class OrganizationService {
  private supabase = createRouteHandlerClient<Database>({ cookies })

  /**
   * Get organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const { data: organization, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !organization) {
      return null
    }

    return organization
  }

  /**
   * Get organization by slug
   */
  async findBySlug(slug: string): Promise<Organization | null> {
    const { data: organization, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !organization) {
      return null
    }

    return organization
  }

  /**
   * Get user's organizations with membership info
   */
  async findByUserId(userId: string): Promise<OrganizationWithMembership[]> {
    const { data: memberships, error } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch user organizations: ${error.message}`)
    }

    return (memberships || []).map(membership => ({
      ...membership.organizations,
      membership
    }))
  }

  /**
   * Get user's primary organization
   */
  async findPrimaryByUserId(userId: string): Promise<OrganizationWithMembership | null> {
    const { data: membership, error } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error || !membership) {
      return null
    }

    return {
      ...membership.organizations,
      membership
    }
  }

  /**
   * Check if user has access to organization
   */
  async validateUserAccess(
    userId: string, 
    organizationId: string
  ): Promise<{ organization: Organization; membership: OrganizationMember } | null> {
    const { data: membership, error } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error || !membership) {
      return null
    }

      return {
        organization: membership.organizations,
        membership: {
          id: membership.id,
          user_id: membership.user_id,
          organization_id: membership.organization_id,
          role: membership.role,
          created_at: membership.created_at,
          invited_by: membership.invited_by ?? null,
          joined_at: membership.joined_at ?? null
        }
      }
    }

  /**
   * Create a new organization
   */
  async create(
    name: string, 
    slug: string, 
    ownerId: string, 
    settings?: Record<string, unknown>
  ): Promise<Organization> {
    // Check if slug is already taken
    const existing = await this.findBySlug(slug)
    if (existing) {
      throw new Error('Organization slug already exists')
    }

    const { data: organization, error } = await this.supabase
      .from('organizations')
      .insert({
        name,
        slug,
        settings: settings || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`)
    }

    // Add owner as member
    const { error: memberError } = await this.supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: ownerId,
        role: 'owner'
      })

    if (memberError) {
      // Rollback organization creation
      await this.supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id)
      
      throw new Error(`Failed to add owner to organization: ${memberError.message}`)
    }

    return organization
  }

  /**
   * Update organization
   */
  async update(
    id: string, 
    data: { name?: string; slug?: string; settings?: Record<string, unknown> }
  ): Promise<Organization> {
    // Check if slug is already taken by another organization
    if (data.slug) {
      const existing = await this.supabase
        .from('organizations')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', id)
        .single()

      if (existing.data) {
        throw new Error('Organization slug already exists')
      }
    }

    const { data: organization, error } = await this.supabase
      .from('organizations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`)
    }

    return organization
  }

  /**
   * Delete organization
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`)
    }
  }

  /**
   * Add member to organization
   */
  async addMember(
    organizationId: string, 
    userId: string, 
    role: 'admin' | 'member' = 'member'
  ): Promise<OrganizationMember> {
    const { data: member, error } = await this.supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add member to organization: ${error.message}`)
    }

    return member
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to remove member from organization: ${error.message}`)
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    organizationId: string, 
    userId: string, 
    role: 'owner' | 'admin' | 'member'
  ): Promise<OrganizationMember> {
    const { data: member, error } = await this.supabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update member role: ${error.message}`)
    }

    return member
  }
}
