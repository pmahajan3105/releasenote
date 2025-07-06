import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  organizations?: Array<{
    organization_id: string
    role: string
    organization: any
  }>
}

export class UserService {
  private supabase = createRouteHandlerClient({ cookies })

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !user) {
      return null
    }

    return user
  }

  /**
   * Get user with organizations
   */
  async findWithOrganizations(id: string): Promise<UserProfile | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select(`
        *,
        organization_members (
          organization_id,
          role,
          organizations (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !user) {
      return null
    }

    return {
      ...user,
      organizations: user.organization_members
    }
  }

  /**
   * Update user profile
   */
  async update(id: string, data: { name?: string; avatar_url?: string }): Promise<User> {
    const { data: user, error } = await this.supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return user
  }

  /**
   * Create or update user from auth
   */
  async upsertFromAuth(authUser: any): Promise<User> {
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
      avatar_url: authUser.user_metadata?.avatar_url
    }

    const { data: user, error } = await this.supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert user: ${error.message}`)
    }

    return user
  }

  /**
   * Delete user account
   */
  async delete(id: string): Promise<void> {
    // Note: This would also need to handle cleanup of related data
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<any> {
    const { data: preferences, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch preferences: ${error.message}`)
    }

    return preferences?.preferences || {}
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<void> {
    const { error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences
      }, { onConflict: 'user_id' })

    if (error) {
      throw new Error(`Failed to update preferences: ${error.message}`)
    }
  }
}