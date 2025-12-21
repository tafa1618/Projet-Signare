/**
 * BACKEND - API Configuration
 * @ai-context Configuration des routes API Next.js pour le backend
 */

/**
 * Configuration des headers CORS pour les API routes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Rate limiting configuration
 * @ai-context Protection contre les abus
 */
export const rateLimitConfig = {
  maxRequests: 100, // Requêtes par fenêtre
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Configuration des uploads
 */
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  storageBucket: 'posts-images',
}

/**
 * Configuration des webhooks
 */
export const webhookConfig = {
  supabaseWebhookSecret: process.env.SUPABASE_WEBHOOK_SECRET,
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
}

