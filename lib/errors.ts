/**
 * Classes d'erreurs personnalisées pour gestion explicite
 * @security Permet une gestion d'erreurs prévisible et exploitable
 * @ai-context Erreurs typées pour faciliter le debugging et l'UX
 */

/**
 * Erreur réseau (connexion, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(
    message: string = 'Erreur de connexion',
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }

  get isRetryable(): boolean {
    // Erreurs réseau sont généralement retryables
    return this.statusCode === undefined || (this.statusCode >= 500 && this.statusCode < 600)
  }

  getUserMessage(): string {
    if (this.statusCode === 408 || this.message.includes('timeout')) {
      return 'La requête a pris trop de temps. Vérifiez votre connexion.'
    }
    if (this.statusCode === 503) {
      return 'Service temporairement indisponible. Veuillez réessayer.'
    }
    return 'Erreur de connexion. Vérifiez votre réseau et réessayez.'
  }
}

/**
 * Erreur de validation (données invalides)
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  getUserMessage(): string {
    if (this.field) {
      return `Erreur de validation sur le champ "${this.field}": ${this.message}`
    }
    return `Données invalides: ${this.message}`
  }
}

/**
 * Erreur d'authentification (non autorisé, token expiré, etc.)
 */
export class AuthenticationError extends Error {
  constructor(
    message: string = 'Non autorisé',
    public statusCode: number = 401,
    public requiresReauth: boolean = false
  ) {
    super(message)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }

  getUserMessage(): string {
    if (this.requiresReauth) {
      return 'Votre session a expiré. Veuillez vous reconnecter.'
    }
    return 'Vous devez être connecté pour effectuer cette action.'
  }
}

/**
 * Erreur d'autorisation (permissions insuffisantes)
 */
export class AuthorizationError extends Error {
  constructor(
    message: string = 'Accès refusé',
    public resource?: string,
    public action?: string
  ) {
    super(message)
    this.name = 'AuthorizationError'
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }

  getUserMessage(): string {
    return 'Vous n\'avez pas les permissions nécessaires pour cette action.'
  }
}

/**
 * Erreur de ressource non trouvée (404)
 */
export class NotFoundError extends Error {
  constructor(
    message: string = 'Ressource non trouvée',
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  getUserMessage(): string {
    if (this.resourceType) {
      return `${this.resourceType} introuvable.`
    }
    return 'La ressource demandée n\'existe pas.'
  }
}

/**
 * Erreur de limite dépassée (rate limit, quota, etc.)
 */
export class RateLimitError extends Error {
  constructor(
    message: string = 'Limite de requêtes dépassée',
    public retryAfter?: number // secondes
  ) {
    super(message)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }

  getUserMessage(): string {
    if (this.retryAfter) {
      const minutes = Math.ceil(this.retryAfter / 60)
      return `Trop de requêtes. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`
    }
    return 'Trop de requêtes. Veuillez patienter avant de réessayer.'
  }
}

/**
 * Erreur serveur (500, 502, 503, etc.)
 */
export class ServerError extends Error {
  constructor(
    message: string = 'Erreur serveur',
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ServerError'
    Object.setPrototypeOf(this, ServerError.prototype)
  }

  get isRetryable(): boolean {
    // Erreurs 5xx sont généralement retryables
    return this.statusCode >= 500 && this.statusCode < 600
  }

  getUserMessage(): string {
    return 'Une erreur est survenue côté serveur. Veuillez réessayer plus tard.'
  }
}

/**
 * Erreur de timeout
 */
export class TimeoutError extends Error {
  constructor(
    message: string = 'Délai d\'attente dépassé',
    public timeoutMs?: number
  ) {
    super(message)
    this.name = 'TimeoutError'
    Object.setPrototypeOf(this, TimeoutError.prototype)
  }

  getUserMessage(): string {
    return 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.'
  }
}

/**
 * Helper pour convertir une erreur fetch en erreur typée
 */
export function handleFetchError(error: unknown, context?: string): Error {
  if (error instanceof NetworkError || error instanceof ValidationError) {
    return error
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Erreur de connexion réseau', undefined, error)
  }

  if (error instanceof Error) {
    return new Error(`${context ? `[${context}] ` : ''}${error.message}`)
  }

  return new Error(`${context ? `[${context}] ` : ''}Erreur inconnue`)
}

/**
 * Helper pour convertir une réponse HTTP en erreur typée
 */
export async function handleHTTPError(response: Response, context?: string): Promise<Error> {
  const status = response.status
  let message = `Erreur HTTP ${status}`
  
  try {
    const data = await response.json()
    message = data.error || data.message || message
  } catch {
    // Ignore si pas de JSON
  }

  switch (status) {
    case 400:
      return new ValidationError(message || 'Données invalides')
    case 401:
      return new AuthenticationError(message, status, true)
    case 403:
      return new AuthorizationError(message)
    case 404:
      return new NotFoundError(message)
    case 408:
      return new TimeoutError(message)
    case 429:
      const retryAfter = response.headers.get('Retry-After')
      return new RateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined)
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status)
    default:
      if (status >= 500) {
        return new ServerError(message, status)
      }
      if (status >= 400) {
        return new NetworkError(message, status)
      }
      return new Error(`${context ? `[${context}] ` : ''}${message}`)
  }
}

/**
 * Helper pour retry automatique sur erreurs retryables
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delayMs?: number
    retryableErrors?: (error: Error) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    retryableErrors = (error: Error) => {
      if (error instanceof NetworkError || error instanceof ServerError) {
        return error.isRetryable
      }
      if (error instanceof TimeoutError) {
        return true
      }
      return false
    },
  } = options

  let lastError: Error
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erreur inconnue')
      
      if (attempt === maxRetries || !retryableErrors(lastError)) {
        throw lastError
      }

      // Attendre avant de retry (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

