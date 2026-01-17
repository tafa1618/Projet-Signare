/**
 * ADMIN - Table de modération du feed
 * @ai-context Table interactive pour modérer les posts
 */

'use client'

import { useState } from 'react'
import type { ReportedPost } from '@/lib/services/adminFeed'
import { deletePost } from '@/lib/services/adminFeed'
import { Trash2, Eye, AlertTriangle } from 'lucide-react'

interface FeedModerationTableProps {
  posts: ReportedPost[]
}

export function FeedModerationTable({ posts }: FeedModerationTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return

    setDeletingId(postId)
    try {
      await deletePost(postId)
      // En production, rafraîchir la liste
      alert('Post supprimé avec succès')
    } catch (error) {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0A0A0A] border-b border-[#D4AF37]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Signalements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.image_url}
                      alt={post.caption || 'Post'}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-white text-sm line-clamp-2">
                        {post.caption || 'Sans description'}
                      </p>
                      <p className="text-white/50 text-xs mt-1">ID: {post.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    {post.reportCount} signalement(s)
                  </span>
                </td>
                <td className="px-6 py-4 text-white/70 text-sm">
                  <div className="space-y-1">
                    <div>❤️ {post.likes_count}</div>
                    <div>👁️ {post.views_count}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/60 text-sm">
                  {new Date(post.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="Voir le post"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      title="Supprimer le post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

