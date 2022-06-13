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
      spacing: {
        125: '30.875rem',
        250: '48.75rem',
      },
    },
    colors: {
      black: colors.black,
      white: colors.white,
      red: colors.red,
      yellow: colors.yellow,
      transparent: colors.transparent,
      blue: {
        500: '#0C1063',
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
      green: {
        900: '#003D2D',
        800: '#00543F',
        700: '#078A3C', // primary
        600: '#059669',
        500: '#10B981',
        400: '#34D399',
        300: '#6EE7B7',
        200: '#A7F3D0',
        100: '#D1FAE5',
        50: '#EBF6F1',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [forms, typography, lineClamp],
};
