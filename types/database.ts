/**
 * Canonical Database Types (App-Facing)
 *
 * This file is the single source of truth for the app's Supabase `Database` type.
 * It intentionally models the *practical* schema used by the app (not every table).
 *
 * Note: In this repo, some API routes use untyped Supabase clients. This type is
 * primarily for typed clients (`createClient<Database>()`) and server components.
 */

// Supabase-style JSON type (keeps JSON columns type-safe without `any`).
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          user_id: string | null
          logo_url: string | null
          settings: Json
          plan: string | null
          custom_domain: string | null
          domain_verified: boolean
          meta_title: string | null
          meta_description: string | null
          meta_image_url: string | null
          favicon_url: string | null
          brand_color: string | null
          custom_css: string | null
          custom_css_enabled: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          user_id?: string | null
          logo_url?: string | null
          settings?: Json
          plan?: string | null
          custom_domain?: string | null
          domain_verified?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          favicon_url?: string | null
          brand_color?: string | null
          custom_css?: string | null
          custom_css_enabled?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          user_id?: string | null
          logo_url?: string | null
          settings?: Json
          plan?: string | null
          custom_domain?: string | null
          domain_verified?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          favicon_url?: string | null
          brand_color?: string | null
          custom_css?: string | null
          custom_css_enabled?: boolean | null
        }
      }
      organization_members: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string | null
        }
      }
      integrations: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          type: 'github' | 'jira' | 'linear'
          external_id: string | null
          encrypted_credentials: Json | null
          config: Json
          is_active: boolean | null
          last_sync: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          type: 'github' | 'jira' | 'linear'
          external_id?: string | null
          encrypted_credentials?: Json | null
          config?: Json
          is_active?: boolean | null
          last_sync?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          type?: 'github' | 'jira' | 'linear'
          external_id?: string | null
          encrypted_credentials?: Json | null
          config?: Json
          is_active?: boolean | null
          last_sync?: string | null
          updated_at?: string | null
        }
      }
      release_notes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          integration_id: string | null
          title: string
          slug: string
          version: string | null
          content: string | null
          content_markdown: string | null
          content_html: string | null
          content_json: Json | null
          status: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id: string | null
          published_at: string | null
          scheduled_at: string | null
          published_by: string | null
          tags: string[] | null
          category: string | null
          featured_image_url: string | null
          excerpt: string | null
          views: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          integration_id?: string | null
          title: string
          slug?: string
          version?: string | null
          content?: string | null
          content_markdown?: string | null
          content_html?: string | null
          content_json?: Json | null
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          published_by?: string | null
          tags?: string[] | null
          category?: string | null
          featured_image_url?: string | null
          excerpt?: string | null
          views?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          integration_id?: string | null
          title?: string
          slug?: string
          version?: string | null
          content?: string | null
          content_markdown?: string | null
          content_html?: string | null
          content_json?: Json | null
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          author_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          published_by?: string | null
          tags?: string[] | null
          category?: string | null
          featured_image_url?: string | null
          excerpt?: string | null
          views?: number | null
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
      release_note_notifications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          release_note_id: string
          subscriber_id: string
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          release_note_id: string
          subscriber_id: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          release_note_id?: string
          subscriber_id?: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
        }
      }
      ticket_cache: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          integration_type: 'github' | 'jira' | 'linear'
          ticket_id: string
          title: string | null
          description: string | null
          status: string | null
          assignee: string | null
          url: string | null
          metadata: Json
          cached_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          integration_type: 'github' | 'jira' | 'linear'
          ticket_id: string
          title?: string | null
          description?: string | null
          status?: string | null
          assignee?: string | null
          url?: string | null
          metadata?: Json
          cached_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          integration_type?: 'github' | 'jira' | 'linear'
          ticket_id?: string
          title?: string | null
          description?: string | null
          status?: string | null
          assignee?: string | null
          url?: string | null
          metadata?: Json
          cached_at?: string
          updated_at?: string | null
        }
      }
      oauth_states: {
        Row: {
          id: string
          state: string
          provider: 'github' | 'jira' | 'linear'
          user_id: string
          pkce_verifier: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          state: string
          provider: 'github' | 'jira' | 'linear'
          user_id: string
          pkce_verifier?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          state?: string
          provider?: 'github' | 'jira' | 'linear'
          user_id?: string
          pkce_verifier?: string | null
          created_at?: string
          expires_at?: string
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
