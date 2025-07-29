/** @type {import('tailwindcss').Config} */
import { darkTheme,lightTheme,colors } from './src/assets/themes/theme'

export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      xsm: '400px',
      sm: '500px',
      md: '640px',
      lg: '976px',
      xl: '1440px',
      xxl: '1750px'
    },
    extend: {
      colors:{
        light: lightTheme,
        dark: darkTheme,
        color: colors
      },
      boxShadow: {
        'custom': '0px 0px 10px var(--tw-shadow-color)',
      },
      keyframes: {
        rotateOnceClockWise: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(2)'},
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        rotateOnceAntiClockWise: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(-180deg) scale(2)'},
          '100%': { transform: 'rotate(-360deg) scale(1)' },
        },
      },
      // animation: {
      //   rotateOnceClockWise: 'rotateOnce linear forwards',
      //   rotateOnceAntiClockWise: 'rotateOnce linear forwards',
      // },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require("tailwind-scrollbar-hide")
  ],
}

