/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50: 'var(--color-beige-50)',
          100: 'var(--color-beige-100)',
          200: 'var(--color-beige-200)',
          300: 'var(--color-beige-300)',
          400: 'var(--color-beige-400)',
          500: 'var(--color-beige-500)',
        },
        teal: {
          500: 'var(--color-teal-500)',
          600: 'var(--color-teal-600)',
          700: 'var(--color-teal-700)',
        },
        gold: {
          300: 'var(--color-gold-300)',
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', '"Fira Mono"', 'Menlo', 'Consolas', '"DejaVu Sans Mono"', 'monospace'],
        playfair: ['"Playfair Display"', 'serif'],
        lora: ['Lora', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        custom: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};