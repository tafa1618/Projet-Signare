/**
 * SIGNARE Database Types - ML-Ready v2.0
 * @ai-context Types TypeScript complets pour l'entraînement IA
 * Mis à jour avec toutes les tables d'enrichissement ML
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==================== PROFILES (Enrichi) ====================
export interface Profile {
  id: string
  phone_number: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  
  // Géolocalisation
  default_latitude: number | null
  default_longitude: number | null
  default_address: string | null
  city: string | null
  country: string
  
  // Métadonnées ML
  role_score: number
  style_preferences: Json | null
  interaction_history: Json | null
  
  // Profiling comportemental
  total_posts_created: number
  total_likes_given: number
  total_purchases: number
  total_sales: number
  average_session_duration: number
  last_active_at: string | null
  
  created_at: string
  updated_at: string
}

// ==================== POSTS (Enrichi) ====================
export interface Post {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  price: number | null
  
  // Métadonnées visuelles
  dominant_colors: Json | null
  color_palette: string[]
  image_width: number | null
  image_height: number | null
  aspect_ratio: number | null
  brightness_score: number | null
  contrast_score: number | null
  
  // Classification garment
  garment_type: 'boubou' | 'robe' | 'ensemble' | 'accessoire' | 'kaftan' | 'autre'
  garment_subcategory: string | null
  gender_target: 'homme' | 'femme' | 'mixte' | 'enfant' | null
  age_range: string | null
  
  // Complexité
  complexity: 'simple' | 'moyen' | 'complexe' | 'haute_couture'
  estimated_hours: number | null
  
  // Tissus
  fabric_type: string | null
  fabric_pattern: string | null
  fabric_texture: string | null
  
  // Tags
  cultural_tags: string[]
  style_tags: string[]
  occasion_tags: string[]
  season_tags: string[]
  
  // Détails techniques
  has_embroidery: boolean
  has_beading: boolean
  has_print: boolean
  has_lace: boolean
  
  // Engagement
  likes_count: number
  comments_count: number
  views_count: number
  shares_count: number
  /**
   * Nombre de republications (reposts)
   * @ai-context Signal social de propagation. Utile pour apprendre la viralité et les affinités (user ↔ style ↔ créateur).
   */
  reposts_count: number
  saves_count: number
  
  // Conversion
  is_available: boolean
  is_commissioned: boolean
  inquiries_count: number
  conversion_rate: number | null

  /**
   * Satisfaction client (1-5)
   * @ai-context Label explicite pour entraîner un modèle de ranking qualité (tailleur ↔ style ↔ satisfaction).
   * Renseigné principalement lors d'une publication “client”.
   */
  quality_rating: number | null

  /**
   * Style d'événement (ex: "mariage", "quotidien", "tabaski")
   * @ai-context Conserve le contexte d'usage (occasion) pour recommandations et analytics.
   */
  event_style: string | null
  
  created_at: string
  updated_at: string
}

// ==================== POST_ANNOTATIONS ====================
export interface PostAnnotation {
  id: string
  post_id: string
  annotator_id: string | null
  
  // Annotations vérifiées
  verified_garment_type: string | null
  verified_fabric_type: string | null
  verified_complexity: string | null
  verified_colors: string[] | null
  
  // Détection d'objets
  object_detections: Json | null
  
  // Qualité
  image_quality_score: number | null
  cultural_authenticity_score: number | null
  
  notes: string | null
  is_approved: boolean
  
  created_at: string
}

// ==================== USER_INTERACTIONS ====================
export interface UserInteraction {
  id: string
  user_id: string
  post_id: string | null
  
  interaction_type: 'view' | 'like' | 'unlike' | 'comment' | 'share' | 'save' | 'unsave' | 'click' | 'zoom' | 'inquiry' | 'purchase'
  
  // Contexte
  session_id: string | null
  duration_seconds: number | null
  scroll_depth: number | null
  came_from: string | null
  
  // Device
  device_type: string | null
  user_agent: string | null
  
  created_at: string
}

// ==================== REPOSTS ====================
export interface Repost {
  id: string
  user_id: string
  post_id: string
  comment: string | null
  created_at: string
}

// ==================== SEARCH_QUERIES ====================
export interface SearchQuery {
  id: string
  user_id: string | null
  
  query_text: string
  query_tokens: string[] | null
  filters: Json | null
  
  results_count: number | null
  clicked_post_ids: string[] | null
  no_results: boolean
  
  session_id: string | null
  
  created_at: string
}

// ==================== FABRIC_LIBRARY ====================
export interface FabricLibrary {
  id: string
  name: string
  name_wolof: string | null
  category: string
  
  // Caractéristiques physiques
  stretch_index: number | null
  weight_gsm: number | null
  opacity: 'transparent' | 'semi-transparent' | 'opaque' | null
  texture: string | null
  
  // Propriétés
  is_traditional: boolean
  is_premium: boolean
  care_instructions: string | null
  
  // Prix
  price_per_meter_min: number | null
  price_per_meter_max: number | null
  
  // Visuels
  sample_image_url: string | null
  color_variants: string[] | null
  
  // Usage
  recommended_for: string[] | null
  season_tags: string[] | null
  
  created_at: string
}

// ==================== PATTERN_LIBRARY ====================
export interface PatternLibrary {
  id: string
  name: string
  name_wolof: string | null
  garment_type: string
  
  // Difficulté
  complexity_score: number
  skill_level: 'débutant' | 'intermédiaire' | 'avancé' | 'expert'
  
  // Mesures
  required_measurements: string[] | null
  
  // Estimations
  estimated_hours: number | null
  fabric_meters_needed: number | null
  
  // Visuels
  pattern_diagram_url: string | null
  finished_example_urls: string[] | null
  
  // Instructions
  instructions_text: string | null
  video_tutorial_url: string | null
  
