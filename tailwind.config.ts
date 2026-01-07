import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Thème Luxe Sénégalais SIGNARE
        noir: {
          DEFAULT: '#0A0A0A',
          profond: '#000000',
        },
        or: {
          DEFAULT: '#D4AF37',
          clair: '#E5C158',
          fonce: '#B8941F',
        },
        blanc: {
          DEFAULT: '#FFFFFF',
          casse: '#F5F5F5',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Police d'affichage explicite pour les titres/labels (fallback system)
        display: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 1px 2px 0 rgba(212, 175, 55, 0.1)',
        'gold-md': '0 4px 6px -1px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 10px 15px -3px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config

