/**
 * SERVICE PARTAGÉ - Feed
 * @ai-context Service client-side pour récupérer le feed depuis Supabase
 * Utilisable par web (Next.js) et mobile (React Native)
 * 
 * IMPORTANT : Ce service garantit que web et mobile ont le même feed en production
 */

import type { Post as SupabasePost, Profile, Repost } from '../types/database.types'

// Type unifié pour le frontend (web + mobile)
export interface FeedPost {
  id: string
  type: 'tailor' | 'client'
  user: {
    name: string
    avatar: string
    isVerified: boolean
    role: string
    specialty?: string
  }
  image: string
  caption: string
  price?: string
  likes: number
  comments: number
  reposts?: number
  isLiked: boolean
  isSaved: boolean
  isReposted?: boolean
  repostOfId?: string | null
  repostedByMe?: boolean
  taggedTailor?: {
    name: string
    id: string
  }
  garment_type: string
  fabric_type?: string
  complexity_score?: number
  quality_rating?: number
  quote_comment?: string | null
  quote_media?: string | null
}

/**
 * Transforme un Post Supabase en FeedPost pour le frontend
 */
function transformPostToFeedPost(
  post: SupabasePost,
  profile: Profile | null,
  userInteractions: {
    liked: boolean
    saved: boolean
    reposted: boolean
  } = { liked: false, saved: false, reposted: false }
): FeedPost {
  // Déterminer le type (tailor ou client) basé sur le role_score
  const type: 'tailor' | 'client' = (profile?.role_score ?? 50) >= 70 ? 'tailor' : 'client'

  return {
    id: post.id,
    type,
    user: {
      name: profile?.display_name || 'Utilisateur',
      avatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      isVerified: (profile?.role_score ?? 0) >= 80,
      role: type === 'tailor' ? 'Maître Tailleur' : 'Client SIGNARE',
      specialty: type === 'tailor' ? profile?.bio || undefined : undefined,
    },
    image: post.image_url,
    caption: post.caption || '',
    price: post.price ? `${post.price.toLocaleString('fr-FR')} FCFA` : undefined,
    likes: post.likes_count,
    comments: post.comments_count,
    reposts: post.reposts_count,
    isLiked: userInteractions.liked,
    isSaved: userInteractions.saved,
    isReposted: userInteractions.reposted,
    garment_type: post.garment_type,
    fabric_type: post.fabric_type || undefined,
    complexity_score: post.complexity === 'simple' ? 2 : post.complexity === 'moyen' ? 3 : post.complexity === 'complexe' ? 4 : 5,
    quality_rating: post.quality_rating || undefined,
  }
}

/**
 * Récupère le feed depuis Supabase
 * @param supabaseClient - Client Supabase (web ou mobile)
 * @param userId - ID de l'utilisateur connecté (optionnel)
 * @param limit - Nombre de posts à récupérer
 */
