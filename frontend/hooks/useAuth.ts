import { useState, useEffect } from 'react'
import { supabase } from '@/backend/lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Hook pour gérer l'authentification utilisateur
 * @ai-context Authentification par téléphone (OTP) uniquement
 * 
 * En mode développement, simule l'authentification avec les profils mockés :
 * - +771111111 : Aminata Ndiaye (Client)
 * - +772222222 : Tapha Tailleur (Tailleur)
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // En mode développement, vérifier si un numéro est stocké dans localStorage
    if (typeof window !== 'undefined') {
      const mockPhone = localStorage.getItem('mock_auth_phone')
      
      if (mockPhone && (
        mockPhone === '+771111111' || mockPhone === '771111111' || 
        mockPhone === '+772222222' || mockPhone === '772222222' ||
        mockPhone === '+781110455' || mockPhone === '781110455'
      )) {
        // Simuler un utilisateur connecté avec le numéro de téléphone
        let userId = 'client-771111111'
        let name = 'Aminata Ndiaye'
        let birthdate = '2000-04-16'
        
        if (mockPhone === '+772222222' || mockPhone === '772222222') {
          userId = 'tailor-772222222'
          name = 'Tapha Tailleur'
          birthdate = '1995-06-22'
        } else if (mockPhone === '+781110455' || mockPhone === '781110455') {
          userId = 'super-admin-781110455'
          name = 'Super Admin'
          birthdate = '1990-01-01'
        }
        
        const mockUser = {
          id: userId,
          phone: mockPhone.startsWith('+') ? mockPhone : `+${mockPhone}`,
          user_metadata: {
            phone: mockPhone.startsWith('+') ? mockPhone : `+${mockPhone}`,
            name,
            birthdate,
          },
        } as unknown as User
        
        setUser(mockUser)
        setIsLoading(false)
        return
      }
    }

    // Récupérer la session actuelle (production)
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        // En cas d'erreur (ex: Supabase non configuré), on reste sur null
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    // Nettoyer le mock auth en développement
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_auth_phone')
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, isLoading, signOut }
}

