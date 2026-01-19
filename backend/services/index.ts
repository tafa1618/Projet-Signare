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

// Export du service de rattachement automatique
export { UserAttributionService } from './UserAttributionService'

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
   * @param postData Données du post (user_id OU phone_number requis)
   * @param phoneNumber Numéro de téléphone si l'utilisateur n'est pas membre (optionnel)
   * @param userType Type d'utilisateur si non-membre ('TAILLEUR' ou 'CLIENT')
   */
  static async create(
    postData: Partial<Post> & { phone_number?: string },
    phoneNumber?: string,
    userType?: 'TAILLEUR' | 'CLIENT'
  ): Promise<Post> {
    // Si un numéro de téléphone est fourni et pas de user_id, enregistrer comme non-membre
    if (phoneNumber && !postData.user_id) {
      // Enregistrer le numéro dans pending_users si userType est fourni
      if (userType) {
        const { UserAttributionService } = await import('./UserAttributionService')
        await UserAttributionService.registerPendingUser(phoneNumber, userType)
      }
      
      // Ajouter le numéro de téléphone aux données du post
      postData.phone_number = phoneNumber
    }

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
   * @param orderData Données de la commande (buyer_id/seller_id OU buyer_phone/seller_phone requis)
   * @param buyerPhone Numéro de téléphone de l'acheteur si non-membre (optionnel)
   * @param sellerPhone Numéro de téléphone du vendeur si non-membre (optionnel)
   * @param buyerType Type d'utilisateur acheteur si non-membre ('TAILLEUR' ou 'CLIENT')
   * @param sellerType Type d'utilisateur vendeur si non-membre ('TAILLEUR' ou 'CLIENT')
   * @ai-context Calcul Yango : 1500 FCFA + 100 FCFA/km + 15% (livraison optionnelle et bidirectionnelle)
   */
  static async create(
    orderData: Partial<Order> & { 
      buyer_phone?: string
      seller_phone?: string
      requires_delivery?: boolean
      delivery_type?: 'product_delivery' | 'fabric_delivery' | 'both' | null
    },
    buyerPhone?: string,
    sellerPhone?: string,
    buyerType?: 'TAILLEUR' | 'CLIENT',
    sellerType?: 'TAILLEUR' | 'CLIENT'
  ): Promise<Order> {
    const { UserAttributionService } = await import('./UserAttributionService')

    // Si un numéro de téléphone acheteur est fourni et pas de buyer_id, enregistrer comme non-membre
    if (buyerPhone && !orderData.buyer_id) {
      if (buyerType) {
        await UserAttributionService.registerPendingUser(buyerPhone, buyerType)
      }
      orderData.buyer_phone = buyerPhone
    }

    // Si un numéro de téléphone vendeur est fourni et pas de seller_id, enregistrer comme non-membre
    if (sellerPhone && !orderData.seller_id) {
      if (sellerType) {
        await UserAttributionService.registerPendingUser(sellerPhone, sellerType)
      }
      orderData.seller_phone = sellerPhone
    }

    // Calculer le shipping_price si la livraison est requise
    // Le trigger SQL calculera automatiquement, mais on peut aussi le faire ici pour validation
    if (!orderData.requires_delivery) {
      orderData.shipping_price = 0
    }

    // Calculer le total_price
    orderData.total_price = orderData.product_price + (orderData.shipping_price || 0)

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
   * @param orderId ID de la commande
   * @param validationCode Code de validation
   * @param deliveryDirection Direction de la livraison ('buyer' ou 'seller')
   */
  static async validateDelivery(
    orderId: string, 
    validationCode: string,
    deliveryDirection: 'buyer' | 'seller' = 'buyer'
  ): Promise<boolean> {
    const { data: order } = await supabase
      .from('orders')
      .select('delivery_to_buyer_validation_code, delivery_to_seller_validation_code, status, delivery_type')
      .eq('id', orderId)
      .single()

    if (!order) {
      return false
    }

    // Vérifier le code selon la direction
    const expectedCode = deliveryDirection === 'buyer' 
      ? order.delivery_to_buyer_validation_code 
      : order.delivery_to_seller_validation_code

    if (expectedCode !== validationCode) {
      return false
    }

    // Mettre à jour le statut
    // Si les deux livraisons sont requises, on vérifie si l'autre est déjà livrée
    const updateData: any = {
      delivered_at: new Date().toISOString(),
    }

    // Si c'est la livraison au client et que c'est la seule, ou si les deux sont livrées
    if (deliveryDirection === 'buyer') {
      if (order.delivery_type === 'product_delivery' || 
          (order.delivery_type === 'both' && order.status === 'in_delivery')) {
        updateData.status = 'delivered'
      } else if (order.delivery_type === 'both') {
        updateData.status = 'in_delivery' // En attente de la livraison du tissu
      }
    } else {
      // Livraison au tailleur (tissu)
      if (order.delivery_type === 'fabric_delivery' || 
          (order.delivery_type === 'both' && order.status === 'in_delivery')) {
        updateData.status = 'delivered'
      } else if (order.delivery_type === 'both') {
        updateData.status = 'in_delivery' // En attente de la livraison du produit
      }
    }

    await supabase
      .from('orders')
      .update(updateData)
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

