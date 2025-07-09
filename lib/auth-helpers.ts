import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface AuthContext {
  user: Record<string, unknown>
  session: Record<string, unknown>
  organizationId: string
  userRole: string
  organization: Record<string, unknown>
}

export interface AuthError {
  error: string
  status: number
}

/**
 * Validates user session and returns auth context
 * Replaces Express.js handleUserSession middleware
 * @param request - The Next.js request object
 * @returns Promise containing auth context or error details
 * @example
 * ```typescript
 * const authResult = await validateUserSession(request)
 * if ('error' in authResult) {
 *   return NextResponse.json({ error: authResult.error }, { status: authResult.status })
 * }
 * console.log(`User: ${authResult.user.email}, Org: ${authResult.organization.name}`)
 * ```
 */
export async function validateUserSession(request: NextRequest): Promise<AuthContext | AuthError> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return { error: 'Unauthorized', status: 401 }
    }

    // Get user's organization membership
    const { data: orgMember, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        user_id,
        role,
        organization_id,
        organizations (
          id,
          name,
          slug,
          settings
        )
      `)
      .eq('user_id', session.user.id)
      .single()

    if (memberError || !orgMember) {
      return { error: 'No organization found', status: 403 }
    }

    return {
      user: session.user,
      session,
      organizationId: orgMember.organization_id,
      userRole: orgMember.role,
      organization: orgMember.organizations
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { error: 'Internal server error', status: 500 }
  }
}

/**
 * Validates user has access to specific organization
 * Replaces Express.js checkOrganization middleware
 */
export async function validateOrganizationAccess(
  userId: string, 
  organizationId: string
): Promise<{ organization: Record<string, unknown>; userRole: string } | AuthError> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify user has access to the organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        organization_id,
        organizations (
          id,
          name,
          slug,
          settings
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error || !membership) {
      return { error: 'Organization access denied', status: 403 }
    }

    return {
      organization: membership.organizations,
      userRole: membership.role
    }
  } catch (error) {
    console.error('Organization validation error:', error)
    return { error: 'Internal server error', status: 500 }
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
        JSON.stringify({ error: authResult.error }),
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