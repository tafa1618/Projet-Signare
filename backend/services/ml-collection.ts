/**
 * BACKEND - Service de Collecte de Données ML
 * @ai-context Services pour tracker et enrichir les données d'entraînement
 */

import { supabase } from '@/backend/lib/supabase'
import type { UserInteraction, PostAnnotation, SearchQuery } from '@/shared/types/database.types'

/**
 * Service de tracking des interactions utilisateur
 * @ai-context Collecte détaillée pour système de recommandation
 */
export class InteractionTracker {
  /**
   * Enregistrer une interaction
   */
  static async track(data: {
    userId: string
    postId?: string
    interactionType: UserInteraction['interaction_type']
    sessionId: string
    durationSeconds?: number
    scrollDepth?: number
    cameFrom?: string
    deviceType?: string
  }): Promise<void> {
    try {
      await supabase.from('user_interactions').insert({
        user_id: data.userId,
        post_id: data.postId || null,
        interaction_type: data.interactionType,
        session_id: data.sessionId,
        duration_seconds: data.durationSeconds || null,
        scroll_depth: data.scrollDepth || null,
        came_from: data.cameFrom || null,
        device_type: data.deviceType || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
    } catch (error) {
      console.error('Erreur tracking interaction:', error)
    }
  }

  /**
   * Tracker une vue de post
   */
  static async trackView(
    userId: string,
    postId: string,
    sessionId: string,
    context: {
      cameFrom?: string
      deviceType?: string
    } = {}
  ): Promise<void> {
    await this.track({
      userId,
      postId,
      interactionType: 'view',
      sessionId,
      ...context,
    })

    // Incrémenter le compteur de vues
    await supabase.rpc('increment_post_views', { post_id: postId })
  }

  /**
   * Tracker un like
   */
  static async trackLike(userId: string, postId: string, sessionId: string): Promise<void> {
    await this.track({
      userId,
      postId,
      interactionType: 'like',
      sessionId,
    })
  }

  /**
   * Tracker une sauvegarde (favori)
   */
  static async trackSave(userId: string, postId: string, sessionId: string): Promise<void> {
    await this.track({
      userId,
      postId,
      interactionType: 'save',
      sessionId,
    })

    // Incrémenter saves_count
    const { data: post } = await supabase
      .from('posts')
      .select('saves_count')
      .eq('id', postId)
      .single()

    if (post) {
      await supabase
        .from('posts')
        .update({ saves_count: post.saves_count + 1 })
        .eq('id', postId)
    }
  }

  /**
   * Tracker une demande d'information
   */
  static async trackInquiry(userId: string, postId: string, sessionId: string): Promise<void> {
    await this.track({
      userId,
      postId,
      interactionType: 'inquiry',
      sessionId,
    })

    // Incrémenter inquiries_count
    const { data: post } = await supabase
      .from('posts')
      .select('inquiries_count')
      .eq('id', postId)
      .single()

    if (post) {
      await supabase
        .from('posts')
        .update({ inquiries_count: post.inquiries_count + 1 })
        .eq('id', postId)
    }
  }

  /**
   * Tracker un achat (conversion)
   */
  static async trackPurchase(userId: string, postId: string, sessionId: string): Promise<void> {
    await this.track({
      userId,
      postId,
      interactionType: 'purchase',
      sessionId,
    })

    // Mettre à jour le taux de conversion
    await this.updateConversionRate(postId)
  }

  /**
   * Calculer et mettre à jour le taux de conversion
   */
  private static async updateConversionRate(postId: string): Promise<void> {
    const { count: views } = await supabase
      .from('user_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('interaction_type', 'view')

    const { count: purchases } = await supabase
      .from('user_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('interaction_type', 'purchase')

    if (views && views > 0) {
      const conversionRate = (purchases || 0) / views
      await supabase
        .from('posts')
        .update({ conversion_rate: conversionRate })
        .eq('id', postId)
    }
  }
}

/**
 * Service de tracking des recherches
 * @ai-context Pour améliorer le moteur de recherche et comprendre les intentions
 */
export class SearchTracker {
  /**
   * Enregistrer une recherche
   */
  static async trackSearch(data: {
    userId?: string
    queryText: string
    filters?: Record<string, any>
    resultsCount: number
    sessionId: string
  }): Promise<string> {
    const tokens = this.extractTokens(data.queryText)

    const { data: searchQuery, error } = await supabase
      .from('search_queries')
      .insert({
        user_id: data.userId || null,
        query_text: data.queryText,
        query_tokens: tokens,
        filters: data.filters || null,
        results_count: data.resultsCount,
        no_results: data.resultsCount === 0,
        session_id: data.sessionId,
      })
      .select()
      .single()

    if (error) throw error
    return searchQuery.id
  }

  /**
   * Enregistrer les clics sur les résultats
   */
  static async trackSearchClick(searchQueryId: string, postId: string): Promise<void> {
    const { data: query } = await supabase
      .from('search_queries')
      .select('clicked_post_ids')
      .eq('id', searchQueryId)
      .single()

    if (query) {
      const clickedIds = query.clicked_post_ids || []
      await supabase
        .from('search_queries')
        .update({
          clicked_post_ids: [...clickedIds, postId],
        })
        .eq('id', searchQueryId)
    }
  }

  /**
   * Extraire les tokens d'une requête
   */
  private static extractTokens(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2)
  }
}

/**
 * Service d'annotation de posts
 * @ai-context Pour créer des données supervisées de qualité
 */
export class AnnotationService {
  /**
   * Créer une annotation
   */
  static async annotate(data: {
    postId: string
    annotatorId: string
    verifiedGarmentType?: string
    verifiedFabricType?: string
    verifiedComplexity?: string
    verifiedColors?: string[]
    objectDetections?: any[]
    imageQualityScore?: number
    culturalAuthenticityScore?: number
    notes?: string
  }): Promise<PostAnnotation> {
    const { data: annotation, error } = await supabase
      .from('post_annotations')
      .insert({
        post_id: data.postId,
        annotator_id: data.annotatorId,
        verified_garment_type: data.verifiedGarmentType || null,
        verified_fabric_type: data.verifiedFabricType || null,
        verified_complexity: data.verifiedComplexity || null,
        verified_colors: data.verifiedColors || null,
        object_detections: data.objectDetections || null,
        image_quality_score: data.imageQualityScore || null,
        cultural_authenticity_score: data.culturalAuthenticityScore || null,
        notes: data.notes || null,
        is_approved: false,
      })
      .select()
      .single()

    if (error) throw error
    return annotation
  }

  /**
   * Approuver une annotation
   */
  static async approve(annotationId: string): Promise<void> {
    await supabase
      .from('post_annotations')
      .update({ is_approved: true })
      .eq('id', annotationId)
  }

  /**
   * Récupérer les posts non annotés
   */
  static async getUnannotatedPosts(limit = 20): Promise<any[]> {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, image_url, caption, garment_type, fabric_type')
      .not('id', 'in', `(SELECT post_id FROM post_annotations WHERE is_approved = true)`)
      .order('created_at', { ascending: false })
      .limit(limit)

    return posts || []
  }
}

/**
 * Service de mise à jour du role_score
 * @ai-context Score comportemental pour segmentation
 */
export class RoleScoreService {
  /**
   * Mettre à jour le score après une action
   */
  static async updateScore(
    userId: string,
    action: 'post_created' | 'post_sold' | 'item_purchased' | 'item_liked'
  ): Promise<void> {
    const increments = {
      post_created: 5,
      post_sold: 3,
      item_purchased: 1,
      item_liked: 0.5,
    }

    const increment = increments[action]

    const { data: profile } = await supabase
      .from('profiles')
      .select('role_score')
      .eq('id', userId)
      .single()

    if (profile) {
      const newScore = Math.min(100, Math.max(0, profile.role_score + increment))
      await supabase
        .from('profiles')
        .update({ role_score: newScore })
        .eq('id', userId)
    }
  }
}

/**
 * Service d'extraction de métadonnées visuelles
 * @ai-context Pour enrichir automatiquement les posts avec des features ML
 */
export class VisualMetadataExtractor {
  /**
   * Extraire les couleurs dominantes (placeholder - à implémenter avec lib externe)
   */
  static async extractDominantColors(imageUrl: string): Promise<string[]> {
    // TODO: Utiliser une lib comme node-vibrant ou sharp
    // Pour l'instant, retourner un placeholder
    return ['#D4AF37', '#0A0A0A']
  }

  /**
   * Calculer les dimensions et aspect ratio
   */
  static async analyzeImageDimensions(imageUrl: string): Promise<{
    width: number
    height: number
    aspectRatio: number
  }> {
    // TODO: Utiliser sharp ou image-size
    return {
      width: 1080,
      height: 1350,
      aspectRatio: 0.8,
    }
  }

  /**
   * Calculer brightness et contrast (placeholder)
   */
  static async analyzeImageQuality(imageUrl: string): Promise<{
    brightness: number
    contrast: number
  }> {
    // TODO: Utiliser sharp ou jimp
    return {
      brightness: 0.7,
      contrast: 0.6,
    }
  }

  /**
   * Pipeline complet d'enrichissement
   */
  static async enrichPost(postId: string, imageUrl: string): Promise<void> {
    const [colors, dimensions, quality] = await Promise.all([
      this.extractDominantColors(imageUrl),
      this.analyzeImageDimensions(imageUrl),
      this.analyzeImageQuality(imageUrl),
    ])

    await supabase
      .from('posts')
      .update({
        color_palette: colors,
        image_width: dimensions.width,
        image_height: dimensions.height,
        aspect_ratio: dimensions.aspectRatio,
        brightness_score: quality.brightness,
        contrast_score: quality.contrast,
      })
      .eq('id', postId)
  }
}

