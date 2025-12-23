import Constants from 'expo-constants'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env manquantes pour le mobile (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)')
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '')

