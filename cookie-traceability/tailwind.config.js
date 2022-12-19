/** @type {import('tailwindcss').Config} */
const typography = require('@tailwindcss/typography');

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      white: '#ffffff',
      black: '#000000',
      'gray-dark': '#333333',
      secondary: '#FEF8D7',
      primary: '#C62A1C',
    },
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        display: ['Geomanist', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};
