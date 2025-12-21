import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/frontend/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'SIGNARE - Mode Sénégalaise de Luxe',
  description: 'Plateforme de mode sénégalaise alliant artisanat traditionnel et IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0A0A0A] text-white min-h-screen flex flex-col m-0 p-0 overflow-x-hidden">
        {/* Contenu principal */}
        <main className="flex-1 w-full pb-24">
          {children}
        </main>

        {/* Barre de navigation fixe */}
        <BottomNav />
      </body>
    </html>
  )
}

