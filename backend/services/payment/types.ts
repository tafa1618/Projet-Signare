/**
 * BACKEND - Types pour le système de paiement
 * @ai-context Types partagés pour PaymentProvider et implémentations
 */

import type { Payment } from '@/shared/types/database.types'

/**
 * Résultat d'une initiation de paiement
 */
export interface PaymentInitiationResult {
  paymentId: string
  reference: string
  status: Payment['status']
  instructions: PaymentInstructions
  providerReference?: string
}

/**
 * Instructions de paiement retournées par le provider
 */
export interface PaymentInstructions {
  type: 'redirect' | 'qr_code' | 'mobile_money' | 'bank_transfer' | 'mock'
  url?: string // Pour redirect
  qrCode?: string // Pour QR code
  phoneNumber?: string // Pour mobile money
  accountDetails?: {
    bank: string
    account: string
    reference: string
  }
  message?: string // Message à afficher à l'utilisateur
}

/**
 * Résultat de la vérification d'un paiement
 */
export interface PaymentVerificationResult {
  status: Payment['status']
  providerReference?: string
  metadata?: Record<string, any>
}

/**
 * Données de callback d'un provider
 */
export interface ProviderCallbackData {
  reference: string
  status: 'success' | 'failed' | 'pending'
  providerReference: string
  amount?: number
  currency?: string
  signature?: string // Pour vérification de signature
  metadata?: Record<string, any>
}

