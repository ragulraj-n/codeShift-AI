/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        beige: {
          light: '#F4EFEA',
          DEFAULT: '#DDD0C8',
          dark: '#BCAFA7',
        },
        darkgrey: {
          light: '#4C4C4C',
          DEFAULT: '#323232',
          dark: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
