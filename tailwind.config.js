/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",       // Ana dizindeki App.tsx, index.tsx vb.
    "./components/**/*.{js,ts,jsx,tsx}", // components klasörü
    "./services/**/*.{js,ts,jsx,tsx}"     // services klasörü
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          primary: '#6366f1',
          secondary: '#a855f7',
          accent: '#ec4899',
          success: '#22c55e',
          danger: '#ef4444',
          warning: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}