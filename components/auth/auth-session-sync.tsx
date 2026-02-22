'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { useAuthStore } from '@/lib/store/use-auth'

async function hydrateFromSession() {
  const supabase = createClientComponentClient()
  const {
    setUser,
    setProfile,
    setOrganization,
    fetchProfile,
    fetchOrganization,
    setLoading,
    setInitialized,
    setError,
  } = useAuthStore.getState()

  setLoading(true)
  setError(null)

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    setUser(null)
    setProfile(null)
    setOrganization(null, null)
    setLoading(false)
    setInitialized(true)
    setError(error.message)
    return
  }

  const user = session?.user ?? null
  setUser(user)

  if (!user) {
    setProfile(null)
    setOrganization(null, null)
    setLoading(false)
    setInitialized(true)
    return
  }

  await Promise.all([fetchProfile(user.id), fetchOrganization(user.id)])
  setLoading(false)
  setInitialized(true)
}

export function AuthSessionSync() {
  useEffect(() => {
    const supabase = createClientComponentClient()
    let disposed = false

    void hydrateFromSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      if (disposed) {
        return
      }
      await hydrateFromSession()
    })

    return () => {
      disposed = true
      subscription.unsubscribe()
    }
  }, [])

  return null
}
