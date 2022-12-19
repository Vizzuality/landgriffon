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
      backgroundImage: {
        'hero-pattern':
          'linear-gradient(90deg, #CC3128 0%, #DD493E 21.35%, #E5594C 35.37%, #E86154 49.48%, #E65C4F 61.64%, #DF4D41 73.87%, #D33930 89.63%, #CC3027 96.09%, #CD3128 100%)',
      },
    },
  },
  plugins: [typography],
};
