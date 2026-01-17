/**
 * ADMIN - Table des tailleurs
 * @ai-context Table interactive pour gérer les tailleurs
 */

'use client'

import { useState } from 'react'
import type { Tailor } from '@/lib/services/adminUsers'
import { CheckCircle2, XCircle, Clock, MoreVertical } from 'lucide-react'

interface TailorsTableProps {
  tailors: Tailor[]
}

export function TailorsTable({ tailors }: TailorsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredTailors =
    selectedStatus === 'all'
      ? tailors
      : tailors.filter(t => t.status === selectedStatus)

  const getStatusBadge = (status: Tailor['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            <CheckCircle2 className="w-3 h-3" />
            Actif
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
            <XCircle className="w-3 h-3" />
            Suspendu
          </span>
        )
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-[#D4AF37]/20 flex items-center gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendus</option>
        </select>
        <span className="text-white/60 text-sm">
          {filteredTailors.length} tailleur(s)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0A0A0A] border-b border-[#D4AF37]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Ville
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Commandes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Revenus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {filteredTailors.map((tailor) => (
              <tr key={tailor.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-white font-medium">{tailor.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm">
                  {tailor.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm">
                  {tailor.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tailor.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm">
                  {tailor.totalOrders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm">
                  {tailor.totalRevenue.toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-[#D4AF37] font-semibold">{tailor.rating}</span>
                  <span className="text-white/50 text-sm ml-1">/ 5.0</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-white/60 hover:text-[#D4AF37] transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

