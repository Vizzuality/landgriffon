/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');
const lineClamp = require('@tailwindcss/line-clamp');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./**/*.ts', './**/*.tsx'],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        display: ['Geomanist', 'sans-serif'],
      },
      fontSize: {
        '4xl': ['2.1875rem', '2.125rem'],
        '5xl': ['2.8125rem', '2.325rem'],
        '6xl': ['3.4375rem', '2.75rem'],
        '7xl': ['4.375rem', '3.8125rem'],
        '8xl': ['5.3125rem', '4.125rem'],
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
        300: '#10AC4F',
        400: '#129B4A',
        500: '#078A3C',
      },
      blue: {
        400: '#6CCBFF',
        500: '#4AB7F3',
        600: '#0C1063',
        900: '#141873',
      },
      orange: {
        400: '#FFB73F',
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
