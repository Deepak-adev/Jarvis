/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // slate-50
        surface: {
          DEFAULT: '#ffffff', // pure white
          card: '#ffffff',
          border: '#e2e8f0', // slate-200
          muted: '#f1f5f9', // slate-100
          hover: '#f8fafc',
          subtle: '#f8fafc',
        },
        brand: {
          cyan: '#0284c7', // sky-600
          blue: '#2563eb', // blue-600
          indigo: '#4f46e5', // indigo-600
          accent: '#0284c7',
        },
        status: {
          healthy: '#16a34a', // green-600
          warning: '#d97706', // amber-600
          critical: '#dc2626', // red-600
          unknown: '#64748b', // slate-500
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
