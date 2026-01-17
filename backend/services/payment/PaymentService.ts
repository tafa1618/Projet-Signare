/**
 * BACKEND - Service de paiement centralisé SIGNARE
 * @ai-context Service unique pour tous les flux financiers (paiements, commissions, sponsoring, etc.)
 * @security CRITIQUE : Gestion sécurisée des transactions avec idempotence et audit trail
 */

import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { PaymentRepository, TransactionLogRepository } from '@/backend/repositories'
import type { Payment, TransactionLog } from '@/shared/types/database.types'
import { MockProvider } from './providers/MockProvider'
import type { PaymentProvider } from './PaymentProvider'
import type {
  PaymentInitiationResult,
  PaymentVerificationResult,
  ProviderCallbackData,
} from './types'

/**
 * Service de paiement centralisé
 * 
 * Gère TOUS les flux financiers :
 * - Paiements utilisateurs (commandes)
 * - Commissions Signare
 * - Sponsoring
 * - Options premium
 * - Futures rémunérations tailleurs
 */
export class PaymentService {
  private provider: PaymentProvider

  constructor(provider?: PaymentProvider) {
    // Utiliser le provider fourni ou MockProvider par défaut
    this.provider = provider || new MockProvider()
  }

  /**
   * Initier un paiement
   * 
   * @param userId - ID de l'utilisateur
   * @param amount - Montant (doit être validé côté serveur)
   * @param currency - Devise (XOF par défaut)
   * @param purpose - Type de paiement
   * @param metadata - Métadonnées (order_id, feature_type, etc.)
   * @returns Résultat avec instructions de paiement
   */
  async initiatePayment(params: {
    userId: string
    amount: number
    currency?: string
    purpose: Payment['purpose']
    metadata?: Record<string, any>
  }): Promise<PaymentInitiationResult> {
    const supabase = getSupabaseAdmin()

    // ✅ Validation : montant doit être positif
    if (params.amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0')
    }

    // ✅ Générer une référence unique via fonction SQL
    const { data: referenceData, error: refError } = await supabase.rpc(
      'generate_payment_reference'
    )

    if (refError) {
      throw new Error(`Erreur lors de la génération de la référence : ${refError.message}`)
    }

    // La fonction SQL retourne directement la string
    const reference = (referenceData as string) || `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // ✅ Créer le paiement en base avec status INITIATED
    const paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'reference'> = {
      user_id: params.userId,
      amount: params.amount,
      currency: params.currency || 'XOF',
      purpose: params.purpose,
      status: 'INITIATED',
      provider: this.provider.name,
      provider_reference: null,
      metadata: params.metadata || {},
    }

    const payment = await PaymentRepository.create({
      ...paymentData,
      reference,
    })

    // ✅ Logger l'événement INITIATED
    await this.logTransaction(payment.id, 'INITIATED', {
      amount: params.amount,
      currency: params.currency || 'XOF',
      purpose: params.purpose,
    })

    // ✅ Appeler le provider pour initier le paiement
    let initiationResult: PaymentInitiationResult

    try {
      initiationResult = await this.provider.initiatePayment({
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        purpose: payment.purpose,
        metadata: payment.metadata as Record<string, any>,
      })

      // ✅ Mettre à jour le paiement avec la référence provider et le status
      await PaymentRepository.update(payment.id, {
        provider_reference: initiationResult.providerReference || null,
        status: initiationResult.status,
      })

      // ✅ Logger le résultat
      await this.logTransaction(payment.id, 'PROVIDER_INITIATED', {
        provider: this.provider.name,
        providerReference: initiationResult.providerReference,
        status: initiationResult.status,
      })

      return {
        ...initiationResult,
        paymentId: payment.id,
        reference: payment.reference,
      }
    } catch (error) {
      // ✅ En cas d'erreur, marquer comme FAILED
      await PaymentRepository.update(payment.id, {
        status: 'FAILED',
      })

      await this.logTransaction(payment.id, 'PROVIDER_ERROR', {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })

      throw error
    }
  }

  /**
   * Traiter un callback de provider
   * 
   * @param callbackData - Données du callback
   * @returns Résultat de vérification
   * 
   * @security Idempotent : peut être appelé plusieurs fois sans effet de bord
   */
  async handleCallback(callbackData: ProviderCallbackData): Promise<PaymentVerificationResult> {
    const supabase = getSupabaseAdmin()

    // ✅ Trouver le paiement par référence provider
    const { data: payments, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_reference', callbackData.providerReference)
      .limit(1)

    if (findError || !payments || payments.length === 0) {
      throw new Error(`Paiement introuvable pour la référence : ${callbackData.providerReference}`)
    }

    const payment = payments[0] as Payment

    // ✅ Idempotence : vérifier si le status a déjà été mis à jour
    const finalStatus: Payment['status'] =
      callbackData.status === 'success'
        ? 'SUCCESS'
        : callbackData.status === 'failed'
          ? 'FAILED'
          : 'PENDING'

    // Si le status est déjà le même, ne rien faire (idempotent)
    if (payment.status === finalStatus) {
      return {
        status: payment.status,
        providerReference: payment.provider_reference || undefined,
      }
    }

    // ✅ Valider le callback via le provider
    const verificationResult = await this.provider.handleCallback(callbackData)

    // ✅ Mettre à jour le status du paiement (transaction atomique)
    await PaymentRepository.update(payment.id, {
      status: verificationResult.status,
      metadata: {
        ...(payment.metadata as Record<string, any>),
        ...verificationResult.metadata,
        callbackReceivedAt: new Date().toISOString(),
      },
    })

    // ✅ Logger l'événement
    await this.logTransaction(payment.id, 'CALLBACK_RECEIVED', {
      provider: this.provider.name,
      callbackStatus: callbackData.status,
      finalStatus: verificationResult.status,
      payload: callbackData,
    })

    return verificationResult
  }

  /**
   * Vérifier l'état d'un paiement
   * 
   * @param reference - Référence du paiement
   * @returns État actuel du paiement
   */
  async getPaymentStatus(reference: string): Promise<Payment | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single()

    if (error || !data) {
      return null
    }

    return data as Payment
  }

  /**
   * Vérifier un paiement auprès du provider
   * 
   * @param reference - Référence du paiement
   * @returns État vérifié du paiement
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    const payment = await this.getPaymentStatus(reference)

    if (!payment) {
      throw new Error(`Paiement introuvable : ${reference}`)
    }

    if (!payment.provider_reference) {
      throw new Error(`Paiement sans référence provider : ${reference}`)
    }

    // ✅ Vérifier auprès du provider
    const verificationResult = await this.provider.verifyPayment(
      payment.provider_reference,
      payment.metadata as Record<string, any>
    )

    // ✅ Si le status a changé, mettre à jour
    if (verificationResult.status !== payment.status) {
      await PaymentRepository.update(payment.id, {
        status: verificationResult.status,
        metadata: {
          ...(payment.metadata as Record<string, any>),
          ...verificationResult.metadata,
          lastVerifiedAt: new Date().toISOString(),
        },
      })

      await this.logTransaction(payment.id, 'STATUS_CHANGED', {
        oldStatus: payment.status,
        newStatus: verificationResult.status,
        verifiedBy: 'manual_verification',
      })
    }

    return verificationResult
  }

  /**
   * Logger une transaction (audit trail)
   * 
   * @private
   */
  private async logTransaction(
    paymentId: string,
    event: string,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      await TransactionLogRepository.create({
        payment_id: paymentId,
        event,
        payload,
      })
    } catch (error) {
      // Ne pas faire échouer l'opération principale si le log échoue
      console.error('Erreur lors du logging de transaction:', error)
    }
  }

  /**
   * Récupérer les logs d'un paiement
   * 
   * @param paymentId - ID du paiement
   * @returns Liste des logs
   */
  async getTransactionLogs(paymentId: string): Promise<TransactionLog[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('transaction_logs')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []) as TransactionLog[]
  }
}

/**
 * Instance singleton du service de paiement
 * Utilise MockProvider par défaut (configurable via env)
 */
export const paymentService = new PaymentService()

