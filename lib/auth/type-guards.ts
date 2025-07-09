/**
 * Runtime type guards and validation functions for auth types
 * Ensures type safety at runtime and prevents type-related errors
 */

import type { 
  AuthUser, 
  AuthSession, 
  AuthOrganization, 
  OrganizationMembershipWithOrg,
  MembershipQueryResult,
  OrganizationQueryResult
} from '@/types/auth'

/**
 * Validates if an object is a valid Supabase User
 */
export function isValidUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== 'object') {
    return false
  }

  const u = user as Record<string, unknown>
  
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.created_at === 'string' &&
    typeof u.updated_at === 'string' &&
    (u.phone === null || typeof u.phone === 'string') &&
    (u.email_confirmed_at === null || typeof u.email_confirmed_at === 'string') &&
    (u.phone_confirmed_at === null || typeof u.phone_confirmed_at === 'string')
  )
}

/**
 * Validates if an object is a valid Supabase Session
 */
export function isValidSession(session: unknown): session is AuthSession {
  if (!session || typeof session !== 'object') {
    return false
  }

  const s = session as Record<string, unknown>
  
  return (
    typeof s.access_token === 'string' &&
    typeof s.refresh_token === 'string' &&
    typeof s.expires_in === 'number' &&
    typeof s.token_type === 'string' &&
    isValidUser(s.user)
  )
}

/**
 * Validates if an object is a valid Organization
 */
export function isValidOrganization(org: unknown): org is AuthOrganization {
  if (!org || typeof org !== 'object') {
    return false
  }

  const o = org as Record<string, unknown>
  
  return (
    typeof o.id === 'string' &&
    typeof o.created_at === 'string' &&
    typeof o.updated_at === 'string' &&
    typeof o.name === 'string' &&
    typeof o.user_id === 'string' &&
    typeof o.settings === 'object' &&
    (o.description === null || typeof o.description === 'string') &&
    (o.slug === null || typeof o.slug === 'string') &&
    (typeof o.plan === 'string' && ['free', 'professional', 'growth'].includes(o.plan as string))
  )
}

/**
 * Validates if an object is a valid OrganizationMember
 */
export function isValidMembership(membership: unknown): membership is OrganizationMembershipWithOrg {
  if (!membership || typeof membership !== 'object') {
    return false
  }

  const m = membership as Record<string, unknown>
  
  return (
    typeof m.id === 'string' &&
    typeof m.created_at === 'string' &&
    typeof m.organization_id === 'string' &&
    typeof m.user_id === 'string' &&
    typeof m.role === 'string' &&
    (m.invited_by === null || typeof m.invited_by === 'string') &&
    (m.joined_at === null || typeof m.joined_at === 'string')
  )
}

/**
 * Validates if an object is a valid membership query result with organization data
 */
export function isValidMembershipQueryResult(result: unknown): result is MembershipQueryResult {
  if (!result || typeof result !== 'object') {
    return false
  }

  const r = result as Record<string, unknown>
  
  return (
    isValidMembership(r) &&
    isValidOrganization(r.organizations)
  )
}

/**
 * Validates if a string is a valid user role
 */
export function isValidUserRole(role: string): role is 'owner' | 'admin' | 'editor' | 'viewer' {
  return ['owner', 'admin', 'editor', 'viewer'].includes(role)
}

/**
 * Validates if a string is a valid organization plan
 */
export function isValidPlan(plan: string): plan is 'free' | 'professional' | 'growth' {
  return ['free', 'professional', 'growth'].includes(plan)
}

/**
 * Validates and normalizes organization data from database queries
 */
export function validateOrganizationData(data: unknown): {
  isValid: boolean
  organization?: AuthOrganization
  errors?: string[]
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Organization data is not an object')
    return { isValid: false, errors }
  }

  const org = data as Record<string, unknown>

  // Validate required fields
  if (!org.id || typeof org.id !== 'string') {
    errors.push('Organization ID is required and must be a string')
  }

  if (!org.name || typeof org.name !== 'string') {
    errors.push('Organization name is required and must be a string')
  }

  if (!org.user_id || typeof org.user_id !== 'string') {
    errors.push('Organization user_id is required and must be a string')
  }

  if (!org.created_at || typeof org.created_at !== 'string') {
    errors.push('Organization created_at is required and must be a string')
  }

  if (!org.updated_at || typeof org.updated_at !== 'string') {
    errors.push('Organization updated_at is required and must be a string')
  }

  // Validate optional fields
  if (org.description !== null && typeof org.description !== 'string') {
    errors.push('Organization description must be a string or null')
  }

  if (org.slug !== null && typeof org.slug !== 'string') {
    errors.push('Organization slug must be a string or null')
  }

  if (org.plan && !isValidPlan(org.plan as string)) {
    errors.push('Organization plan must be one of: free, professional, growth')
  }

  if (org.settings === null || typeof org.settings !== 'object') {
    errors.push('Organization settings must be an object')
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Create normalized organization object
  const organization: AuthOrganization = {
    id: org.id as string,
    created_at: org.created_at as string,
    updated_at: org.updated_at as string,
    name: org.name as string,
    description: org.description as string | undefined,
    slug: org.slug as string | undefined,
    user_id: org.user_id as string,
    settings: org.settings as Record<string, unknown>,
    plan: (org.plan as 'free' | 'professional' | 'growth') || 'free'
  }

  return { isValid: true, organization }
}

