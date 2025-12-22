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
    <html lang="fr" className={`dark ${fontSans.variable} ${fontSerif.variable}`}>
      <body className="bg-[#0A0A0A] text-white m-0 p-0 overflow-x-hidden">
        {/* CONTENU SCROLLABLE */}
        <div className="min-h-screen pb-24">
          {children}
        </div>

        {/* NAVIGATION FIXE */}
        <BottomNav />
      </body>
    </html>
  )
}
