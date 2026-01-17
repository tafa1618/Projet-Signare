/**
 * ADMIN - Graphique des commandes
 * @ai-context Graphique simple pour visualiser les commandes
 */

'use client'

import { ChartData } from '@/lib/services/adminMetrics'

interface OrdersChartProps {
  data: ChartData
}

export function OrdersChart({ data }: OrdersChartProps) {
  const maxValue = Math.max(...data.values, 1)

  return (
    <div className="space-y-4">
      {/* Chart Bars */}
      <div className="flex items-end gap-2 h-64">
        {data.values.map((value, index) => {
          const height = (value / maxValue) * 100

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end" style={{ height: '200px' }}>
                <div
                  className="w-full bg-gradient-to-t from-[#D4AF37]/80 to-[#D4AF37]/40 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${value} commandes`}
                />
              </div>
              {index % 5 === 0 && (
                <span className="text-white/40 text-xs transform -rotate-45 origin-left whitespace-nowrap">
                  {data.labels[index]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#D4AF37]/20">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#D4AF37] rounded" />
          <span className="text-white/60 text-sm">Commandes par jour</span>
        </div>
      </div>
    </div>
  )
}

