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
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}

