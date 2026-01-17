/**
 * BACKEND - MockProvider pour développement et tests
 * @ai-context Provider mockable permettant de simuler différents scénarios
 */

import type { PaymentProvider } from '../PaymentProvider'
import type {
  PaymentInitiationResult,
  PaymentVerificationResult,
  ProviderCallbackData,
  PaymentInstructions,
} from '../types'
import type { Payment } from '@/shared/types/database.types'

/**
 * Configuration du MockProvider
 */
export interface MockProviderConfig {
  /**
   * Comportement par défaut : 'success' | 'failed' | 'pending'
   */
  defaultBehavior?: 'success' | 'failed' | 'pending'
  /**
   * Délai simulé avant succès (en ms)
   */
  successDelay?: number
  /**
   * Probabilité d'échec (0-1)
   */
  failureRate?: number
}

/**
 * MockProvider - Simule un provider de paiement
 * 
 * Permet de tester différents scénarios :
 * - Succès immédiat
 * - Échec simulé
 * - Pending simulé
 * 
 * Configurable via variables d'environnement ou paramètres
 */
export class MockProvider implements PaymentProvider {
  readonly name: Payment['provider'] = 'MOCK'

  private config: Required<MockProviderConfig>

  constructor(config: MockProviderConfig = {}) {
    // Configuration depuis variables d'environnement ou paramètres
    this.config = {
      defaultBehavior:
        (process.env.MOCK_PAYMENT_BEHAVIOR as 'success' | 'failed' | 'pending') ||
        config.defaultBehavior ||
        'success',
      successDelay: parseInt(process.env.MOCK_PAYMENT_DELAY || '0') || config.successDelay || 0,
      failureRate: parseFloat(process.env.MOCK_PAYMENT_FAILURE_RATE || '0') || config.failureRate || 0,
    }
  }

  async initiatePayment(payment: {
    id: string
    reference: string
    amount: number
    currency: string
    purpose: Payment['purpose']
    metadata: Record<string, any>
  }): Promise<PaymentInitiationResult> {
    // Simuler un délai si configuré
    if (this.config.successDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.successDelay))
    }

    // Déterminer le comportement
    const behavior = this.determineBehavior()

    // Générer une référence provider mock
    const providerReference = `MOCK-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Instructions selon le comportement
    const instructions: PaymentInstructions = this.getInstructions(behavior, payment)

    // Si succès immédiat, retourner directement SUCCESS
    // Sinon, retourner PENDING (sera mis à jour via callback ou vérification)
    const status: Payment['status'] =
      behavior === 'success' ? 'SUCCESS' : behavior === 'failed' ? 'FAILED' : 'PENDING'

    return {
      paymentId: payment.id,
      reference: payment.reference,
      status,
      instructions,
      providerReference,
    }
  }

  async verifyPayment(
    providerReference: string,
    metadata?: Record<string, any>
  ): Promise<PaymentVerificationResult> {
    // Pour le mock, on peut simuler différents états selon la référence
    // Par exemple, si la référence contient "FAIL", retourner FAILED
    if (providerReference.includes('FAIL')) {
      return {
        status: 'FAILED',
        providerReference,
      }
    }

    if (providerReference.includes('PENDING')) {
      return {
        status: 'PENDING',
        providerReference,
      }
    }

    // Par défaut, succès
    return {
      status: 'SUCCESS',
      providerReference,
    }
  }

  async handleCallback(callbackData: ProviderCallbackData): Promise<PaymentVerificationResult> {
    // Valider les données du callback
    if (!callbackData.reference || !callbackData.providerReference) {
      throw new Error('Callback invalide : référence manquante')
    }

    // Convertir le status du callback en status Payment
    const status: Payment['status'] =
      callbackData.status === 'success'
        ? 'SUCCESS'
        : callbackData.status === 'failed'
          ? 'FAILED'
          : 'PENDING'

    return {
      status,
      providerReference: callbackData.providerReference,
      metadata: callbackData.metadata,
    }
  }

  /**
   * Déterminer le comportement selon la configuration
   */
  private determineBehavior(): 'success' | 'failed' | 'pending' {
    // Si un taux d'échec est configuré, l'appliquer
    if (this.config.failureRate > 0 && Math.random() < this.config.failureRate) {
      return 'failed'
    }

    return this.config.defaultBehavior
  }

  /**
   * Générer les instructions selon le comportement
   */
  private getInstructions(
    behavior: 'success' | 'failed' | 'pending',
    payment: {
      reference: string
      amount: number
      currency: string
    }
  ): PaymentInstructions {
    switch (behavior) {
      case 'success':
        return {
          type: 'mock',
          message: `✅ Paiement mock réussi : ${payment.amount} ${payment.currency} (réf: ${payment.reference})`,
        }

      case 'failed':
        return {
          type: 'mock',
          message: `❌ Paiement mock échoué : ${payment.amount} ${payment.currency} (réf: ${payment.reference})`,
        }

      case 'pending':
        return {
          type: 'mock',
          message: `⏳ Paiement mock en attente : ${payment.amount} ${payment.currency} (réf: ${payment.reference})`,
        }

      default:
        return {
          type: 'mock',
          message: `Paiement mock : ${payment.amount} ${payment.currency}`,
        }
    }
  }
}

