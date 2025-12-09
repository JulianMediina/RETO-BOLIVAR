import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'oklch(0.97 0.01 250)',
          100: 'oklch(0.93 0.03 250)',
          200: 'oklch(0.86 0.06 250)',
          300: 'oklch(0.78 0.09 250)',
          400: 'oklch(0.68 0.12 250)',
          500: 'oklch(0.58 0.15 250)',
          600: 'oklch(0.48 0.17 250)',
          700: 'oklch(0.39 0.15 250)',
          800: 'oklch(0.31 0.12 250)',
          900: 'oklch(0.24 0.09 250)',
          950: 'oklch(0.16 0.06 250)',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
} satisfies Config