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
        primary:   '#6366f1',
        secondary: '#7c3aed',
        accent:    '#8b5cf6',
        dark:      '#0f1117',
        surface:   '#ffffff',
        muted:     '#f8f9fc',
        border:    '#e8ecf0',
        // Luxury indigo scale
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03)',
        'card-md': '0 4px 16px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)',
        'card-lg': '0 8px 32px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)',
        'brand':   '0 4px 16px rgba(99,102,241,0.25)',
        'brand-lg':'0 8px 32px rgba(99,102,241,0.35)',
        'inner-sm':'inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      backgroundImage: {
        'brand-gradient':  'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        'brand-gradient2': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
        'dark-gradient':   'linear-gradient(180deg, #0f1117 0%, #1a1f2e 100%)',
        'surface-gradient':'linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)',
      },
      spacing: {
        sidebar: '264px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                        to: { opacity: '1' }                        },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
