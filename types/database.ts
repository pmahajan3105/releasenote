/**
 * Enhanced Database Types
 * Matches the PRD schema requirements and enhanced migration
 */

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description?: string
          slug?: string
          user_id: string
          settings: Record<string, any>
          plan: 'free' | 'professional' | 'growth'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string
          slug?: string
          user_id: string
          settings?: Record<string, any>
          plan?: 'free' | 'professional' | 'growth'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          slug?: string
          user_id?: string
          settings?: Record<string, any>
          plan?: 'free' | 'professional' | 'growth'
        }
      }
      organization_members: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string
          joined_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string
          joined_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string
          joined_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          type: 'github' | 'jira' | 'linear' | 'slack'
          config: Record<string, any>
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          type: 'github' | 'jira' | 'linear' | 'slack'
          config: Record<string, any>
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          type?: 'github' | 'jira' | 'linear' | 'slack'
          config?: Record<string, any>
        }
      }
      release_notes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          title?: string
          slug?: string
          version?: string
          content?: string
          content_markdown?: string
          content_html?: string
          status: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id?: string
          published_at?: string
          source_ticket_ids?: string[]
          views: number
          scheduled_at?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          title?: string
          slug?: string
          version?: string
          content?: string
          content_markdown?: string
          content_html?: string
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id?: string
          published_at?: string
          source_ticket_ids?: string[]
          views?: number
          scheduled_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          title?: string
          slug?: string
          version?: string
          content?: string
          content_markdown?: string
          content_html?: string
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id?: string
          published_at?: string
          source_ticket_ids?: string[]
          views?: number
          scheduled_at?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          name: string
          content: string
          is_default: boolean
          created_by?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          name: string
          content: string
          is_default?: boolean
          created_by?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          name?: string
          content?: string
          is_default?: boolean
          created_by?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          email: string
          name?: string
          subscribed_at: string
          unsubscribed_at?: string
          status: 'active' | 'unsubscribed' | 'bounced'
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          email: string
          name?: string
          subscribed_at?: string
          unsubscribed_at?: string
          status?: 'active' | 'unsubscribed' | 'bounced'
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          email?: string
          name?: string
          subscribed_at?: string
          unsubscribed_at?: string
          status?: 'active' | 'unsubscribed' | 'bounced'
        }
      }
      ticket_cache: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          integration_type: 'github' | 'jira' | 'linear'
          ticket_id: string
          ticket_data: Record<string, any>
          cached_at: string
          expires_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          integration_type: 'github' | 'jira' | 'linear'
          ticket_id: string
          ticket_data: Record<string, any>
          cached_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          integration_type?: 'github' | 'jira' | 'linear'
          ticket_id?: string
          ticket_data?: Record<string, any>
          cached_at?: string
          expires_at?: string
        }
      }
      user_oauth_states: {
        Row: {
          id: string
          created_at: string
          user_id: string
          provider: string
          state: string
          expires_at: string
          used_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          provider: string
          state: string
          expires_at: string
          used_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          provider?: string
          state?: string
          expires_at?: string
          used_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_oauth_states: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      cleanup_expired_ticket_cache: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Utility types for easier usage
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type OrganizationMemberInsert = Database['public']['Tables']['organization_members']['Insert']
export type OrganizationMemberUpdate = Database['public']['Tables']['organization_members']['Update']

export type Integration = Database['public']['Tables']['integrations']['Row']
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
export type IntegrationUpdate = Database['public']['Tables']['integrations']['Update']

export type ReleaseNote = Database['public']['Tables']['release_notes']['Row']
export type ReleaseNoteInsert = Database['public']['Tables']['release_notes']['Insert']
export type ReleaseNoteUpdate = Database['public']['Tables']['release_notes']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert']
export type SubscriberUpdate = Database['public']['Tables']['subscribers']['Update']

export type TicketCache = Database['public']['Tables']['ticket_cache']['Row']
export type TicketCacheInsert = Database['public']['Tables']['ticket_cache']['Insert']
export type TicketCacheUpdate = Database['public']['Tables']['ticket_cache']['Update']

export type UserOAuthState = Database['public']['Tables']['user_oauth_states']['Row']
export type UserOAuthStateInsert = Database['public']['Tables']['user_oauth_states']['Insert']
export type UserOAuthStateUpdate = Database['public']['Tables']['user_oauth_states']['Update']