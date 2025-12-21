import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

/**
 * Récupérer l'URL Supabase de manière sûre
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local')
  }
  return url
}

/**
 * Récupérer la clé anon de manière sûre
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY manquante dans .env.local')
  }
  return key
}

/**
 * Récupérer la clé service role de manière sûre
 */
function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local')
  }
  return key
}

/**
 * Client Supabase pour les composants côté client
 * @ai-context Utilisé dans les composants React pour l'authentification et les requêtes temps réel
 */
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Côté serveur : créer une nouvelle instance à chaque fois
    return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
  }
  
  // Côté client : réutiliser l'instance
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return supabaseInstance
})()

/**
 * Client Supabase avec service role (côté serveur uniquement)
 * @ai-context Utilisé pour les opérations admin et les API routes
 * ⚠️ Ne jamais exposer côté client
 */
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin ne peut être utilisé que côté serveur')
  }
  
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  
  return supabaseAdminInstance
}

/**
 * Helper pour gérer l'authentification par téléphone
 * @ai-context Authentification OTP uniquement (pas de Google)
 */
export async function signInWithPhone(phoneNumber: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber,
    options: {
      channel: 'sms',
    },
  })
  
  return { data, error }
}

/**
 * Helper pour vérifier le code OTP
 */
export async function verifyOTP(phoneNumber: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneNumber,
    token,
    type: 'sms',
  })
  
  return { data, error }
}

/**
 * Helper pour récupérer le profil utilisateur
 * @ai-context Inclut les métadonnées ML (role_score, style_preferences)
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

