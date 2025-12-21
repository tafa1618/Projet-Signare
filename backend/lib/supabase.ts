import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

/**
 * Client Supabase pour les composants côté client
 * @ai-context Utilisé dans les composants React pour l'authentification et les requêtes temps réel
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Client Supabase avec service role (côté serveur uniquement)
 * @ai-context Utilisé pour les opérations admin et les API routes
 * ⚠️ Ne jamais exposer côté client
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

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