/**
 * Validates and normalizes membership query result with organization data
 */
export function validateMembershipQueryResult(data: unknown): {
  isValid: boolean
  membership?: MembershipQueryResult
  errors?: string[]
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Membership data is not an object')
    return { isValid: false, errors }
  }

  const membership = data as Record<string, unknown>

  // Validate membership fields
  if (!membership.id || typeof membership.id !== 'string') {
    errors.push('Membership ID is required and must be a string')
  }

  if (!membership.organization_id || typeof membership.organization_id !== 'string') {
    errors.push('Membership organization_id is required and must be a string')
  }

  if (!membership.user_id || typeof membership.user_id !== 'string') {
    errors.push('Membership user_id is required and must be a string')
  }

  if (!membership.role || typeof membership.role !== 'string') {
    errors.push('Membership role is required and must be a string')
  }

  if (!isValidUserRole(membership.role as string)) {
    errors.push('Membership role must be one of: owner, admin, editor, viewer')
  }

  // Validate nested organization data
  if (!membership.organizations) {
    errors.push('Membership must include organization data')
  } else {
    const orgValidation = validateOrganizationData(membership.organizations)
    if (!orgValidation.isValid) {
      errors.push(...(orgValidation.errors || []))
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Create normalized membership object
  const result: MembershipQueryResult = {
    id: membership.id as string,
    created_at: membership.created_at as string,
    organization_id: membership.organization_id as string,
    user_id: membership.user_id as string,
    role: membership.role as string,
    invited_by: membership.invited_by as string | null,
    joined_at: membership.joined_at as string | null,
    organizations: validateOrganizationData(membership.organizations).organization!
  }

  return { isValid: true, membership: result }
}

/**
 * Helper function to safely extract organization data from JOIN query result
 */
export function extractOrganizationFromMembership(
  membershipData: MembershipQueryResult
): AuthOrganization {
  return {
    ...membershipData.organizations,
    membership: {
      id: membershipData.id,
      created_at: membershipData.created_at,
      organization_id: membershipData.organization_id,
      user_id: membershipData.user_id,
      role: membershipData.role,
      invited_by: membershipData.invited_by,
      joined_at: membershipData.joined_at
    },
    userRole: membershipData.role
  }
}

/**
 * Validates the complete auth context structure
 */
export function validateAuthContext(context: unknown): {
  isValid: boolean
  context?: {
    user: AuthUser
    session: AuthSession
    organizationId: string
    userRole: string
    organization: AuthOrganization
  }
  errors?: string[]
} {
  const errors: string[] = []

  if (!context || typeof context !== 'object') {
    errors.push('Auth context must be an object')
    return { isValid: false, errors }
  }

  const ctx = context as Record<string, unknown>

  if (!isValidUser(ctx.user)) {
    errors.push('Invalid user object in auth context')
  }

  if (!isValidSession(ctx.session)) {
    errors.push('Invalid session object in auth context')
  }

  if (!ctx.organizationId || typeof ctx.organizationId !== 'string') {
    errors.push('Organization ID is required and must be a string')
  }

  if (!ctx.userRole || typeof ctx.userRole !== 'string') {
    errors.push('User role is required and must be a string')
  }

  if (!isValidUserRole(ctx.userRole as string)) {
    errors.push('User role must be one of: owner, admin, editor, viewer')
  }

  if (!isValidOrganization(ctx.organization)) {
    errors.push('Invalid organization object in auth context')
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    context: {
      user: ctx.user as AuthUser,
      session: ctx.session as AuthSession,
      organizationId: ctx.organizationId as string,
      userRole: ctx.userRole as string,
      organization: ctx.organization as AuthOrganization
    }
  }
}