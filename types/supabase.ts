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
          name: string
          slug: string | null
          description: string | null
          user_id: string
          logo_url: string | null
          settings: Json
          plan: string
          updated_at: string
          custom_domain: string | null
          domain_verified: boolean
          meta_title: string | null
          meta_description: string | null
          meta_image_url: string | null
          favicon_url: string | null
          brand_color: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug?: string | null
          description?: string | null
          user_id: string
          logo_url?: string | null
          settings?: Json
          plan?: string
          updated_at?: string
          custom_domain?: string | null
          domain_verified?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          favicon_url?: string | null
          brand_color?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string | null
          description?: string | null
          user_id?: string
          logo_url?: string | null
          settings?: Json
          plan?: string
          updated_at?: string
          custom_domain?: string | null
          domain_verified?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          favicon_url?: string | null
          brand_color?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      release_notes: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          title: string
          content: string | null
          slug: string | null
          content_markdown: string | null
          content_html: string | null
          status: string
          author_id: string | null
          source_ticket_ids: string[] | null
          views: number
          updated_at: string
          published_at: string | null
          cover_image_url: string | null
          meta_title: string | null
          meta_description: string | null
          meta_image_url: string | null
          og_title: string | null
          og_description: string | null
          twitter_title: string | null
          twitter_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          title: string
          content?: string | null
          slug?: string | null
          content_markdown?: string | null
          content_html?: string | null
          status?: string
          author_id?: string | null
          source_ticket_ids?: string[] | null
          views?: number
          updated_at?: string
          published_at?: string | null
          cover_image_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          og_title?: string | null
          og_description?: string | null
          twitter_title?: string | null
          twitter_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          title?: string
          content?: string | null
          slug?: string | null
          content_markdown?: string | null
          content_html?: string | null
          status?: string
          author_id?: string | null
          source_ticket_ids?: string[] | null
          views?: number
          updated_at?: string
          published_at?: string | null
          cover_image_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          og_title?: string | null
          og_description?: string | null
          twitter_title?: string | null
          twitter_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          user_id: string
          role: string
          invited_by: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          user_id: string
          role?: string
          invited_by?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          user_id?: string
          role?: string
          invited_by?: string | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          name: string
          content: string
          is_default: boolean
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          name: string
          content: string
          is_default?: boolean
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          name?: string
          content?: string
          is_default?: boolean
          created_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      subscribers: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          email: string
          name: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          email: string
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          email?: string
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      integrations: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          type: string
          config: Json
          is_active: boolean
          last_sync: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          type: string
          config: Json
          is_active?: boolean
          last_sync?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          type?: string
          config?: Json
          is_active?: boolean
          last_sync?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      domain_verifications: {
        Row: {
          id: string
          organization_id: string
          domain: string
          verification_token: string
          verification_method: string
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          domain: string
          verification_token: string
          verification_method?: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          domain?: string
          verification_token?: string
          verification_method?: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for JOIN queries
export type ReleaseNoteWithOrganization = Database['public']['Tables']['release_notes']['Row'] & {
  organizations: Pick<Database['public']['Tables']['organizations']['Row'], 'name' | 'logo_url'>
}

export type OrganizationWithMembers = Database['public']['Tables']['organizations']['Row'] & {
  organization_members: Database['public']['Tables']['organization_members']['Row'][]
}

// Common type aliases
export type Organization = Database['public']['Tables']['organizations']['Row']
export type ReleaseNote = Database['public']['Tables']['release_notes']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']
export type DomainVerification = Database['public']['Tables']['domain_verifications']['Row']
