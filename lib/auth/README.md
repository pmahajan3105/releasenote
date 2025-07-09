# Authentication System

This directory contains the type-safe authentication and authorization system for the Release Notes application.

## Overview

The auth system provides:
- **Type-safe authentication** with proper TypeScript types
- **Runtime validation** to prevent type-related errors
- **Role-based access control** with hierarchical permissions
- **Supabase integration** with proper JOIN query handling
- **Developer-friendly APIs** with comprehensive error handling

## Architecture

```
lib/auth/
├── README.md           # This file
├── type-guards.ts      # Runtime type validation
└── permissions.ts      # Role-based access control

lib/auth-helpers.ts     # Main auth functions
types/auth.ts          # TypeScript type definitions
```

## Quick Start

### Basic Authentication

```typescript
import { validateUserSession } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const authResult = await validateUserSession(request)
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  
  // Full type safety - authResult is AuthContext
  const { user, organization, userRole } = authResult
  
  return NextResponse.json({
    message: `Hello ${user.email} from ${organization.name}!`,
    role: userRole
  })
}
```

### Using Higher-Order Functions

```typescript
import { withAuth } from '@/lib/auth-helpers'

export const GET = withAuth(async (request, context) => {
  // context is fully typed as AuthContext
  const { user, organization, userRole } = context
  
  return NextResponse.json({
    user: user.email,
    org: organization.name,
    role: userRole
  })
})
```

### Permission Checking

```typescript
import { hasPermission, canPerformAction } from '@/lib/auth/permissions'

export const POST = withAuth(async (request, context) => {
  // Check specific permission
  if (!canPerformAction(context.userRole, 'canEditReleaseNotes')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  
  // Check minimum role
  if (!hasPermission(context.userRole, 'editor')) {
    return NextResponse.json({ error: 'Editor role required' }, { status: 403 })
  }
  
  // Proceed with action
  return NextResponse.json({ message: 'Success' })
})
```

## Type System

### Core Types

```typescript
// User type (extends Supabase User)
interface AuthUser extends User {
  // Includes id, email, created_at, etc.
}

// Session type (extends Supabase Session)
interface AuthSession extends Session {
  // Includes access_token, refresh_token, user, etc.
}

// Organization with membership context
interface AuthOrganization extends Organization {
  membership?: OrganizationMember
  userRole?: string
}

// Complete auth context
interface AuthContext {
  user: AuthUser
  session: AuthSession
  organizationId: string
  userRole: string
  organization: AuthOrganization
}
```

### Type Guards

Runtime validation functions ensure type safety:

```typescript
import { isValidUser, isValidSession, isValidOrganization } from '@/lib/auth/type-guards'

// Validate user object
if (isValidUser(userData)) {
  // userData is now typed as AuthUser
  console.log(userData.email)
}

// Validate session object
if (isValidSession(sessionData)) {
  // sessionData is now typed as AuthSession
  console.log(sessionData.access_token)
}
```

## Permission System

### Role Hierarchy

```
Owner (4)    - Full access, can manage admins
  ↓
Admin (3)    - Can manage organization, members, integrations
  ↓
Editor (2)   - Can edit release notes, view analytics
  ↓
Viewer (1)   - Can view release notes only
```

### Permission Levels

```typescript
interface PermissionLevel {
  canManageOrganization: boolean
  canEditReleaseNotes: boolean
  canViewReleaseNotes: boolean
  canManageIntegrations: boolean
  canManageMembers: boolean
  canViewAnalytics: boolean
}
```

### Usage Examples

```typescript
import { 
  hasPermission, 
  canPerformAction, 
  createPermissionChecker,
  PERMISSIONS,
  ROLES
} from '@/lib/auth/permissions'

// Check minimum role
if (hasPermission(userRole, ROLES.EDITOR)) {
  // User is editor or higher
}

// Check specific permission
if (canPerformAction(userRole, PERMISSIONS.MANAGE_ORGANIZATION)) {
  // User can manage organization
}

// Create permission checker for context
const permissions = createPermissionChecker(userRole)
if (permissions.canEditReleaseNotes()) {
  // User can edit release notes
}
```

## Error Handling

All auth functions return detailed error information:

```typescript
interface AuthError {
  error: string
  status: number
  details?: Record<string, unknown>
}

// Example error response
{
  error: 'Invalid membership data',
  status: 500,
  details: {
    validationErrors: ['Organization name is required'],
    rawData: { /* original data */ }
  }
}
```

## Database Integration

### JOIN Query Handling

The system properly handles Supabase JOIN queries:

```sql
-- This query structure is properly typed
SELECT 
  organization_members.*,
  organizations (
    id,
    name,
    slug,
    settings,
    plan
  )
FROM organization_members
JOIN organizations ON organizations.id = organization_members.organization_id
```

### Type-Safe Database Operations

```typescript
// Validates and normalizes database results
const membershipValidation = validateMembershipQueryResult(dbResult)
if (membershipValidation.isValid) {
  const organization = extractOrganizationFromMembership(membershipValidation.membership!)
  // organization is now properly typed
}
```

## Migration Guide

### From Generic Types

**Before:**
```typescript
interface AuthContext {
  user: Record<string, unknown>
  organization: Record<string, unknown>
}
```

**After:**
```typescript
interface AuthContext {
  user: AuthUser
  organization: AuthOrganization
}
```

### Error Handling Improvements

**Before:**
```typescript
if ('error' in authResult) {
  return NextResponse.json({ error: authResult.error }, { status: authResult.status })
}
```

**After:**
```typescript
if ('error' in authResult) {
  return NextResponse.json({ 
    error: authResult.error,
    details: authResult.details 
  }, { status: authResult.status })
}
```

## Best Practices

1. **Always use type guards** for runtime validation
2. **Handle errors gracefully** with detailed error information
3. **Use permission system** instead of direct role checking
4. **Validate all database queries** before using results
5. **Use higher-order functions** for consistent auth handling

## Testing

```typescript
import { validateUserSession } from '@/lib/auth-helpers'
import { hasPermission } from '@/lib/auth/permissions'

// Test auth validation
const mockRequest = new NextRequest('http://localhost/api/test')
const authResult = await validateUserSession(mockRequest)

// Test permissions
expect(hasPermission('admin', 'editor')).toBe(true)
expect(hasPermission('viewer', 'admin')).toBe(false)
```

## Common Issues

### Type Assertion Errors

**Problem:** `Property 'email' does not exist on type 'Record<string, unknown>'`

**Solution:** Use proper types and type guards:
```typescript
// Before
const user = authResult.user as any
console.log(user.email)

// After
if (isValidUser(authResult.user)) {
  console.log(authResult.user.email) // Type-safe
}
```

### JOIN Query Type Mismatches

**Problem:** Organization data not properly typed from JOIN queries

**Solution:** Use validation functions:
```typescript
const membershipValidation = validateMembershipQueryResult(dbResult)
if (membershipValidation.isValid) {
  const organization = extractOrganizationFromMembership(membershipValidation.membership!)
}
```

## API Reference

See the individual files for detailed API documentation:
- `type-guards.ts` - Runtime validation functions
- `permissions.ts` - Role-based access control
- `auth-helpers.ts` - Main authentication functions
- `../types/auth.ts` - TypeScript type definitions