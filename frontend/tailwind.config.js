/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        veb: {
          bg: "#040404",
          panel: "#070707",
          surface: "#0D0D0F",
          surface2: "#121214",
          gold: "#C8A646",
          goldSoft: "#B88D2D",
          goldDark: "#8C6A1F",
          goldLine: "#5E4716",
          text: "#F5F3EE",
          muted: "#B8B1A1",
          label: "#7F7765",
          divider: "#232323",
        },
        gold: {
          DEFAULT: '#C8A646',
          light: '#E2C97E',
          dark: '#B88D2D',
        },
        charcoal: '#040404',
        offwhite: '#F5F3EE',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        accent: ['"Cinzel"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  safelist: [
    'group-hover:scale-105',
    'group-hover:scale-110',
    'scale-105',
    'scale-110',
    'hover:scale-105',
    'hover:scale-110',
  ],
  plugins: [],
}