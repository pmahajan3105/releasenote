/**
 * Permission system for role-based access control
 * Provides type-safe role checking and permission validation
 */

import type { UserRole, PermissionLevel } from '@/types/auth'

// Role hierarchy levels
const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1
}

/**
 * Check if user has specific role permissions
 */
export function hasPermission(userRole: string, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Check if user has minimum required role
 */
export function hasMinimumRole(userRole: string, minimumRole: UserRole): boolean {
  return hasPermission(userRole, minimumRole)
}

/**
 * Get permission level for a user role
 */
export function getPermissionLevel(userRole: string): PermissionLevel {
  const role = userRole as UserRole
  
  return {
    canManageOrganization: hasPermission(role, 'admin'),
    canEditReleaseNotes: hasPermission(role, 'editor'),
    canViewReleaseNotes: hasPermission(role, 'viewer'),
    canManageIntegrations: hasPermission(role, 'admin'),
    canManageMembers: hasPermission(role, 'admin'),
    canViewAnalytics: hasPermission(role, 'editor')
  }
}

/**
 * Check if user can perform a specific action
 */
export function canPerformAction(userRole: string, action: keyof PermissionLevel): boolean {
  const permissions = getPermissionLevel(userRole)
  return permissions[action]
}

/**
 * Get all roles that have a specific permission
 */
export function getRolesWithPermission(permission: keyof PermissionLevel): UserRole[] {
  const roles: UserRole[] = []
  
  for (const role of Object.keys(ROLE_HIERARCHY) as UserRole[]) {
    if (canPerformAction(role, permission)) {
      roles.push(role)
    }
  }
  
  return roles
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return role in ROLE_HIERARCHY
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  
  return displayNames[role] || role
}

/**
 * Get all available roles in hierarchy order
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_HIERARCHY) as UserRole[]
}

/**
 * Get roles that are lower than the specified role
 */
export function getLowerRoles(role: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[role]
  return getAllRoles().filter(r => ROLE_HIERARCHY[r] < userLevel)
}

/**
 * Get roles that are higher than the specified role
 */
export function getHigherRoles(role: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[role]
  return getAllRoles().filter(r => ROLE_HIERARCHY[r] > userLevel)
}

/**
 * Check if user can assign a specific role
 * Generally, users can only assign roles lower than their own
 */
export function canAssignRole(userRole: string, targetRole: UserRole): boolean {
  // Owner can assign any role
  if (userRole === 'owner') return true
  
  // Admin can assign editor and viewer roles
  if (userRole === 'admin') {
    return targetRole === 'editor' || targetRole === 'viewer'
  }
  
  // Editor and viewer cannot assign roles
  return false
}

/**
 * Get the highest role a user can assign
 */
export function getHighestAssignableRole(userRole: string): UserRole | null {
  if (userRole === 'owner') return 'admin'
  if (userRole === 'admin') return 'editor'
  return null
}

/**
 * Permission validation middleware helper
 */
export function requirePermission(permission: keyof PermissionLevel) {
  return (userRole: string): boolean => {
    return canPerformAction(userRole, permission)
  }
}

/**
 * Permission validation middleware helper for minimum role
 */
export function requireMinimumRole(minimumRole: UserRole) {
  return (userRole: string): boolean => {
    return hasMinimumRole(userRole, minimumRole)
  }
}

/**
 * Create permission checker for specific organization context
 */
export function createPermissionChecker(userRole: string) {
  return {
    canManageOrganization: () => canPerformAction(userRole, 'canManageOrganization'),
    canEditReleaseNotes: () => canPerformAction(userRole, 'canEditReleaseNotes'),
    canViewReleaseNotes: () => canPerformAction(userRole, 'canViewReleaseNotes'),
    canManageIntegrations: () => canPerformAction(userRole, 'canManageIntegrations'),
    canManageMembers: () => canPerformAction(userRole, 'canManageMembers'),
    canViewAnalytics: () => canPerformAction(userRole, 'canViewAnalytics'),
    hasMinimumRole: (role: UserRole) => hasMinimumRole(userRole, role),
    canAssignRole: (role: UserRole) => canAssignRole(userRole, role),
    getPermissionLevel: () => getPermissionLevel(userRole)
  }
}

/**
 * Permission constants for common use cases
 */
export const PERMISSIONS = {
  // Organization management
  MANAGE_ORGANIZATION: 'canManageOrganization' as const,
  MANAGE_MEMBERS: 'canManageMembers' as const,
  MANAGE_INTEGRATIONS: 'canManageIntegrations' as const,
  
  // Release notes
  EDIT_RELEASE_NOTES: 'canEditReleaseNotes' as const,
  VIEW_RELEASE_NOTES: 'canViewReleaseNotes' as const,
  
  // Analytics
  VIEW_ANALYTICS: 'canViewAnalytics' as const,
} as const

/**
 * Role constants for common use cases
 */
export const ROLES = {
  OWNER: 'owner' as const,
  ADMIN: 'admin' as const,
  EDITOR: 'editor' as const,
  VIEWER: 'viewer' as const,
} as const
