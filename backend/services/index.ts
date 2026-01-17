/**
 * BACKEND - Services métier
 * @ai-context Services pour la logique backend (appelés depuis API routes ou server components)
 */

import { supabase } from '@/backend/lib/supabase'
import type { Profile, Post, Order } from '@/shared/types/database.types'

// Export du service de paiement (structure séparée pour organisation)
export { PaymentService, paymentService } from './payment/PaymentService'
export { MockProvider } from './payment/providers/MockProvider'
export type { PaymentProvider } from './payment/PaymentProvider'
export type {
  PaymentInitiationResult,
  PaymentVerificationResult,
  ProviderCallbackData,
  PaymentInstructions,
} from './payment/types'

// Export du service de gestion des admins
export { AdminUserService } from './AdminUserService'
export type { AdminUser } from './AdminUserService'

/**
 * Service Profile - Gestion des profils utilisateurs
 */
export class ProfileService {
  /**
   * Récupérer un profil par ID
   * @ai-context Inclut les métadonnées ML (role_score, style_preferences)
   */
  static async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Mettre à jour le role_score basé sur l'activité
   * @ai-context Algorithme de scoring : créations +5, achats +1
   */
  static async updateRoleScore(userId: string, activity: 'creation' | 'purchase'): Promise<void> {
    const profile = await this.getById(userId)
    if (!profile) return

    const increment = activity === 'creation' ? 5 : 1
    const newScore = Math.min(100, profile.role_score + increment)

    await supabase
      .from('profiles')
      .update({ role_score: newScore })
      .eq('id', userId)
  }

  /**
   * Mettre à jour les préférences stylistiques
   * @ai-context Mise à jour du vecteur de préférences pour recommandations
   */
  static async updateStylePreferences(
    userId: string,
    preferences: { traditional?: number; modern?: number; luxury?: number }
  ): Promise<void> {
    await supabase
      .from('profiles')
      .update({ style_preferences: preferences })
      .eq('id', userId)
  }
}

/**
 * Service Post - Gestion des publications
 */
export class PostService {
  /**
   * Créer un post avec métadonnées ML
   */
  static async create(postData: Partial<Post>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Récupérer le feed personnalisé
   * @ai-context Algorithme de recommandation basé sur style_preferences
   */
  static async getPersonalizedFeed(userId: string, limit = 20): Promise<Post[]> {
    // TODO: Implémenter l'algo de recommandation ML
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViews(postId: string): Promise<void> {
    const { data: post } = await supabase
      .from('posts')
      .select('views_count')
      .eq('id', postId)
      .single()

    if (!post) return

    await supabase
      .from('posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', postId)
  }
}

/**
 * Service Order - Gestion des commandes
 */
export class OrderService {
  /**
   * Créer une commande avec calcul automatique des prix
   * @ai-context Calcul Yango : 500 FCFA + 100 FCFA/km + 15%
   */
  static async create(orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Valider une livraison avec code
   */
  static async validateDelivery(orderId: string, validationCode: string): Promise<boolean> {
    const { data: order } = await supabase
      .from('orders')
      .select('validation_code, status')
      .eq('id', orderId)
      .single()

    if (!order || order.validation_code !== validationCode) {
      return false
    }

    await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return true
  }

  /**
   * Récupérer les commandes d'un utilisateur
   */
  static async getByUser(userId: string, role: 'buyer' | 'seller'): Promise<Order[]> {
    const column = role === 'buyer' ? 'buyer_id' : 'seller_id'
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

