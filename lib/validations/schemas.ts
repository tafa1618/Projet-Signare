/**
 * Schémas de validation Zod pour toutes les entrées API
 * @security Ces validations sont OBLIGATOIRES côté backend pour prévenir les injections
 */

import { z } from 'zod'

/**
 * Schéma pour le calcul des prix de livraison
 * @security Validation stricte des coordonnées GPS
 */
export const ShippingCalculateSchema = z.object({
  userLat: z.number().min(-90).max(90, 'Latitude invalide'),
  userLon: z.number().min(-180).max(180, 'Longitude invalide'),
  destLat: z.number().min(-90).max(90, 'Latitude invalide'),
  destLon: z.number().min(-180).max(180, 'Longitude invalide'),
})

export type ShippingCalculateInput = z.infer<typeof ShippingCalculateSchema>

/**
 * Schéma pour la publication d'un produit
 * @security Validation stricte des données produits
 */
export const ProductPublishSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(200, 'Titre trop long').trim(),
  description: z.string().max(2000, 'Description trop longue').trim().nullable().optional(),
  price: z.number().positive('Prix doit être positif').max(10000000, 'Prix trop élevé'),
  category: z.enum(['boubou', 'kaftan', 'robe', 'ensemble', 'autre']).nullable().optional(),
  tags: z.array(z.string()).optional(),
  sellerType: z.enum(['tailleur', 'consumer']).optional(),
  // Métadonnées optionnelles pour améliorer les recommandations IA
  metadata: z.object({
    fabric: z.enum(['wax', 'getzner', 'bazin', 'soie', 'coton']).nullable().optional(),
    event: z.enum(['tabaski', 'mariage', 'baptême', 'travail', 'sortie']).nullable().optional(),
    gender: z.enum(['homme', 'femme', 'garçon', 'fille']).nullable().optional(),
    color: z.enum(['blanc', 'beige', 'bleu', 'vert', 'marron', 'noir', 'multicolore']).nullable().optional(),
  }).optional(),
  mediaFiles: z.number().optional(), // Nombre de fichiers médias
})

export type ProductPublishInput = z.infer<typeof ProductPublishSchema>

/**
 * Schéma pour l'inspiration IA
 * @security Validation stricte des tags pour prévenir les injections
 */
export const InspirationPayloadSchema = z.object({
  tissu: z.enum(['wax', 'getzner', 'bazin', 'soie', 'coton'], {
    errorMap: () => ({ message: 'Type de tissu invalide' })
  }),
  evenement: z.enum(['tabaski', 'mariage', 'baptême', 'travail', 'sortie'], {
    errorMap: () => ({ message: 'Événement invalide' })
  }),
  genre_age: z.enum(['homme adulte', 'femme adulte', 'garçon', 'fille'], {
    errorMap: () => ({ message: 'Genre/âge invalide' })
  }),
  couleur: z.enum(['blanc', 'beige', 'bleu', 'vert', 'marron', 'noir', 'multicolore'], {
    errorMap: () => ({ message: 'Couleur invalide' })
  }),
})

export type InspirationPayloadInput = z.infer<typeof InspirationPayloadSchema>

/**
 * Schéma pour le try-on IA
 * @security Validation stricte des chemins d'images
 */
export const TryOnPayloadSchema = z.object({
  user_image_path: z.string().min(1, 'Chemin image utilisateur requis'),
  garment_image_path: z.string().min(1, 'Chemin image vêtement requis'),
  job_id: z.string().uuid('Job ID invalide'),
})

export type TryOnPayloadInput = z.infer<typeof TryOnPayloadSchema>

/**
 * Schéma pour la génération de code de validation
 * @security Validation de l'ID de commande
 */
export const ValidationCodeRequestSchema = z.object({
  orderId: z.string().uuid('ID de commande invalide'),
})

export type ValidationCodeRequestInput = z.infer<typeof ValidationCodeRequestSchema>

/**
 * Constantes de validation pour upload d'images
 */
export const IMAGE_UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as const,
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1600,
} as const

/**
 * Validation d'un fichier image uploadé (FormData)
 * @security Validation stricte du type, taille et format
 */
export function validateImageFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Aucun fichier fourni' }
  }

  // Validation du type MIME
  if (!IMAGE_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés : ${IMAGE_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  // Validation de la taille
  if (file.size > IMAGE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale : ${IMAGE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Validation de la taille minimale (éviter fichiers vides)
  if (file.size === 0) {
    return { valid: false, error: 'Le fichier est vide' }
  }

  return { valid: true }
}

/**
 * Schéma pour la validation de requêtes génériques
 */
export const UUIDParamSchema = z.object({
  id: z.string().uuid('ID invalide'),
})

export type UUIDParam = z.infer<typeof UUIDParamSchema>

/**
 * Schéma pour les paramètres de route avec orderId
 */
export const OrderIdParamSchema = z.object({
  orderId: z.string().uuid('ID de commande invalide'),
})

export type OrderIdParam = z.infer<typeof OrderIdParamSchema>

/**
 * Schéma pour ajouter/modifier un item au panier
 * @security Validation stricte des données produits
 * @note productId doit être un UUID (string) - La conversion number→UUID se fait côté frontend
 */
export const CartItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide (UUID attendu)'),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long').trim(),
  image: z.string().url('URL image invalide'),
  price: z.number().positive('Prix doit être positif').max(10000000, 'Prix trop élevé'),
  currency: z.enum(['FCFA', 'EUR', 'USD'], {
    errorMap: () => ({ message: 'Devise invalide' })
  }).default('FCFA'),
  quantity: z.number().int('Quantité doit être un entier').positive('Quantité doit être positive').default(1),
  seller: z.object({
    name: z.string().min(1).max(100),
    avatar: z.string().url().optional(),
  }).optional(),
})

export type CartItemInput = z.infer<typeof CartItemSchema>

/**
 * Schéma pour mettre à jour la quantité d'un item
 */
export const UpdateCartQuantitySchema = z.object({
  itemId: z.string().uuid('ID item invalide'),
  quantity: z.number().int('Quantité doit être un entier').positive('Quantité doit être positive'),
})

export type UpdateCartQuantityInput = z.infer<typeof UpdateCartQuantitySchema>

