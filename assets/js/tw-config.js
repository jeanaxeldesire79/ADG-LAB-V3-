// Shared Tailwind CDN configuration for consistent theming
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        secondary: {
          DEFAULT: '#1E3A8A',
          light: '#60A5FA',
        },
        bg: { light: '#F9FAFB', dark: '#111827' },
        surface: { light: '#FFFFFF', dark: '#1F2937' },
        content: { light: '#111827', dark: '#F9FAFB', mid: '#4B5563' },
        brand: {
          50:'#fff7e6',100:'#ffedcc',200:'#ffd999',300:'#ffc266',
          400:'#ffad33',500:'#f59e0b',600:'#d97706',700:'#b45309',
          800:'#7c2d12',900:'#431407'
        }
      },
      boxShadow: { soft:'0 8px 34px rgba(0,0,0,.06)' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      }
    }
  }
};

