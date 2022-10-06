const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');

/** @type import('tailwindcss').Config */
module.exports = {
  content: ['./**/*.ts', './**/*.tsx'],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        xs: ['0.75rem', '1rem'], // 12px
        sm: ['0.875rem', '1.25rem'], // 14px
        base: ['1rem', '1.5rem'], // 16px
        lg: ['1.125rem', '1.75rem'], // 18px
        '2xl': ['1.5rem', '2rem'], // 20px
        '3xl': ['1.875rem', '2.25rem'], // 24px
        '4xl': ['2.25rem', '2.5rem'], // 28px
      },
      height: {
        'screen-minus-header': "calc(100vh - theme('spacing.16'))",
      },
      spacing: {
        125: '30.875rem',
        250: '48.75rem',
      },
      backgroundImage: {
        auth: 'linear-gradient(240.36deg, #2E34B0 0%, #0C1063 68.13%)',
      },
    },
    colors: {
      black: colors.black,
      white: colors.white,
      red: colors.red,
      yellow: colors.yellow,
      transparent: colors.transparent,
      gray: {
        900: '#15181F',
        800: '#2D2F32',
        700: '#464749',
        600: '#656565',
        500: '#60626A',
        400: '#AEB1B5',
        300: '#C2C5C9',
        200: '#D1D5DB',
        100: '#F3F4F6',
        50: '#F9FAFB',
      },
      green: {
        900: '#003D2D',
        800: '#00543F',
        700: '#00634A', // primary
        600: '#059669',
        500: '#10B981',
        400: '#34D399',
        300: '#6EE7B7',
        200: '#A7F3D0',
        100: '#D1FAE5',
        50: '#EBF6F1',
      },
      // theme
      primary: { DEFAULT: '#078A3C', dark: '#00634A', light: '#34D399' },
      blue: '#A9E0F5',
      yellow: '#F9DFB1',
    },
  },
  plugins: [forms, typography],
};
