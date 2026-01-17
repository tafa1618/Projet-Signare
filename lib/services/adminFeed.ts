/**
 * ADMIN - Service de modération du feed (mocké)
 * @ai-context Modération des posts pour ADMIN et SUPER_ADMIN
 */

import type { Post } from '@/shared/types/database.types'

export interface ReportedPost extends Post {
  reportCount: number
  reports: Array<{
    id: string
    reason: string
    reportedBy: string
    reportedAt: string
  }>
}

/**
 * Récupérer les posts signalés
 */
export async function getReportedPosts(): Promise<ReportedPost[]> {
  await new Promise(resolve => setTimeout(resolve, 400))

  // Mock data
  const mockPosts: ReportedPost[] = [
    {
      id: 'post-1',
      user_id: 'user-1',
      image_url: 'https://via.placeholder.com/800x1000',
      caption: 'Post signalé pour contenu inapproprié',
      price: null,
      dominant_colors: null,
      color_palette: [],
      image_width: null,
      image_height: null,
      aspect_ratio: null,
      brightness_score: null,
      contrast_score: null,
      garment_type: 'boubou',
      garment_subcategory: null,
      gender_target: 'femme',
      age_range: null,
      complexity: 'moyen',
      estimated_hours: null,
      fabric_type: null,
      fabric_pattern: null,
      fabric_texture: null,
      cultural_tags: [],
      style_tags: [],
      occasion_tags: [],
      season_tags: [],
      has_embroidery: false,
      has_beading: false,
      has_print: false,
      has_lace: false,
      likes_count: 45,
      comments_count: 12,
      views_count: 234,
      shares_count: 8,
      reposts_count: 3,
      saves_count: 15,
      is_available: true,
      is_commissioned: false,
      inquiries_count: 5,
      conversion_rate: null,
      quality_rating: null,
      event_style: null,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z',
      reportCount: 3,
      reports: [
        {
          id: 'report-1',
          reason: 'Contenu inapproprié',
          reportedBy: 'user-2',
          reportedAt: '2026-01-12T14:00:00Z',
        },
      ],
    },
  ]

  return mockPosts
}

/**
 * Supprimer un post
 */
export async function deletePost(postId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  console.log(`Deleting post: ${postId}`)
}
