/**
 * Service de rattachement automatique des données pour utilisateurs non-membres
 * 
 * Ce service permet de :
 * 1. Enregistrer les numéros de téléphone des non-membres lors de leurs actions
 * 2. Rattacher automatiquement leur historique (posts, commandes) lors de l'inscription
 * 
 * @ai-context Système de continuité utilisateur pour améliorer l'expérience
 * et éviter la perte de données lors de l'inscription
 */

import { getSupabaseAdmin } from '@/backend/lib/supabase'

export class UserAttributionService {
  /**
   * Enregistre un numéro de téléphone non-membre dans pending_users
   * @param phoneNumber Numéro de téléphone
   * @param userType Type d'utilisateur ('TAILLEUR' ou 'CLIENT')
   */
  static async registerPendingUser(
    phoneNumber: string,
    userType: 'TAILLEUR' | 'CLIENT'
  ): Promise<void> {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.rpc('register_pending_user', {
      p_phone_number: phoneNumber,
      p_user_type: userType,
    })

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement du numéro non-membre: ${error.message}`)
    }
  }

  /**
   * Rattache manuellement les données d'un utilisateur non-membre à son compte
   * (Utile si le trigger automatique n'a pas fonctionné)
   * @param userId ID de l'utilisateur
   * @param phoneNumber Numéro de téléphone
   */
  static async attachPendingUserData(
    userId: string,
    phoneNumber: string
  ): Promise<void> {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.rpc('attach_pending_user_data', {
      p_user_id: userId,
      p_phone_number: phoneNumber,
    })

    if (error) {
      throw new Error(`Erreur lors du rattachement des données: ${error.message}`)
    }
  }

  /**
   * Vérifie si un numéro de téléphone a des données en attente de rattachement
   * @param phoneNumber Numéro de téléphone
   * @returns true si des données sont en attente, false sinon
   */
  static async hasPendingData(phoneNumber: string): Promise<boolean> {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.rpc('has_pending_data', {
      p_phone_number: phoneNumber,
    })

    if (error) {
      throw new Error(`Erreur lors de la vérification des données en attente: ${error.message}`)
    }

    return data === true
  }

  /**
   * Récupère le nombre de posts en attente pour un numéro de téléphone
   * @param phoneNumber Numéro de téléphone
   * @returns Nombre de posts en attente
   */
  static async getPendingPostsCount(phoneNumber: string): Promise<number> {
    const supabase = getSupabaseAdmin()

    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phoneNumber)
      .is('user_id', null)

    if (error) {
      throw new Error(`Erreur lors du comptage des posts en attente: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Récupère le nombre de commandes en attente pour un numéro de téléphone
   * @param phoneNumber Numéro de téléphone
   * @returns Nombre de commandes en attente (en tant qu'acheteur ou vendeur)
   */
  static async getPendingOrdersCount(phoneNumber: string): Promise<number> {
    const supabase = getSupabaseAdmin()

    const { count: buyerCount, error: buyerError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_phone', phoneNumber)
      .is('buyer_id', null)

    if (buyerError) {
      throw new Error(`Erreur lors du comptage des commandes en attente (acheteur): ${buyerError.message}`)
    }

    const { count: sellerCount, error: sellerError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_phone', phoneNumber)
      .is('seller_id', null)

    if (sellerError) {
      throw new Error(`Erreur lors du comptage des commandes en attente (vendeur): ${sellerError.message}`)
    }

    return (buyerCount || 0) + (sellerCount || 0)
  }
}

