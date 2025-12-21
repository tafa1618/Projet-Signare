/**
 * SIGNARE Database Types - Optimisé pour l'entraînement IA
 * @ai-context Ce fichier définit la structure de données complète pour le ML
 * Chaque interface inclut des métadonnées sémantiques pour faciliter l'apprentissage
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==================== PROFILES ====================
/**
 * Profil utilisateur avec métadonnées ML
 * @ai-context 
 * - role_score: Score comportemental (créateur vs consommateur)
 * - style_preferences: Vecteur de préférences stylistiques
 * - interaction_history: Historique pour le système de recommandation
 */
export interface Profile {
  id: string
  phone_number: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  
  // Géolocalisation pour livraison
  default_latitude: number | null
  default_longitude: number | null
  default_address: string | null
  
  // Métadonnées ML
  role_score: number // 0 (acheteur) à 100 (créateur professionnel)
  style_preferences: Json | null // { traditional: 0.8, modern: 0.6, luxury: 0.9 }
  interaction_history: Json | null // { likes: [], purchases: [], views: [] }
  
  created_at: string
  updated_at: string
}

// ==================== MESURES (Atelier) ====================
/**
 * Mesures corporelles structurées pour le ML
 * @ai-context 
 * - pattern_type: Type de patron pour la classification
 * - fabric_stretch_index: Élasticité du tissu (impact sur les mesures)
 * - complexity_score: Complexité du vêtement (pour estimation du prix/temps)
 */
export interface Mesure {
  id: string
  user_id: string
  client_name: string
  
  // Mesures standards (en cm)
  tour_poitrine: number
  tour_taille: number
  tour_hanches: number
  longueur_bras: number
  longueur_jambe: number
  tour_cou: number | null
  carrure: number | null
  
  // Métadonnées ML
  pattern_type: 'boubou' | 'robe' | 'tailleur' | 'pantalon' | 'kaftan' | 'autre'
  fabric_stretch_index: number // 0 (rigide) à 100 (élastique)
  complexity_score: number // 1 (simple) à 10 (haute couture)
  
  // Historique
  notes: string | null
  created_at: string
  updated_at: string
}

// ==================== POSTS (Flux Social) ====================
/**
 * Posts avec labels sémantiques pour la classification IA
 * @ai-context 
 * - color_palette: Palette de couleurs extraite (pour recherche par couleur)
 * - garment_type: Type de vêtement (pour classification)
 * - complexity: Niveau de complexité (pour estimer le temps de création)
 * - cultural_tags: Tags culturels sénégalais (pour préserver l'identité)
 */
export interface Post {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  price: number | null // en FCFA
  
  // Métadonnées ML - Labels sémantiques
  color_palette: string[] // ['#D4AF37', '#0A0A0A', '#8B4513']
  garment_type: 'boubou' | 'robe' | 'ensemble' | 'accessoire' | 'kaftan' | 'autre'
  complexity: 'simple' | 'moyen' | 'complexe' | 'haute_couture'
  cultural_tags: string[] // ['wolof', 'serere', 'peul', 'diola']
  fabric_type: string | null // 'basin', 'wax', 'dentelle', 'soie'
  
  // Engagement
  likes_count: number
  comments_count: number
  views_count: number
  
  // Disponibilité
  is_available: boolean
  is_commissioned: boolean // Fait sur mesure ou non
  
  created_at: string
  updated_at: string
}

// ==================== LIKES ====================
export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

// ==================== ORDERS (Commandes) ====================
/**
 * Commandes avec workflow de livraison Yango
 * @ai-context 
 * - validation_code: Code à 6 chiffres pour valider la livraison
 * - distance_km: Distance pour calcul automatique du prix
 */
export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  post_id: string
  
  // Prix
  product_price: number // en FCFA
  shipping_price: number // calculé automatiquement
  total_price: number // product_price + shipping_price
  
  // Livraison
  delivery_latitude: number
  delivery_longitude: number
  delivery_address: string
  distance_km: number
  validation_code: string // Code à 6 chiffres
  
  // Statut
  status: 'pending' | 'paid' | 'in_delivery' | 'delivered' | 'cancelled'
  
  created_at: string
  delivered_at: string | null
}

// ==================== EVENTS (Billetterie) ====================
/**
 * Événements culturels avec géolocalisation
 * @ai-context Pour recommandations basées sur la localisation et les préférences
 */
export interface Event {
  id: string
  organizer_id: string
  
  title: string
  description: string
  cover_image_url: string
  
  // Localisation
  venue_name: string
  venue_latitude: number
  venue_longitude: number
  venue_address: string
  
  // Date & Prix
  event_date: string
  ticket_price: number // en FCFA
  tickets_available: number
  
  // Catégorie
  category: 'défilé' | 'exposition' | 'atelier' | 'festival' | 'autre'
  
  created_at: string
}

// ==================== INSPIRATION (Génération IA) ====================
/**
 * Prompts et résultats de génération IA
 * @ai-context Dataset pour fine-tuning des modèles de génération
 */
export interface Inspiration {
  id: string
  user_id: string
  
  // Prompt utilisateur
  prompt_text: string
  style_references: string[] | null // URLs d'images de référence
  
  // Résultat IA
  generated_image_url: string
  model_used: string // 'dall-e-3', 'midjourney', etc.
  generation_params: Json | null // Paramètres utilisés
  
  // Feedback ML
  user_rating: number | null // 1 à 5
  was_commissioned: boolean // Transformé en commande réelle ?
  
  created_at: string
}

// ==================== DATABASE TYPE ====================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      mesures: {
        Row: Mesure
        Insert: Omit<Mesure, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Mesure, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: never
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id' | 'created_at'>>
      }
      inspirations: {
        Row: Inspiration
        Insert: Omit<Inspiration, 'id' | 'created_at'>
        Update: Partial<Omit<Inspiration, 'id' | 'created_at'>>
      }
    }
  }
}

