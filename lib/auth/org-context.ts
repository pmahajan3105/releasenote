import type { NextRequest } from 'next/server'
import type { AuthContext, AuthError } from '@/types/auth'
import { validateUserSession } from '@/lib/auth-helpers'

export type AuthedOrgContext =
  | {
      userId: string
      organizationId: string
      userRole: string
      organization: AuthContext['organization']
    }
  | AuthError

/**
 * Canonical auth/org context loader for API routes.
 *
 * MVP assumption: single-org-per-user, but we still validate membership so RLS
 * policies based on `organization_members` remain correct.
 */
export async function getAuthedOrgContext(request: NextRequest): Promise<AuthedOrgContext> {
  const result = await validateUserSession(request)
  if ('error' in result) {
    return result
  }

  return {
    userId: result.user.id,
    organizationId: result.organizationId,
    userRole: result.userRole,
    organization: result.organization,
  }
}

