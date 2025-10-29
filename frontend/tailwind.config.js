/**** @type {import('tailwindcss').Config} ****/
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nexivo: {
          primary: '#2563eb',
          secondary: '#7c3aed',
          accent: '#06b6d4',
          dark: '#0f172a',
          surface: '#1e293b',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        slideInFromLeft: 'slideInFromLeft 1s ease-out forwards',
        fadeIn: 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInFromLeft: {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      animationDelay: {
        '500': '0.5s',
        '800': '0.8s',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {};
      const delays = theme('animationDelay');
      for (const key in delays) {
        newUtilities[`.animation-delay-${key}`] = {
          'animation-delay': delays[key],
        };
      }
      addUtilities(newUtilities, ['responsive']);
    },
  ],
}
