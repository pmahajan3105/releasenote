import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { 
  AuthContext, 
  AuthError, 
  AuthUser, 
  AuthSession, 
  AuthOrganization,
  SessionValidationResult,
  OrganizationValidationResult,
  MembershipQueryResult
} from '@/types/auth'
import { 
  isValidUser, 
  isValidSession, 
  validateMembershipQueryResult, 
  extractOrganizationFromMembership 
} from '@/lib/auth/type-guards'

/**
 * Validates user session and returns typed auth context
 * 
 * This function:
 * - Validates Supabase session and user data
 * - Fetches organization membership with proper JOIN queries
 * - Performs runtime type validation on all data
 * - Returns fully typed AuthContext or detailed error information
 * 
 * @param request - The Next.js request object
 * @returns Promise<SessionValidationResult> - Either AuthContext or AuthError with details
 * 
 * @example
 * ```typescript
 * const authResult = await validateUserSession(request)
 * if ('error' in authResult) {
 *   return NextResponse.json({ 
 *     error: authResult.error,
 *     details: authResult.details 
 *   }, { status: authResult.status })
 * }
 * 
 * // Now you have full type safety
 * console.log(`User: ${authResult.user.email}`)
 * console.log(`Organization: ${authResult.organization.name}`)
 * console.log(`Role: ${authResult.userRole}`)
 * ```
 */
export async function validateUserSession(request: NextRequest): Promise<SessionValidationResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return { 
        error: 'Session error', 
        status: 401, 
        details: { sessionError: sessionError.message } 
      }
    }

    if (!session?.user) {
      return { error: 'Unauthorized', status: 401 }
    }

    // Validate session and user types
    if (!isValidSession(session)) {
      return { 
        error: 'Invalid session format', 
        status: 401, 
        details: { message: 'Session does not match expected structure' } 
      }
    }

    if (!isValidUser(session.user)) {
      return { 
        error: 'Invalid user format', 
        status: 401, 
        details: { message: 'User does not match expected structure' } 
      }
    }

    // Get user's organization membership with proper JOIN query
    const { data: orgMember, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        id,
        created_at,
        user_id,
        role,
        organization_id,
        invited_by,
        joined_at,
        organizations (
          id,
          created_at,
          updated_at,
          name,
          slug,
          description,
          user_id,
          settings,
          plan
        )
      `)
      .eq('user_id', session.user.id)
      .single()

    if (memberError) {
      return { 
        error: 'Organization membership error', 
        status: 403, 
        details: { memberError: memberError.message } 
      }
    }

    if (!orgMember) {
      return { error: 'No organization found', status: 403 }
    }

    // Validate membership query result
    const membershipValidation = validateMembershipQueryResult(orgMember)
    if (!membershipValidation.isValid) {
      return {
        error: 'Invalid membership data',
        status: 500,
        details: { 
          validationErrors: membershipValidation.errors,
          rawData: orgMember 
        }
      }
    }

    // Extract and validate organization data
    const organization = extractOrganizationFromMembership(membershipValidation.membership!)

    // Create properly typed auth context
    const authContext: AuthContext = {
      user: session.user as AuthUser,
      session: session as AuthSession,
      organizationId: membershipValidation.membership!.organization_id,
      userRole: membershipValidation.membership!.role,
      organization
    }

    return authContext
  } catch (error) {
    console.error('Session validation error:', error)
    return { 
      error: 'Internal server error', 
      status: 500,
      details: { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
  }
}

/**
 * Validates user has access to specific organization
 * 
 * This function:
 * - Verifies user membership in the specified organization
 * - Performs runtime type validation on organization data
 * - Returns typed organization data with user role
 * - Provides detailed error information for debugging
 * 
 * @param userId - The user ID to check access for
 * @param organizationId - The organization ID to validate access to
 * @returns Promise<OrganizationValidationResult> - Either organization data or error
 * 
 * @example
 * ```typescript
 * const orgResult = await validateOrganizationAccess(userId, orgId)
 * if ('error' in orgResult) {
 *   return NextResponse.json({ error: orgResult.error }, { status: orgResult.status })
 * }
 * 
 * // Type-safe access to organization data
 * console.log(`Organization: ${orgResult.organization.name}`)
 * console.log(`User role: ${orgResult.userRole}`)
 * ```
 */
export async function validateOrganizationAccess(
  userId: string, 
  organizationId: string
): Promise<OrganizationValidationResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify user has access to the organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        created_at,
        user_id,
        role,
        organization_id,
        invited_by,
        joined_at,
        organizations (
          id,
          created_at,
          updated_at,
          name,
          slug,
          description,
          user_id,
          settings,
          plan
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      return { 
        error: 'Organization access error', 
        status: 403, 
        details: { error: error.message } 
      }
    }

    if (!membership) {
      return { error: 'Organization access denied', status: 403 }
    }

    // Validate membership query result
    const membershipValidation = validateMembershipQueryResult(membership)
    if (!membershipValidation.isValid) {
      return {
        error: 'Invalid membership data',
        status: 500,
        details: { 
          validationErrors: membershipValidation.errors,
          rawData: membership 
        }
      }
    }

    // Extract and validate organization data
    const organization = extractOrganizationFromMembership(membershipValidation.membership!)

    return {
      organization,
      userRole: membershipValidation.membership!.role
    }
  } catch (error) {
    console.error('Organization validation error:', error)
    return { 
      error: 'Internal server error', 
      status: 500,
      details: { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
  }
}

/**
 * Higher-order function to protect API routes with authentication
 * Validates user session and passes auth context to the handler
 * @param handler - The API route handler function
 * @returns Protected API route handler
 * @example
 * ```typescript
 * export const POST = withAuth(async (request, context) => {
 *   // context.user, context.organizationId are now available
 *   return NextResponse.json({ message: 'Authenticated!' })
 * })
 * ```
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await validateUserSession(request)
    
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ 
          error: authResult.error,
          ...(authResult.details && { details: authResult.details })
        }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, authResult, ...args)
  }
}

/**
 * Higher-order function for API routes that need organization validation
 * Usage: export const POST = withOrgAuth(async (request, context, params) => { ... })
 */
export function withOrgAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
) {
  return withAuth(async (request: NextRequest, context: AuthContext, ...args: T) => {
    // Organization validation is already handled in validateUserSession
    // which ensures user has access to their organization
    return handler(request, context, ...args)
  })
}

/**
 * Check if user has specific role permissions
 * @deprecated Use hasPermission from @/lib/auth/permissions instead
 */
export function hasPermission(userRole: string, requiredRole: 'owner' | 'admin' | 'member'): boolean {
  const roleHierarchy = {
    owner: 3,
    admin: 2,
    member: 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Utility to extract organization ID from various sources
 */
export function getOrganizationId(request: NextRequest, context?: AuthContext): string | null {
  // Try from context first
  if (context?.organizationId) {
    return context.organizationId
  }
  
  // Try from headers
  const headerOrgId = request.headers.get('organization-id')
  if (headerOrgId) {
    return headerOrgId
  }
  
  // Try from URL params (for routes like /api/organizations/[id]/...)
  const pathname = request.nextUrl.pathname
  const orgMatch = pathname.match(/\/api\/organizations\/([^\/]+)/)
  if (orgMatch) {
    return orgMatch[1]
  }
  
  return null
}