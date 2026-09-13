/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          950: '#06070e',
          900: '#0b0f19',
          800: '#111827',
          700: '#1e293b',
          600: '#334155'
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        astral: {
          violet: '#8b5cf6',
          neon: '#a855f7',
          glow: '#c084fc',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -3px rgba(234, 179, 8, 0.45)',
        'astral-glow': '0 0 30px -4px rgba(168, 85, 247, 0.45)',
        'cyan-glow': '0 0 25px -3px rgba(6, 182, 212, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}

