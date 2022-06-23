/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');
const lineClamp = require('@tailwindcss/line-clamp');

module.exports = {
  content: ['./**/*.ts', './**/*.tsx'],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        display: ['Geomanist', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['3.4375rem', '2.75rem'],
        '10xl': ['7.8125rem', '5.6875rem'],
      },
    },
    colors: {
      black: colors.black,
      white: colors.white,
      red: colors.red,
      yellow: colors.yellow,
      transparent: colors.transparent,
      green: {
        400: '#129B4A',
        500: '#078A3C',
      },

      blue: {
        500: '#0C1063',
      },
      orange: {
        500: '#FFA000',
      },
      gray: {
        900: '#15181F',
        800: '#2D2F32',
        700: '#464749',
        600: '#656565',
        500: '#909194',
        400: '#AEB1B5',
        300: '#C2C5C9',
        200: '#D1D5DB',
        100: '#F3F4F6',
        50: '#F9FAFB',
      },
    },
  },
  plugins: [forms, typography, lineClamp],
};
