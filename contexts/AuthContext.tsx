'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// Define a type for the user profile
type UserProfile = {
  id: string
  plan: 'free' | 'paid' // Assuming these are the plan types
  // Add other profile fields if needed
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null // Add profile state
  plan: 'free' | 'paid' | null // Add plan state for easier access
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null) // State for profile
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Function to fetch profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, plan') // Select needed profile fields
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116: row not found
        throw error
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    const getUserAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id) // Fetch profile if user exists
        }
      } catch (error) {
        console.error('Error fetching user session:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          setLoading(true)
          await fetchProfile(currentUser.id) // Re-fetch profile on auth change
          setLoading(false)
        }
        router.refresh() // Keep this to update UI sensitive to auth state
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]) // Dependencies remain the same

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      // Profile will be fetched by onAuthStateChange
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      // Profile will be fetched by onAuthStateChange
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      // Profile should be created by trigger, fetched by onAuthStateChange
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null) // Clear profile on sign out
    router.push('/login')
  }

  const value = {
    user,
    profile,
    plan: profile?.plan ?? null, // Derive plan from profile
    loading,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 