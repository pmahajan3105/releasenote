/**
 * Centralized state management exports
 * Using Zustand for simple, efficient state management
 */

// Auth store
export * from './use-auth'

// Release notes store
export * from './use-release-notes'

// UI store
export * from './use-ui'

// Integrations store
export * from './use-integrations'

// Settings store
export * from './use-settings'

// Re-export commonly used hooks for convenience
export {
  useAuthStore,
  useAuthSelectors,
  useAuthActions
} from './use-auth'

export {
  useReleaseNotesStore,
  useReleaseNotesSelectors,
  useReleaseNotesActions
} from './use-release-notes'

export {
  useUIStore,
  useUISelectors,
  useUIActions,
  useNotifications,
  useModals
} from './use-ui'

export {
  useIntegrationsStore,
  useIntegrationsSelectors,
  useIntegrationsActions
} from './use-integrations'

export {
  useSettingsStore,
  useSettingsSelectors,
  useSettingsActions,
  useAISettings,
  useEmailSettings,
  useOrganizationSettings
} from './use-settings'