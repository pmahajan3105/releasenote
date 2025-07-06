# Migration Guide: React Context to Zustand

This guide documents the migration from React Context providers to Zustand stores for better performance and developer experience.

## Overview

We've migrated from React Context to Zustand for the following reasons:
- **Better Performance**: Zustand only re-renders components that subscribe to changed state slices
- **Simpler API**: No provider wrapping needed, cleaner code
- **Better TypeScript Support**: Full type safety with excellent IntelliSense
- **Persistence**: Built-in persistence middleware for offline functionality
- **DevTools**: Integrated with Redux DevTools for debugging

## Migration Changes

### 1. Auth State Management

**Before (React Context):**
```tsx
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

**After (Zustand):**
```tsx
import { useAuthStore, useAuthSelectors, useAuthActions } from '@/lib/store'

function Component() {
  const user = useAuthStore((state) => state.user)
  const { isLoading } = useAuthSelectors()
  const { signOut } = useAuthActions()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### 2. Release Notes State Management

**Before (React Context):**
```tsx
import { useReleaseNotes } from '@/contexts/ReleaseNotesContext'

function Component() {
  const { releaseNotes, loading, createReleaseNote } = useReleaseNotes()
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {releaseNotes.map(note => (
            <li key={note.id}>{note.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**After (Zustand):**
```tsx
import { useReleaseNotesStore, useReleaseNotesActions } from '@/lib/store'

function Component() {
  const releaseNotes = useReleaseNotesStore((state) => state.releaseNotes)
  const isLoading = useReleaseNotesStore((state) => state.isLoading)
  const { createReleaseNote } = useReleaseNotesActions()
  
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {releaseNotes.map(note => (
            <li key={note.id}>{note.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Available Stores

### 1. Auth Store (`useAuthStore`)
- **State**: `user`, `profile`, `organization`, `membership`, `isLoading`, `error`
- **Actions**: `signInWithMagicLink`, `signUp`, `signOut`, `fetchProfile`, `fetchOrganization`
- **Selectors**: `useAuthSelectors()` for computed values
- **Actions Hook**: `useAuthActions()` for all actions

### 2. Release Notes Store (`useReleaseNotesStore`)
- **State**: `releaseNotes`, `selectedNote`, `templates`, `isLoading`, `error`
- **Actions**: `fetchReleaseNotes`, `createReleaseNote`, `updateReleaseNote`, `deleteReleaseNote`
- **Selectors**: `useReleaseNotesSelectors()` for computed values
- **Actions Hook**: `useReleaseNotesActions()` for all actions

### 3. UI Store (`useUIStore`)
- **State**: `theme`, `sidebarOpen`, `modals`, `notifications`, `globalLoading`
- **Actions**: `setTheme`, `toggleSidebar`, `openModal`, `addNotification`
- **Convenience Hooks**: `useNotifications()`, `useModals()`

### 4. Integrations Store (`useIntegrationsStore`)
- **State**: Integration connections, repositories, projects, teams
- **Actions**: Connect/disconnect integrations, fetch data from external APIs

### 5. Settings Store (`useSettingsStore`)
- **State**: AI settings, email settings, organization settings
- **Actions**: Update settings, manage custom domains, handle CSS customization

## Key Benefits

### Performance Improvements
- **Selective Subscriptions**: Components only re-render when their specific state slices change
- **Computed Values**: Selectors provide computed values without unnecessary recalculations
- **Optimized Updates**: Zustand's shallow comparison prevents unnecessary re-renders

### Developer Experience
- **No Provider Wrapping**: Components can access state directly without provider hierarchy
- **Better TypeScript**: Full type safety with excellent autocomplete
- **DevTools Integration**: Debug state changes with Redux DevTools
- **Persistence**: Automatic state persistence with configurable options

### Code Organization
- **Separation of Concerns**: Clear separation between state, actions, and selectors
- **Modular Design**: Each store handles a specific domain
- **Reusable Hooks**: Custom hooks for common patterns

## Migration Patterns

### 1. Direct State Access
```tsx
// Use direct selectors for simple state access
const user = useAuthStore((state) => state.user)
const isLoading = useReleaseNotesStore((state) => state.isLoading)
```

### 2. Computed Values
```tsx
// Use selector hooks for computed values
const { isAuthenticated, canEditReleaseNotes } = useAuthSelectors()
const { hasReleaseNotes, totalItems } = useReleaseNotesSelectors()
```

### 3. Actions
```tsx
// Use action hooks for all mutations
const { signOut, fetchProfile } = useAuthActions()
const { createReleaseNote, deleteReleaseNote } = useReleaseNotesActions()
```

### 4. Conditional Data Fetching
```tsx
// Fetch data conditionally based on state
useEffect(() => {
  if (user && organization) {
    fetchReleaseNotes(organization.id)
  }
}, [user, organization, fetchReleaseNotes])
```

## Best Practices

### 1. Use Appropriate Hooks
- Use direct selectors for simple state access
- Use selector hooks for computed values
- Use action hooks for mutations

### 2. Optimize Subscriptions
```tsx
// Good: Only subscribe to what you need
const title = useReleaseNotesStore((state) => state.selectedNote?.title)

// Avoid: Subscribing to entire objects when you only need specific fields
const selectedNote = useReleaseNotesStore((state) => state.selectedNote)
```

### 3. Handle Loading States
```tsx
// Use specific loading states for better UX
const isCreating = useReleaseNotesStore((state) => state.isCreating)
const isUpdating = useReleaseNotesStore((state) => state.isUpdating)
```

### 4. Error Handling
```tsx
// Access error state and provide clear error handling
const error = useReleaseNotesStore((state) => state.error)
const { clearError } = useReleaseNotesActions()

if (error) {
  return <ErrorMessage error={error} onDismiss={clearError} />
}
```

## Common Patterns

### 1. Optimistic Updates
```tsx
const { addReleaseNote, updateReleaseNote } = useReleaseNotesActions()

// Optimistically update UI, then sync with server
const handleCreate = async (data) => {
  const tempNote = { ...data, id: 'temp-' + Date.now() }
  addReleaseNote(tempNote) // Immediate UI update
  
  try {
    const realNote = await createReleaseNote(data)
    updateReleaseNote(tempNote.id, realNote) // Replace with real data
  } catch (error) {
    removeReleaseNote(tempNote.id) // Rollback on error
  }
}
```

### 2. Conditional Rendering
```tsx
const { isAuthenticated } = useAuthSelectors()
const { hasReleaseNotes } = useReleaseNotesSelectors()

if (!isAuthenticated) return <LoginPage />
if (!hasReleaseNotes) return <EmptyState />
```

### 3. Form Integration
```tsx
const { createReleaseNote } = useReleaseNotesActions()
const isCreating = useReleaseNotesStore((state) => state.isCreating)

const handleSubmit = async (formData) => {
  await createReleaseNote(formData)
  router.push('/releases')
}

return (
  <form onSubmit={handleSubmit}>
    <Button type="submit" disabled={isCreating}>
      {isCreating ? 'Creating...' : 'Create Release Note'}
    </Button>
  </form>
)
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure you're importing the correct types and using proper type annotations
2. **Stale Closures**: Use the callback form of setState when updating based on previous state
3. **Infinite Loops**: Be careful with dependencies in useEffect hooks
4. **Performance**: Use shallow selectors and avoid subscribing to large objects

### Debug Tips

1. **Use Redux DevTools**: Enable devtools to inspect state changes
2. **Console Logging**: Add logging to actions to trace state updates
3. **Component Re-renders**: Use React DevTools Profiler to identify unnecessary re-renders

## Conclusion

The migration to Zustand provides significant benefits in terms of performance, developer experience, and code maintainability. The new architecture is more scalable and easier to reason about, with clear separation of concerns and excellent TypeScript support. 