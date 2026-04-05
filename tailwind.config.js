/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: 'var(--amber-50)',
          100: 'var(--amber-100)',
          200: 'var(--amber-200)',
          300: 'var(--amber-300)',
          400: 'var(--amber-400)',
          500: 'var(--amber-500)',
          600: 'var(--amber-600)',
          700: 'var(--amber-700)',
          800: 'var(--amber-800)',
          900: 'var(--amber-900)',
          950: 'var(--amber-950)',
        },
      },
    },
  },
  plugins: [],
}
