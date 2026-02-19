/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './*.html',
    './subpages/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#fff7e6',100:'#ffedcc',200:'#ffd999',300:'#ffc266',
          400:'#ffad33',500:'#f59e0b',600:'#d97706',700:'#b45309',
          800:'#7c2d12',900:'#431407'
        },
        diplomatic: { blue: '#1e3a8a', gold: '#f59e0b', slate: '#1f2937' }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Playfair Display','Georgia','serif']
      }
    },
  },
  plugins: [],
}

