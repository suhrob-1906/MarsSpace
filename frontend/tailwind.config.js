/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Slate 900
        surface: '#1E293B', // Slate 800
        primary: {
          DEFAULT: '#F97316', // Orange 500
          hover: '#EA580C', // Orange 600
        },
        secondary: '#64748B', // Slate 500
        accent: '#8B5CF6', // Violet 500
        success: '#10B981', // Emerald 500
        error: '#EF4444', // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 15px rgba(249, 115, 22, 0.5)',
      }
    },
  },
  plugins: [],
}
