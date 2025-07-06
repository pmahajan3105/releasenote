'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

interface Modal {
  id: string
  type: string
  data?: any
  isOpen: boolean
}

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Layout
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modals
  modals: Modal[]
  
  // Notifications
  notifications: Notification[]
  
  // Loading states
  globalLoading: boolean
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Actions - Layout
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  toggleSidebarCollapsed: () => void
  
  // Actions - Modals
  openModal: (type: string, data?: any) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void
  
  // Utility
  reset: () => void
}

const initialState = {
  theme: 'system' as const,
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: [],
  notifications: [],
  globalLoading: false
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Theme actions
        setTheme: (theme) => 
          set({ theme }, false, 'setTheme'),
        
        // Layout actions
        setSidebarOpen: (open) => 
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
        setSidebarCollapsed: (collapsed) => 
          set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
        
        toggleSidebar: () => 
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        
        toggleSidebarCollapsed: () => 
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebarCollapsed'),
        
        // Modal actions
        openModal: (type: string, data?: any) => {
          const id = Math.random().toString(36).substr(2, 9)
          const modal: Modal = { id, type, data, isOpen: true }
          
          set((state) => ({
            modals: [...state.modals, modal]
          }), false, 'openModal')
          
          return id
        },
        
        closeModal: (id: string) => 
          set((state) => ({
            modals: state.modals.filter((modal) => modal.id !== id)
          }), false, 'closeModal'),
        
        closeAllModals: () => 
          set({ modals: [] }, false, 'closeAllModals'),
        
        // Notification actions
        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9)
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now()
          }
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications]
          }), false, 'addNotification')
          
          // Auto-remove notification after duration
          if (notification.duration !== 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, notification.duration || 5000)
          }
          
          return id
        },
        
        removeNotification: (id: string) => 
          set((state) => ({
            notifications: state.notifications.filter((notification) => notification.id !== id)
          }), false, 'removeNotification'),
        
        clearNotifications: () => 
          set({ notifications: [] }, false, 'clearNotifications'),
        
        // Loading actions
        setGlobalLoading: (loading) => 
          set({ globalLoading: loading }, false, 'setGlobalLoading'),
        
        // Utility
        reset: () => 
          set(initialState, false, 'reset')
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed
        })
      }
    ),
    {
      name: 'ui-store'
    }
  )
)

// Selectors for computed values
export const useUISelectors = () => {
  const store = useUIStore()
  
  return {
    // Computed values
    hasNotifications: store.notifications.length > 0,
    hasModals: store.modals.length > 0,
    latestNotification: store.notifications[0] || null,
    
    // Modal helpers
    getModal: (type: string) => store.modals.find(modal => modal.type === type),
    isModalOpen: (type: string) => store.modals.some(modal => modal.type === type),
    
    // Theme helpers
    isDarkMode: store.theme === 'dark' || 
      (store.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    
    // Layout helpers
    isSidebarVisible: store.sidebarOpen && !store.sidebarCollapsed
  }
}

// Actions hook for easier access
export const useUIActions = () => {
  const store = useUIStore()
  
  return {
    // Theme
    setTheme: store.setTheme,
    
    // Layout
    setSidebarOpen: store.setSidebarOpen,
    setSidebarCollapsed: store.setSidebarCollapsed,
    toggleSidebar: store.toggleSidebar,
    toggleSidebarCollapsed: store.toggleSidebarCollapsed,
    
    // Modals
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    
    // Notifications
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    
    // Loading
    setGlobalLoading: store.setGlobalLoading,
    
    // Utility
    reset: store.reset
  }
}

// Convenience hooks for specific UI elements
export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications)
  const { addNotification, removeNotification, clearNotifications } = useUIActions()
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Convenience methods
    showSuccess: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message }),
    
    showError: (title: string, message?: string) => 
      addNotification({ type: 'error', title, message }),
    
    showWarning: (title: string, message?: string) => 
      addNotification({ type: 'warning', title, message }),
    
    showInfo: (title: string, message?: string) => 
      addNotification({ type: 'info', title, message })
  }
}

export const useModals = () => {
  const modals = useUIStore((state) => state.modals)
  const { openModal, closeModal, closeAllModals } = useUIActions()
  const { getModal, isModalOpen } = useUISelectors()
  
  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    getModal,
    isModalOpen
  }
} 