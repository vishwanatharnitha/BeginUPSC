/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          light: '#1e2e5c',
          DEFAULT: '#0B1B3D', // Primary Navy Blue
          dark: '#061026'
        },
        saffron: {
          light: '#f79374',
          DEFAULT: '#E07A5F', // Secondary Saffron Orange
          dark: '#c45a3f'
        },
        gold: {
          DEFAULT: '#D4AF37' // Accent Gold
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
