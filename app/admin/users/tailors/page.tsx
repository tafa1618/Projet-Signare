/**
 * ADMIN - Page de gestion des tailleurs
 * @ai-context Gestion des tailleurs pour RESPONSABLE_COMMERCIAL, BUSINESS_DEVELOPER, SUPER_ADMIN
 */

import { getTailors } from '@/lib/services/adminUsers'
import { TailorsTable } from '@/components/admin/TailorsTable'

export default async function TailorsPage() {
  const tailors = await getTailors()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Gestion des Tailleurs</h1>
        <p className="text-white/60">Liste et gestion des tailleurs de la plateforme</p>
      </div>

      <TailorsTable tailors={tailors} />
    </div>
  )
}

