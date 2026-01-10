/**
 * Système de logging sécurisé
 * @security Ne jamais exposer de données sensibles (PII, tokens, etc.)
 * @ai-context Logs structurés pour debugging sans compromettre la sécurité
 */

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

/**
 * Sanitizer les données sensibles avant logging
 * @security Supprime ou masque les informations personnelles
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveFields = [
    'password',
    'token',
    'api_key',
    'apiKey',
    'secret',
    'authorization',
    'auth',
    'phone',
    'phone_number',
    'email',
    'credit_card',
    'cvv',
    'ssn',
    'passport',
    'bank_account',
    'validation_code',
    'code',
  ]

  const sanitized: any = Array.isArray(data) ? [] : {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()

    // Masquer les champs sensibles
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '***REDACTED***'
      continue
    }

    // Truncate les strings longues (user_agent, etc.)
    if (typeof value === 'string' && value.length > 100) {
      sanitized[key] = value.substring(0, 100) + '...'
      continue
    }

    // Récursif pour les objets imbriqués
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value)
      continue
    }

    // Garder les valeurs non sensibles
    sanitized[key] = value
  }

  return sanitized
}

/**
 * Logger pour les interactions ML
 * @security Sanitize automatiquement les données sensibles
 */
export function logMLInteraction(payload: any) {
  if (!isDev) {
    // En production : envoyer à service de logging (Sentry, LogRocket, etc.)
    // TODO: Intégrer service de logging externe
    return
  }

  const sanitized = sanitizeData(payload)
  console.log('[ML] user_interactions.insert', sanitized)
}

/**
 * Logger pour les erreurs
 * @security Ne pas exposer les stack traces en production
 */
export function logError(error: unknown, context?: string) {
  const contextStr = context ? `[${context}]` : '[ERROR]'

  if (isDev) {
    // En dev : logger avec détails complets
    console.error(contextStr, error)
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
  } else {
    // En production : logger uniquement le message sans stack trace
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(contextStr, errorMessage)
    // TODO: Envoyer à service de monitoring (Sentry, etc.)
  }
}

/**
 * Logger pour les opérations critiques (auth, paiements, etc.)
 * @security Logging conditionnel selon l'environnement
 */
export function logCritical(operation: string, details?: any) {
  if (!isDev && !isProd) {
    // En test : pas de logs
    return
  }

  const sanitized = details ? sanitizeData(details) : undefined
  console.log(`[CRITICAL] ${operation}`, sanitized)

  // TODO: En production, envoyer à service d'audit séparé
}

/**
 * Logger pour les requêtes API (debug uniquement)
 * @security Ne jamais logger en production
 */
export function logAPIRequest(method: string, path: string, body?: any) {
  if (!isDev) return

  const sanitized = body ? sanitizeData(body) : undefined
  console.log(`[API] ${method} ${path}`, sanitized)
}

/**
 * Logger pour les opérations de sécurité
 * @security Toujours logger, même en production (sans détails)
 */
export function logSecurity(event: string, details?: any) {
  const sanitized = details ? sanitizeData(details) : undefined

  if (isDev) {
    console.warn(`[SECURITY] ${event}`, sanitized)
  } else {
    // En production : logger minimal pour audit
    console.warn(`[SECURITY] ${event}`)
    // TODO: Envoyer à service d'audit de sécurité
  }
}

/**
 * Logger structuré pour les performances
 */
export function logPerformance(operation: string, duration: number, metadata?: any) {
  if (!isDev) return

  const sanitized = metadata ? sanitizeData(metadata) : undefined
  console.log(`[PERF] ${operation} took ${duration}ms`, sanitized)
}

/**
 * Helper pour mesurer le temps d'exécution
 */
export function measureTime<T>(operation: string, fn: () => T, metadata?: any): T {
  const start = Date.now()
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          const duration = Date.now() - start
          logPerformance(operation, duration, metadata)
          return value
        },
        (error) => {
          const duration = Date.now() - start
          logPerformance(operation, duration, { ...metadata, error: error.message })
          throw error
        }
      ) as T
    }
    const duration = Date.now() - start
    logPerformance(operation, duration, metadata)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logPerformance(operation, duration, { ...metadata, error: error instanceof Error ? error.message : 'Unknown' })
    throw error
  }
}

