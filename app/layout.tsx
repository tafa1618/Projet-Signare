import { DesktopSidebar } from '@/app/components/DesktopSidebar'
import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/frontend/components/layout/BottomNav'
import Header from '@/frontend/components/layout/Header'
import { Inter, Playfair_Display } from 'next/font/google'

const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const fontSerif = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: '700', // Bold uniquement pour h1, h2, h3
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'SIGNARE - Mode Sénégalaise de Luxe',
  description: 'La porte d\'entrée mondiale de la mode sénégalaise. Plateforme de mode sénégalaise alliant artisanat traditionnel et IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`dark ${fontSans.variable} ${fontSerif.variable}`}>
      <body className="m-0 p-0 bg-[#0A0A0A] text-white" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* HEADER FIXE (Mobile Only) */}
        <div className="lg:hidden">
          <Header />
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="flex justify-center min-h-screen">
          {/* Sidebar Gauche (Desktop global) */}
          <DesktopSidebar />

          {/* Contenu de la page */}
          <main className="flex-1 max-w-[1000px] w-full min-h-screen">
            {children}
          </main>
        </div>

        {/* NAVIGATION FIXE (Mobile Only) */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
