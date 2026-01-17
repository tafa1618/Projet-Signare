/**
 * BACKEND - Repository Layer
 * @ai-context Couche d'accès aux données - abstraction de Supabase
 * Facilite le changement de backend (ex: PostgreSQL direct, Prisma, etc.)
 */

import { supabase } from '@/backend/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type Tables = Database['public']['Tables']

/**
 * Repository générique
 * @ai-context Pattern Repository pour séparer la logique de persistance
 */
export class BaseRepository<T extends keyof Tables> {
  constructor(protected tableName: T) {}

  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, any>, limit = 100) {
    let query = supabase.from(this.tableName).select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query.limit(limit)

    if (error) throw error
    return data
  }

  async create(data: any) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Repositories spécifiques
export const ProfileRepository = new BaseRepository('profiles')
export const PostRepository = new BaseRepository('posts')
export const OrderRepository = new BaseRepository('orders')
export const MesureRepository = new BaseRepository('mesures')
export const EventRepository = new BaseRepository('events')
export const InspirationRepository = new BaseRepository('inspirations')
export const PaymentRepository = new BaseRepository('payments')
export const TransactionLogRepository = new BaseRepository('transaction_logs')

