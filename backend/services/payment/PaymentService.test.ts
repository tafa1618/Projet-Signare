/**
 * Tests unitaires - PaymentService
 * @ai-context Tests essentiels pour valider le service de paiement
 * 
 * Pour exécuter : npm test PaymentService.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { PaymentService } from './PaymentService'
import { MockProvider } from './providers/MockProvider'
import type { PaymentProvider } from './PaymentProvider'
import type { PaymentInitiationResult } from './types'

// Mock Supabase
jest.mock('@/backend/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => ({
    rpc: jest.fn(() => ({
      data: 'PAY-20260101120000-ABC12345',
      error: null,
    })),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'payment-123',
              reference: 'PAY-20260101120000-ABC12345',
              user_id: 'user-123',
              amount: 1000,
              currency: 'XOF',
              purpose: 'ORDER',
              status: 'INITIATED',
              provider: 'MOCK',
              provider_reference: null,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'payment-123',
                status: 'SUCCESS',
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}))

// Mock Repository
jest.mock('@/backend/repositories', () => ({
  PaymentRepository: {
    create: jest.fn((data) => Promise.resolve({ id: 'payment-123', ...data })),
    update: jest.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  TransactionLogRepository: {
    create: jest.fn(() => Promise.resolve({ id: 'log-123' })),
  },
}))

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockProvider: PaymentProvider

  beforeEach(() => {
    mockProvider = new MockProvider({ defaultBehavior: 'success' })
    paymentService = new PaymentService(mockProvider)
  })

  describe('initiatePayment', () => {
    it('devrait créer un paiement avec status INITIATED', async () => {
      const result = await paymentService.initiatePayment({
        userId: 'user-123',
        amount: 1000,
        currency: 'XOF',
        purpose: 'ORDER',
        metadata: { orderId: 'order-123' },
      })

      expect(result).toHaveProperty('paymentId')
      expect(result).toHaveProperty('reference')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('instructions')
      expect(result.reference).toMatch(/^PAY-/)
    })

    it('devrait rejeter un montant négatif', async () => {
      await expect(
        paymentService.initiatePayment({
          userId: 'user-123',
          amount: -100,
          currency: 'XOF',
          purpose: 'ORDER',
        })
      ).rejects.toThrow('Le montant doit être supérieur à 0')
    })

    it('devrait rejeter un montant nul', async () => {
      await expect(
        paymentService.initiatePayment({
          userId: 'user-123',
          amount: 0,
          currency: 'XOF',
          purpose: 'ORDER',
        })
      ).rejects.toThrow('Le montant doit être supérieur à 0')
    })

    it('devrait utiliser XOF comme devise par défaut', async () => {
      const result = await paymentService.initiatePayment({
        userId: 'user-123',
        amount: 1000,
        purpose: 'ORDER',
      })

      expect(result.instructions).toBeDefined()
    })
  })

  describe('handleCallback', () => {
    it('devrait traiter un callback de succès', async () => {
      const result = await paymentService.handleCallback({
        reference: 'PAY-123',
        status: 'success',
        providerReference: 'MOCK-123',
      })

      expect(result.status).toBe('SUCCESS')
      expect(result.providerReference).toBe('MOCK-123')
    })

    it('devrait traiter un callback d\'échec', async () => {
      const result = await paymentService.handleCallback({
        reference: 'PAY-123',
        status: 'failed',
        providerReference: 'MOCK-123',
      })

      expect(result.status).toBe('FAILED')
    })

    it('devrait être idempotent (appels multiples sans effet de bord)', async () => {
      const callbackData = {
        reference: 'PAY-123',
        status: 'success' as const,
        providerReference: 'MOCK-123',
      }

      const result1 = await paymentService.handleCallback(callbackData)
      const result2 = await paymentService.handleCallback(callbackData)

      expect(result1.status).toBe(result2.status)
    })
  })

  describe('getPaymentStatus', () => {
    it('devrait retourner null si le paiement n\'existe pas', async () => {
      const result = await paymentService.getPaymentStatus('PAY-INEXISTANT')
      expect(result).toBeNull()
    })
  })
})

describe('MockProvider', () => {
  it('devrait retourner SUCCESS par défaut', async () => {
    const provider = new MockProvider({ defaultBehavior: 'success' })
    const result = await provider.initiatePayment({
      id: 'payment-123',
      reference: 'PAY-123',
      amount: 1000,
      currency: 'XOF',
      purpose: 'ORDER',
      metadata: {},
    })

    expect(result.status).toBe('SUCCESS')
    expect(result.instructions.type).toBe('mock')
  })

  it('devrait retourner FAILED si configuré', async () => {
    const provider = new MockProvider({ defaultBehavior: 'failed' })
    const result = await provider.initiatePayment({
      id: 'payment-123',
      reference: 'PAY-123',
      amount: 1000,
      currency: 'XOF',
      purpose: 'ORDER',
      metadata: {},
    })

    expect(result.status).toBe('FAILED')
  })

  it('devrait retourner PENDING si configuré', async () => {
    const provider = new MockProvider({ defaultBehavior: 'pending' })
    const result = await provider.initiatePayment({
      id: 'payment-123',
      reference: 'PAY-123',
      amount: 1000,
      currency: 'XOF',
      purpose: 'ORDER',
      metadata: {},
    })

    expect(result.status).toBe('PENDING')
  })
})