  // ML
  popularity_score: number
  success_rate: number | null
  
  created_at: string
}

// ==================== MESURES (Enrichi) ====================
export interface Mesure {
  id: string
  user_id: string
  client_name: string
  
  // Mesures
  tour_poitrine: number
  tour_taille: number
  tour_hanches: number
  longueur_bras: number
  longueur_jambe: number
  tour_cou: number | null
  carrure: number | null
  hauteur_poitrine: number | null
  longueur_dos: number | null
  tour_cuisse: number | null
  
  // Morphologie
  body_type: string | null
  height_cm: number | null
  weight_kg: number | null
  
  // ML
  pattern_type: 'boubou' | 'robe' | 'tailleur' | 'pantalon' | 'kaftan' | 'autre'
  fabric_stretch_index: number
  complexity_score: number
  
  // Préférences
  fit_preference: string | null
  adjustments_notes: string | null
  
  notes: string | null
  photo_references: string[] | null
  
  created_at: string
  updated_at: string
}

// ==================== ORDERS (Enrichi) ====================
export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  post_id: string
  mesure_id: string | null
  
  // Prix
  product_price: number
  shipping_price: number
  total_price: number
  
  // Livraison
  delivery_latitude: number
  delivery_longitude: number
  delivery_address: string
  distance_km: number
  validation_code: string
  
  // Timing
  estimated_delivery_date: string | null
  actual_delivery_date: string | null
  preparation_time_hours: number | null
  
  // Statut
  status: 'pending' | 'paid' | 'in_preparation' | 'in_delivery' | 'delivered' | 'cancelled'
  
  // Feedback
  buyer_rating: number | null
  seller_rating: number | null
  quality_rating: number | null
  delivery_rating: number | null
  feedback_text: string | null
  
  created_at: string
  delivered_at: string | null
}

// ==================== INSPIRATIONS (Enrichi) ====================
export interface Inspiration {
  id: string
  user_id: string
  
  // Prompt
  prompt_text: string
  prompt_language: string
  style_references: string[] | null
  
  // Génération
  model_used: string
  model_version: string | null
  generation_params: Json | null
  seed: number | null
  
  // Résultat
  generated_image_url: string
  generation_time_seconds: number | null
  
  // Analyse
  detected_colors: string[] | null
  detected_style_tags: string[] | null
  cultural_accuracy_score: number | null
  
  // Feedback
  user_rating: number | null
  was_commissioned: boolean
  was_shared: boolean
  edit_count: number
  
  // Amélioration
  compared_to_inspiration_id: string | null
  improvement_notes: string | null
  
  created_at: string
}

// ==================== ML_TRAINING_DATASETS ====================
export interface MLTrainingDataset {
  id: string
  name: string
  description: string | null
  dataset_type: 'classification' | 'detection' | 'segmentation' | 'generation'
  
  // Contenu
  table_source: string
  query_used: string | null
  total_samples: number | null
  
  // Métadonnées
  date_range_start: string | null
  date_range_end: string | null
  labels_included: string[] | null
  
  // Qualité
  annotation_status: 'raw' | 'partially_annotated' | 'fully_annotated' | null
  quality_score: number | null
  
  // Export
  export_format: string | null
  export_url: string | null
  file_size_mb: number | null
  
  // Utilisation
  used_for_model_id: string | null
  training_date: string | null
  model_performance: Json | null
  
  created_at: string
}

// ==================== LIKES ====================
export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

// ==================== EVENTS ====================
export interface Event {
  id: string
  organizer_id: string
  
  title: string
  description: string
  cover_image_url: string
  
  venue_name: string
  venue_latitude: number
  venue_longitude: number
  venue_address: string
  
  event_date: string
  ticket_price: number
  tickets_available: number
  
  category: 'défilé' | 'exposition' | 'atelier' | 'festival' | 'autre'
  
  created_at: string
}

// ==================== DATABASE TYPE ====================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'total_posts_created' | 'total_likes_given' | 'total_purchases' | 'total_sales' | 'average_session_duration'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count' | 'shares_count' | 'reposts_count' | 'saves_count'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      reposts: {
        Row: Repost
        Insert: Omit<Repost, 'id' | 'created_at'>
        Update: never
      }
      post_annotations: {
        Row: PostAnnotation
        Insert: Omit<PostAnnotation, 'id' | 'created_at'>
        Update: Partial<Omit<PostAnnotation, 'id' | 'created_at'>>
      }
      user_interactions: {
        Row: UserInteraction
        Insert: Omit<UserInteraction, 'id' | 'created_at'>
        Update: never
      }
      search_queries: {
        Row: SearchQuery
        Insert: Omit<SearchQuery, 'id' | 'created_at'>
        Update: never
      }
      fabric_library: {
        Row: FabricLibrary
        Insert: Omit<FabricLibrary, 'id' | 'created_at'>
        Update: Partial<Omit<FabricLibrary, 'id' | 'created_at'>>
      }
      pattern_library: {
        Row: PatternLibrary
        Insert: Omit<PatternLibrary, 'id' | 'created_at'>
        Update: Partial<Omit<PatternLibrary, 'id' | 'created_at'>>
      }
      mesures: {
        Row: Mesure
        Insert: Omit<Mesure, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Mesure, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      inspirations: {
        Row: Inspiration
        Insert: Omit<Inspiration, 'id' | 'created_at'>
        Update: Partial<Omit<Inspiration, 'id' | 'created_at'>>
      }
      ml_training_datasets: {
        Row: MLTrainingDataset
        Insert: Omit<MLTrainingDataset, 'id' | 'created_at'>
        Update: Partial<Omit<MLTrainingDataset, 'id' | 'created_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: never
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id' | 'created_at'>>
      }
    }
  }
}
