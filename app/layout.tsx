import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/frontend/components/layout/BottomNav'
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
  description: 'Plateforme de mode sénégalaise alliant artisanat traditionnel et IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`dark ${fontSans.variable} ${fontSerif.variable} overflow-x-hidden`}>
      <body className="m-0 p-0 overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* CONTENU SCROLLABLE */}
        <div className="min-h-screen pb-20">
          {children}
        </div>

        {/* NAVIGATION FIXE */}
        <BottomNav />
      </body>
    </html>
  )
}
