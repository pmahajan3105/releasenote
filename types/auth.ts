/**
 * TypeScript type definitions for authentication and authorization
 * Provides type-safe interfaces for Supabase auth integration
 */

import type { User, Session } from '@supabase/supabase-js'
import type { Organization, OrganizationMember } from './database'

// Base auth user type extending Supabase User
export interface AuthUser extends User {
  // Supabase User already includes: id, email, phone, created_at, updated_at, etc.
  // We can add additional properties if needed
}

// Base auth session type extending Supabase Session  
export interface AuthSession extends Session {
  // Supabase Session already includes: access_token, refresh_token, expires_in, user, etc.
  // We can add additional properties if needed
}

// Organization with membership information (for JOIN queries)
export interface AuthOrganization extends Organization {
  // Additional computed properties for auth context
  membership?: OrganizationMember
  userRole?: string
}

// Result type for organization membership JOIN queries
export interface OrganizationMembershipWithOrg {
  id: string
  created_at: string
  organization_id: string
  user_id: string
  role: string
  invited_by: string | null
  joined_at: string | null
  // Nested organization data from JOIN
  organizations: Organization
}

// Enhanced auth context with proper typing
export interface AuthContext {
  user: AuthUser
  session: AuthSession
  organizationId: string
  userRole: string
  organization: AuthOrganization
}

// Error response type
export interface AuthError {
  error: string
  status: number
  details?: Record<string, unknown>
}

// Type guard function signatures
export type UserTypeGuard = (user: unknown) => user is AuthUser
export type SessionTypeGuard = (session: unknown) => session is AuthSession
export type OrganizationTypeGuard = (org: unknown) => org is AuthOrganization

// Role hierarchy type
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

// Permission levels
export interface PermissionLevel {
  canManageOrganization: boolean
  canEditReleaseNotes: boolean
  canViewReleaseNotes: boolean
  canManageIntegrations: boolean
  canManageMembers: boolean
  canViewAnalytics: boolean
}

// Utility types for auth operations
export interface AuthOperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Session validation result
export type SessionValidationResult = AuthContext | AuthError

// Organization access validation result
export interface OrganizationAccessResult {
  organization: AuthOrganization
  userRole: string
}

export type OrganizationValidationResult = OrganizationAccessResult | AuthError

// Type for higher-order function handlers
export type AuthenticatedHandler<T extends unknown[] = []> = (
  request: Request,
  context: AuthContext,
  ...args: T
) => Promise<Response>

// Type for organization-protected handlers
export type OrganizationHandler<T extends unknown[] = []> = AuthenticatedHandler<T>

// Database query result types for type safety
export interface OrganizationQueryResult {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  description: string | null
  user_id: string | null
  logo_url: string | null
  settings: Record<string, unknown>
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

export interface MembershipQueryResult {
  id: string
  created_at: string
  organization_id: string
  user_id: string
  role: string
  invited_by: string | null
  joined_at: string | null
  organizations: OrganizationQueryResult
}

// Runtime validation schema types
export interface ValidationSchema<T> {
  validate: (data: unknown) => { isValid: boolean; data?: T; errors?: string[] }
}

// Configuration types
export interface AuthConfig {
  enableRoleHierarchy: boolean
  defaultRole: UserRole
  sessionTimeout: number
  enableRuntimeValidation: boolean
}
