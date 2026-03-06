import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/backend/lib/supabase'
import type { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  phone: string
  full_name: string
  gender: 'signare' | 'ndanane' | null
  is_tailor: boolean
  tailor_status: 'none' | 'pending' | 'verified'
  is_digital_twin: boolean
  created_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await getUserProfile(userId)
    setProfile(data as Profile | null)
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) await fetchProfile(currentUser.id)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, isLoading, signOut }
}

