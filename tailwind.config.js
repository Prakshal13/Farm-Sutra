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
          primary: '#1D9E75', // Teal — the one accent, reserved for primary actions & verification
          dark: '#2E1B12',    // Deep terracotta-brown (headers, sidebar, nav bands)
          bg: '#F5EBD8',      // Straw light (screen body background)
          surface: '#FFFFFF', // Pure White (card elevation)
          light: '#FBF6EC',   // Muted cream (subtle badges/pills on light surfaces)
          accent: '#D9A521',  // Gold — secondary highlight, used sparingly (ratings, small callouts)
        },
        alert: {
          warning: '#D97706',
          danger: '#DC2626',
          info: '#1D9E75',
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