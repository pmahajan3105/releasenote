'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createClientComponentClient } from '@/lib/supabase/ssr'

interface AISettings {
  defaultModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku'
  temperature: number
  maxTokens: number
  enableBrandVoice: boolean
  enableCustomPrompts: boolean
}

interface EmailSettings {
  enableNotifications: boolean
  notifyOnPublish: boolean
  notifyOnComment: boolean
  notifyOnMention: boolean
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
}

interface OrganizationSettings {
  name: string
  slug: string
  description?: string
  logo?: string
  customDomain?: string
  customCSS?: string
  publicReleaseNotes: boolean
  requireApproval: boolean
  allowComments: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

interface SettingsState {
  // Settings data
  aiSettings: AISettings
  emailSettings: EmailSettings
  organizationSettings: OrganizationSettings
  
  // UI state
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Actions - AI Settings
  updateAISettings: (settings: Partial<AISettings>) => void
  resetAISettings: () => void
  
  // Actions - Email Settings
  updateEmailSettings: (settings: Partial<EmailSettings>) => void
  resetEmailSettings: () => void
  
  // Actions - Organization Settings
  updateOrganizationSettings: (settings: Partial<OrganizationSettings>) => void
  resetOrganizationSettings: () => void
  
  // Actions - API Operations
  fetchSettings: (organizationId: string) => Promise<void>
  saveSettings: (organizationId: string) => Promise<void>
  
  // Actions - Domain & SSL
  updateCustomDomain: (organizationId: string, domain: string) => Promise<void>
  verifyCustomDomain: (organizationId: string, domain: string) => Promise<boolean>
  updateCustomCSS: (organizationId: string, css: string) => Promise<void>
  
