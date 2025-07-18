'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setInitialized } = useAuthStore()
  
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
        } else if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
        setInitialized(true)
      }
    )
    
    // Initialize on mount
    initializeAuth()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading, setInitialized])
  
  return <>{children}</>
}
