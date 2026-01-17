/**
 * ADMIN - Carte KPI
 * @ai-context Composant pour afficher les métriques clés
 */

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon?: string
}

export function KPICard({ title, value, subtitle, icon }: KPICardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg p-6 hover:border-[#D4AF37]/40 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-white/70 text-sm font-medium">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-[#D4AF37] mb-1">{value}</p>
      {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}
    </div>
  )
}