  // UI Actions
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  
  // Utility Actions
  clearError: () => void
  reset: () => void
}

const defaultAISettings: AISettings = {
  defaultModel: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  enableBrandVoice: true,
  enableCustomPrompts: true
}

const defaultEmailSettings: EmailSettings = {
  enableNotifications: true,
  notifyOnPublish: true,
  notifyOnComment: true,
  notifyOnMention: true,
  digestFrequency: 'weekly'
}

const defaultOrganizationSettings: OrganizationSettings = {
  name: '',
  slug: '',
  publicReleaseNotes: true,
  requireApproval: false,
  allowComments: true
}

const initialState = {
  aiSettings: defaultAISettings,
  emailSettings: defaultEmailSettings,
  organizationSettings: defaultOrganizationSettings,
  isLoading: false,
  isSaving: false,
  error: null
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // AI Settings actions
        updateAISettings: (settings) => 
          set((state) => ({
            aiSettings: { ...state.aiSettings, ...settings }
          }), false, 'updateAISettings'),
        
        resetAISettings: () => 
          set({ aiSettings: defaultAISettings }, false, 'resetAISettings'),
        
        // Email Settings actions
        updateEmailSettings: (settings) => 
          set((state) => ({
            emailSettings: { ...state.emailSettings, ...settings }
          }), false, 'updateEmailSettings'),
        
        resetEmailSettings: () => 
          set({ emailSettings: defaultEmailSettings }, false, 'resetEmailSettings'),
        
        // Organization Settings actions
        updateOrganizationSettings: (settings) => 
          set((state) => ({
            organizationSettings: { ...state.organizationSettings, ...settings }
          }), false, 'updateOrganizationSettings'),
        
        resetOrganizationSettings: () => 
          set({ organizationSettings: defaultOrganizationSettings }, false, 'resetOrganizationSettings'),
        
        // API Operations
        fetchSettings: async (organizationId: string) => {
          try {
            set({ isLoading: true, error: null }, false, 'fetchSettingsStart')
            const supabase = createClientComponentClient()
            
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', organizationId)
              .single()
            
            if (orgError) throw orgError
            
            if (orgData) {
              const settings = orgData.settings || {}
              
              set({
                aiSettings: { ...defaultAISettings, ...settings.ai },
                emailSettings: { ...defaultEmailSettings, ...settings.email },
                organizationSettings: {
                  ...defaultOrganizationSettings,
                  name: orgData.name,
                  slug: orgData.slug || '',
                  description: orgData.description,
                  ...settings.organization
                }
              }, false, 'fetchSettingsSuccess')
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings'
            set({ error: errorMessage }, false, 'fetchSettingsError')
          } finally {
            set({ isLoading: false }, false, 'fetchSettingsComplete')
          }
        },
        
        saveSettings: async (organizationId: string) => {
          try {
            set({ isSaving: true, error: null }, false, 'saveSettingsStart')
            const supabase = createClientComponentClient()
            const state = get()
            
            const settings = {
              ai: state.aiSettings,
              email: state.emailSettings,
              organization: state.organizationSettings
            }
            
            const { error } = await supabase
              .from('organizations')
              .update({
                name: state.organizationSettings.name,
                slug: state.organizationSettings.slug,
                description: state.organizationSettings.description,
                settings
              })
              .eq('id', organizationId)
            
            if (error) throw error
            
            set({ isSaving: false }, false, 'saveSettingsSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
            set({ error: errorMessage, isSaving: false }, false, 'saveSettingsError')
          }
        },
        
        // Domain & SSL operations
        updateCustomDomain: async (organizationId: string, domain: string) => {
          try {
            set({ isSaving: true, error: null }, false, 'updateCustomDomainStart')
            const response = await fetch(`/api/organizations/${organizationId}/domain`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain })
            })
            
            if (!response.ok) throw new Error('Failed to update custom domain')
            
            get().updateOrganizationSettings({ customDomain: domain })
            set({ isSaving: false }, false, 'updateCustomDomainSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update custom domain'
            set({ error: errorMessage, isSaving: false }, false, 'updateCustomDomainError')
          }
        },
        
        verifyCustomDomain: async (organizationId: string, domain: string) => {
          try {
            set({ isLoading: true, error: null }, false, 'verifyCustomDomainStart')
            const response = await fetch(`/api/organizations/${organizationId}/domain/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain })
            })
            
            const result = await response.json()
            
            if (!response.ok) {
              set({ error: result.error || 'Failed to verify domain' }, false, 'verifyCustomDomainError')
              return false
            }
            
            set({ isLoading: false }, false, 'verifyCustomDomainSuccess')
            return result.verified
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to verify domain'
            set({ error: errorMessage, isLoading: false }, false, 'verifyCustomDomainError')
            return false
          }
        },
        
        updateCustomCSS: async (organizationId: string, css: string) => {
          try {
            set({ isSaving: true, error: null }, false, 'updateCustomCSSStart')
            const response = await fetch(`/api/organizations/${organizationId}/custom-css`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ css })
            })
            
            if (!response.ok) throw new Error('Failed to update custom CSS')
            
            get().updateOrganizationSettings({ customCSS: css })
            set({ isSaving: false }, false, 'updateCustomCSSSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update custom CSS'
            set({ error: errorMessage, isSaving: false }, false, 'updateCustomCSSError')
          }
        },
        
        // UI actions
        setLoading: (loading) => 
          set({ isLoading: loading }, false, 'setLoading'),
        
        setSaving: (saving) => 
          set({ isSaving: saving }, false, 'setSaving'),
        
        setError: (error) => 
          set({ error }, false, 'setError'),
        
        // Utility actions
        clearError: () => set({ error: null }, false, 'clearError'),
        
        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'settings-store',
        // Persist all settings for offline access
        partialize: (state) => ({
          aiSettings: state.aiSettings,
          emailSettings: state.emailSettings,
          organizationSettings: state.organizationSettings
        })
      }
    ),
    {
      name: 'settings-store'
    }
  )
)

// Selectors for computed values
export const useSettingsSelectors = () => {
  const store = useSettingsStore()
  
  return {
    // Computed values
    hasCustomDomain: !!store.organizationSettings.customDomain,
    hasCustomCSS: !!store.organizationSettings.customCSS,
    isPublicReleaseNotes: store.organizationSettings.publicReleaseNotes,
    requiresApproval: store.organizationSettings.requireApproval,
    allowsComments: store.organizationSettings.allowComments,
    
    // AI settings helpers
    isAIEnabled: store.aiSettings.enableBrandVoice || store.aiSettings.enableCustomPrompts,
    currentAIModel: store.aiSettings.defaultModel,
    
    // Email settings helpers
    hasEmailNotifications: store.emailSettings.enableNotifications,
    emailDigestEnabled: store.emailSettings.digestFrequency !== 'never',
    
    // Loading states
    isAnyLoading: store.isLoading || store.isSaving,
    
    // Organization info
    organizationName: store.organizationSettings.name,
    organizationSlug: store.organizationSettings.slug,
    organizationDescription: store.organizationSettings.description
  }
}

// Actions hook for easier access
export const useSettingsActions = () => {
  const store = useSettingsStore()
  
  return {
    // AI settings
    updateAISettings: store.updateAISettings,
    resetAISettings: store.resetAISettings,
    
    // Email settings
    updateEmailSettings: store.updateEmailSettings,
    resetEmailSettings: store.resetEmailSettings,
    
    // Organization settings
    updateOrganizationSettings: store.updateOrganizationSettings,
    resetOrganizationSettings: store.resetOrganizationSettings,
    
    // API operations
    fetchSettings: store.fetchSettings,
    saveSettings: store.saveSettings,
    
    // Domain & CSS
    updateCustomDomain: store.updateCustomDomain,
    verifyCustomDomain: store.verifyCustomDomain,
    updateCustomCSS: store.updateCustomCSS,
    
    // Utility
    clearError: store.clearError,
    reset: store.reset
  }
}

// Convenience hooks for specific settings
export const useAISettings = () => {
  const aiSettings = useSettingsStore((state) => state.aiSettings)
  const { updateAISettings, resetAISettings } = useSettingsActions()
  
  return {
    aiSettings,
    updateAISettings,
    resetAISettings,
    
    // Convenience methods
    setModel: (model: AISettings['defaultModel']) => updateAISettings({ defaultModel: model }),
    setTemperature: (temperature: number) => updateAISettings({ temperature }),
    setMaxTokens: (maxTokens: number) => updateAISettings({ maxTokens }),
    toggleBrandVoice: () => updateAISettings({ enableBrandVoice: !aiSettings.enableBrandVoice }),
    toggleCustomPrompts: () => updateAISettings({ enableCustomPrompts: !aiSettings.enableCustomPrompts })
  }
}

export const useEmailSettings = () => {
  const emailSettings = useSettingsStore((state) => state.emailSettings)
  const { updateEmailSettings, resetEmailSettings } = useSettingsActions()
  
  return {
    emailSettings,
    updateEmailSettings,
    resetEmailSettings,
    
    // Convenience methods
    toggleNotifications: () => updateEmailSettings({ enableNotifications: !emailSettings.enableNotifications }),
    togglePublishNotifications: () => updateEmailSettings({ notifyOnPublish: !emailSettings.notifyOnPublish }),
    toggleCommentNotifications: () => updateEmailSettings({ notifyOnComment: !emailSettings.notifyOnComment }),
    toggleMentionNotifications: () => updateEmailSettings({ notifyOnMention: !emailSettings.notifyOnMention }),
    setDigestFrequency: (frequency: EmailSettings['digestFrequency']) => updateEmailSettings({ digestFrequency: frequency })
  }
}

export const useOrganizationSettings = () => {
  const organizationSettings = useSettingsStore((state) => state.organizationSettings)
  const { updateOrganizationSettings, resetOrganizationSettings } = useSettingsActions()
  
  return {
    organizationSettings,
    updateOrganizationSettings,
    resetOrganizationSettings,
    
    // Convenience methods
    setName: (name: string) => updateOrganizationSettings({ name }),
    setSlug: (slug: string) => updateOrganizationSettings({ slug }),
    setDescription: (description: string) => updateOrganizationSettings({ description }),
    togglePublicReleaseNotes: () => updateOrganizationSettings({ publicReleaseNotes: !organizationSettings.publicReleaseNotes }),
    toggleRequireApproval: () => updateOrganizationSettings({ requireApproval: !organizationSettings.requireApproval }),
    toggleAllowComments: () => updateOrganizationSettings({ allowComments: !organizationSettings.allowComments })
  }
} 