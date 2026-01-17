/**
 * ADMIN - Page de modération du feed
 * @ai-context Modération des posts pour ADMIN et SUPER_ADMIN
 */

import { getReportedPosts } from '@/lib/services/adminFeed'
import { FeedModerationTable } from '@/components/admin/FeedModerationTable'

export default async function FeedModerationPage() {
  const reportedPosts = await getReportedPosts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Modération du Feed</h1>
        <p className="text-white/60">Gestion des posts signalés et modération du contenu</p>
      </div>

      <FeedModerationTable posts={reportedPosts} />
    </div>
  )
}

