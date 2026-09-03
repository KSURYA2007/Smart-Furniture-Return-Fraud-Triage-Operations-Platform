/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          dark: '#3730a3',
          light: '#e0e7ff',
          subtle: '#eff0ff',
          content: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#f0f4f8',
          elevated: '#f8fafc',
        },
        emerald: {
          DEFAULT: '#10b981',
          400: '#10b981',
          500: '#059669',
          700: '#047857',
          950: '#022c22',
        },
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #3b82f6 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
