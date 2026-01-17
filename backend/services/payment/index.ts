/**
 * BACKEND - Export centralisé du service de paiement
 * @ai-context Point d'entrée unique pour le système de paiement
 */

export { PaymentService, paymentService } from './PaymentService'
export { MockProvider } from './providers/MockProvider'
export type { PaymentProvider } from './PaymentProvider'
export type {
  PaymentInitiationResult,
  PaymentVerificationResult,
  ProviderCallbackData,
  PaymentInstructions,
} from './types'