export async function getFeed(
  supabaseClient: any, // Type SupabaseClient (évite dépendance circulaire)
  userId?: string,
  limit = 20
): Promise<FeedPost[]> {
  try {
    // 1. Récupérer les posts avec leurs profils
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url,
          bio,
          role_score
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (postsError) throw postsError

    // 2. Récupérer les reposts si nécessaire
    const { data: reposts } = userId
      ? await supabaseClient
          .from('reposts')
          .select('*')
          .eq('user_id', userId)
      : { data: [] }

    // 3. Récupérer les interactions utilisateur (likes, saves)
    const { data: userLikes } = userId
      ? await supabaseClient
          .from('user_interactions')
          .select('post_id')
          .eq('user_id', userId)
          .eq('interaction_type', 'like')
      : { data: [] }

    const { data: userSaves } = userId
      ? await supabaseClient
          .from('user_interactions')
          .select('post_id')
          .eq('user_id', userId)
          .eq('interaction_type', 'save')
      : { data: [] }

    const likedPostIds = new Set(userLikes?.map((i: any) => i.post_id) || [])
    const savedPostIds = new Set(userSaves?.map((i: any) => i.post_id) || [])
    const repostedPostIds = new Set(reposts?.map((r: any) => r.post_id) || [])

    // 4. Transformer les posts
    const feedPosts: FeedPost[] = posts.map((post: any) => {
      const profile = post.profiles
      const userInteractions = {
        liked: likedPostIds.has(post.id),
        saved: savedPostIds.has(post.id),
        reposted: repostedPostIds.has(post.id),
      }
      return transformPostToFeedPost(post, profile, userInteractions)
    })

    // 5. Récupérer et ajouter les reposts comme posts séparés
    if (reposts && reposts.length > 0) {
      const repostPostIds = reposts.map((r: Repost) => r.post_id)
      const { data: repostedPosts } = await supabaseClient
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            bio,
            role_score
          )
        `)
        .in('id', repostPostIds)

      if (repostedPosts) {
        const repostFeedPosts = repostedPosts.map((post: any) => {
          const repost = reposts.find((r: Repost) => r.post_id === post.id)
          const profile = post.profiles
          const reposterProfile = posts.find((p: any) => p.user_id === repost?.user_id)?.profiles

          return {
            ...transformPostToFeedPost(post, profile, {
              liked: likedPostIds.has(post.id),
              saved: savedPostIds.has(post.id),
              reposted: true,
            }),
            repostOfId: post.id,
            repostedByMe: repost?.user_id === userId,
            quote_comment: repost?.comment || null,
            quote_media: null, // TODO: récupérer depuis reposts si stocké
            user: {
              name: reposterProfile?.display_name || 'Utilisateur',
              avatar: reposterProfile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              isVerified: (reposterProfile?.role_score ?? 0) >= 80,
              role: 'Repost',
            },
          } as FeedPost
        })

        // Mélanger reposts et posts originaux par date
        feedPosts.push(...repostFeedPosts)
        feedPosts.sort((a, b) => {
          // Trier par date de création (les reposts plus récents en premier)
          return new Date(b.id).getTime() - new Date(a.id).getTime()
        })
      }
    }

    return feedPosts
  } catch (error) {
    console.error('[FeedService] Erreur lors de la récupération du feed:', error)
    return []
  }
}

/**
 * Like/Unlike un post
 */
export async function toggleLike(
  supabaseClient: any,
  postId: string,
  userId: string,
  isLiked: boolean
): Promise<boolean> {
  try {
    if (isLiked) {
      // Unlike : supprimer l'interaction
      await supabaseClient
        .from('user_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('interaction_type', 'like')

      // Décrémenter le compteur
      const { data: post } = await supabaseClient
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      if (post) {
        await supabaseClient
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId)
      }
    } else {
      // Like : ajouter l'interaction
      await supabaseClient
        .from('user_interactions')
        .insert({
          user_id: userId,
          post_id: postId,
          interaction_type: 'like',
          device_type: typeof window !== 'undefined' ? 'web' : 'mobile',
        })

      // Incrémenter le compteur
      const { data: post } = await supabaseClient
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      if (post) {
        await supabaseClient
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId)
      }
    }

    return !isLiked
  } catch (error) {
    console.error('[FeedService] Erreur lors du like:', error)
    return isLiked
  }
}

/**
 * Save/Unsave un post
 */
export async function toggleSave(
  supabaseClient: any,
  postId: string,
  userId: string,
  isSaved: boolean
): Promise<boolean> {
  try {
    if (isSaved) {
      await supabaseClient
        .from('user_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('interaction_type', 'save')
    } else {
      await supabaseClient
        .from('user_interactions')
        .insert({
          user_id: userId,
          post_id: postId,
          interaction_type: 'save',
          device_type: typeof window !== 'undefined' ? 'web' : 'mobile',
        })
    }

    return !isSaved
  } catch (error) {
    console.error('[FeedService] Erreur lors du save:', error)
    return isSaved
  }
}

/**
 * Repost un post
 */
export async function repostPost(
  supabaseClient: any,
  postId: string,
  userId: string,
  comment?: string
): Promise<boolean> {
  try {
    // Créer le repost
    await supabaseClient
      .from('reposts')
      .insert({
        user_id: userId,
        post_id: postId,
        comment: comment || null,
      })

    // Incrémenter le compteur
    const { data: post } = await supabaseClient
      .from('posts')
      .select('reposts_count')
      .eq('id', postId)
      .single()

    if (post) {
      await supabaseClient
        .from('posts')
        .update({ reposts_count: (post.reposts_count || 0) + 1 })
        .eq('id', postId)
    }

    return true
  } catch (error) {
    console.error('[FeedService] Erreur lors du repost:', error)
    return false
  }
}

