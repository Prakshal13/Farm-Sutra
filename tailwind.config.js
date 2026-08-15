/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        agri: {
          primary: '#4A7240', // Warm Moss (Lighter, organic earthy green)
          dark: '#2C332A',    // Charcoal Olive (Softer anchor for headers and text)
          bg: '#F7F7F3',      // Almond Oat (Warm, bright minimalist background)
          surface: '#FFFFFF', // Pure White (For crisp card elevation)
          accent: '#D05A22',  // Soft Terracotta (Highly visible but softer than pure orange)
        },
        alert: {
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter-Regular', 'sans-serif'],
        bold: ['Inter-Bold', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}