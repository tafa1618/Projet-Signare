# 💳 Service de Paiement Centralisé SIGNARE

## 📋 Vue d'ensemble

Service centralisé pour gérer **TOUS** les flux financiers de la plateforme SIGNARE :

- ✅ Paiements utilisateurs (commandes)
- ✅ Commissions Signare
- ✅ Sponsoring
- ✅ Options premium
- ✅ Futures rémunérations tailleurs

## 🏗️ Architecture

```
PaymentService (Service central)
    ↓
PaymentProvider (Interface abstraite)
    ↓
    ├── MockProvider (Développement/Test)
    ├── PayTechProvider (À implémenter)
    └── PayDunyaProvider (À implémenter)
```

### Principes

1. **Un seul point d'entrée** : `PaymentService`
2. **Abstraction des providers** : Le backend ne dépend jamais directement d'un provider
3. **Extensibilité** : Ajout de nouveaux providers via `PaymentProvider`
4. **Mockable** : Fonctionne en mode MOCK pour développement

## 📊 Modèle de données

### Table `payments`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Utilisateur initiateur |
| `reference` | VARCHAR(50) | Référence unique (format: `PAY-YYYYMMDDHH24MISS-XXXXXXXX`) |
| `amount` | DECIMAL(12,2) | Montant (doit être > 0) |
| `currency` | VARCHAR(3) | Devise (XOF par défaut) |
| `purpose` | ENUM | Type: `SPONSORING`, `FEATURE`, `SUBSCRIPTION`, `PROMOTION`, `ORDER`, `COMMISSION` |
| `status` | ENUM | État: `INITIATED`, `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED` |
| `provider` | ENUM | Provider: `MOCK`, `PAYTECH`, `PAYDUNYA` |
| `provider_reference` | VARCHAR(255) | Référence retournée par le provider |
| `metadata` | JSONB | Métadonnées flexibles (order_id, feature_type, etc.) |

### Table `transaction_logs`

Audit trail complet de toutes les transactions :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `payment_id` | UUID | Référence au paiement |
| `event` | VARCHAR(50) | Type d'événement (INITIATED, CALLBACK_RECEIVED, etc.) |
| `payload` | JSONB | Données brutes de l'événement |
| `created_at` | TIMESTAMPTZ | Date de création |

## 🚀 Utilisation

### Initier un paiement

```typescript
import { paymentService } from '@/backend/services/payment/PaymentService'

const result = await paymentService.initiatePayment({
  userId: 'user-123',
  amount: 5000,
  currency: 'XOF',
  purpose: 'ORDER',
  metadata: {
    orderId: 'order-456',
  },
})

// result contient:
// - paymentId: string
// - reference: string
// - status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED'
// - instructions: PaymentInstructions
```

### Vérifier l'état d'un paiement

```typescript
const payment = await paymentService.getPaymentStatus('PAY-20260101120000-ABC12345')

if (payment) {
  console.log(`Status: ${payment.status}`)
  console.log(`Montant: ${payment.amount} ${payment.currency}`)
}
```

### Traiter un callback

```typescript
const result = await paymentService.handleCallback({
  reference: 'PAY-123',
  status: 'success',
  providerReference: 'MOCK-123',
})
```

## 🔌 API Endpoints

### `POST /api/payments/initiate`

Initier un nouveau paiement.

**Body:**
```json
{
  "amount": 5000,
  "currency": "XOF",
  "purpose": "ORDER",
  "metadata": {
    "orderId": "order-123"
  }
}
```

**Response:**
```json
{
  "paymentId": "uuid",
  "reference": "PAY-20260101120000-ABC12345",
  "status": "INITIATED",
  "instructions": {
    "type": "mock",
    "message": "✅ Paiement mock réussi..."
  }
}
```

### `GET /api/payments/:reference`

Récupérer l'état d'un paiement.

**Response:**
```json
{
  "id": "uuid",
  "reference": "PAY-20260101120000-ABC12345",
  "amount": 5000,
  "currency": "XOF",
  "purpose": "ORDER",
  "status": "SUCCESS",
  "provider": "MOCK",
  "provider_reference": "MOCK-123",
  "metadata": {},
  "created_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-01T12:00:00Z"
}
```

### `POST /api/payments/callback`

Endpoint générique pour les callbacks des providers.

**Body:**
```json
{
  "reference": "PAY-123",
  "status": "success",
  "providerReference": "MOCK-123",
  "signature": "hash-signature"
}
```

## 🧪 MockProvider

Le `MockProvider` permet de tester différents scénarios :

### Configuration via variables d'environnement

```env
# Comportement par défaut: success | failed | pending
MOCK_PAYMENT_BEHAVIOR=success

# Délai simulé avant succès (ms)
MOCK_PAYMENT_DELAY=1000

# Probabilité d'échec (0-1)
MOCK_PAYMENT_FAILURE_RATE=0.1
```

### Configuration programmatique

```typescript
const provider = new MockProvider({
  defaultBehavior: 'success',
  successDelay: 1000,
  failureRate: 0.1,
})

const service = new PaymentService(provider)
```

## 🔒 Sécurité

### ✅ Validations

- **Montant** : Doit être > 0 (validé côté serveur)
- **Purpose** : Enum strict (pas de valeurs arbitraires)
- **Status** : Machine à états stricte (transitions validées)
- **Idempotence** : Callbacks peuvent être appelés plusieurs fois sans effet de bord

### ✅ Audit Trail

Toutes les transactions sont loggées dans `transaction_logs` :
- INITIATED
- PROVIDER_INITIATED
- CALLBACK_RECEIVED
- STATUS_CHANGED
- PROVIDER_ERROR

### ✅ RLS (Row Level Security)

- Les utilisateurs ne peuvent voir que leurs propres paiements
- Les utilisateurs ne peuvent créer que leurs propres paiements
- Les logs sont accessibles uniquement via le paiement associé

## 🔮 Extension : Ajouter un nouveau provider

1. Implémenter l'interface `PaymentProvider` :

```typescript
import type { PaymentProvider } from './PaymentProvider'

export class PayTechProvider implements PaymentProvider {
  readonly name = 'PAYTECH'

  async initiatePayment(payment) {
    // Appel API PayTech
    // Retourner PaymentInitiationResult
  }

  async verifyPayment(providerReference) {
    // Vérifier auprès de PayTech
    // Retourner PaymentVerificationResult
  }

  async handleCallback(callbackData) {
    // Valider signature
    // Retourner PaymentVerificationResult
  }
}
```

2. Utiliser le provider :

```typescript
const payTechProvider = new PayTechProvider({
  apiKey: process.env.PAYTECH_API_KEY,
  apiSecret: process.env.PAYTECH_API_SECRET,
})

const paymentService = new PaymentService(payTechProvider)
```

## 📝 Migration SQL

Exécuter la migration :

```bash
psql -U postgres -d signare -f supabase-migrations/004_create_payments_system.sql
```

Ou via Supabase Dashboard : SQL Editor → Exécuter le script.

## 🧪 Tests

```bash
npm test PaymentService.test.ts
```

## 📚 Références

- [Architecture Backend/Frontend](../docs/BACKEND_FRONTEND_SEPARATION.md)
- [Sécurité](../docs/SECURITY_AUDIT.md)

