/**
 * BACKEND - Interface abstraite pour les providers de paiement
 * @ai-context Abstraction permettant de brancher différents providers (MOCK, PayTech, PayDunya)
 */

import type {
  PaymentInitiationResult,
  PaymentVerificationResult,
  ProviderCallbackData,
} from './types'
import type { Payment } from '@/shared/types/database.types'

/**
 * Interface que tous les providers de paiement doivent implémenter
 */
export interface PaymentProvider {
  /**
   * Nom du provider (pour logging et identification)
   */
  readonly name: Payment['provider']

  /**
   * Initier un paiement
   * @param payment - Données du paiement
   * @returns Instructions de paiement pour l'utilisateur
   */
  initiatePayment(payment: {
    id: string
    reference: string
    amount: number
    currency: string
    purpose: Payment['purpose']
    metadata: Record<string, any>
  }): Promise<PaymentInitiationResult>

  /**
   * Vérifier l'état d'un paiement
   * @param providerReference - Référence retournée par le provider
   * @param metadata - Métadonnées du paiement (pour contexte)
   * @returns État actuel du paiement
   */
  verifyPayment(
    providerReference: string,
    metadata?: Record<string, any>
  ): Promise<PaymentVerificationResult>

  /**
   * Valider et traiter un callback du provider
   * @param callbackData - Données du callback
   * @returns Résultat de vérification
   */
  handleCallback(callbackData: ProviderCallbackData): Promise<PaymentVerificationResult>
}

