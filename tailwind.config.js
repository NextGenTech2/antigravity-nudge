/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Indigo primary
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        darkbg: '#0B0E14',      // Deep charcoal/navy base
        darkcard: '#1C212E',    // Elevated surface color
        darkborder: '#1E293B',  // Slate-800 border
        accent: {
          pink: '#FF2E93',      // Vivid pink for craving actions
          green: '#10B981',     // Success green for savings
          yellow: '#F59E0B',    // Rating yellow
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(2, 4, 8, 0.5)',
        'glass-glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'accent-glow': '0 0 25px rgba(255, 46, 147, 0.25)',
        'success-glow': '0 0 25px rgba(16, 185, 129, 0.25)',
        'card-elevation': '0 12px 40px -8px rgba(2, 4, 8, 0.6), 0 4px 12px -3px rgba(2, 4, 8, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
