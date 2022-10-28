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
      transparent: colors.transparent,
      inherit: colors.inherit,
      gray: {
        900: '#15181F',
        600: '#40424B',
        500: '#60626A',
        400: '#8F9195',
        300: '#AEB1B5',
        200: '#D1D5DB',
        100: '#F3F4F6',
        50: '#F9FAFB',
      },
      navy: {
        50: '#F0F2FD', // light navy
        200: '#C7CDEA', // light mid navy
        400: '#3F59E0', // navy
        600: '#2E34B0', // mid navy
        900: '#152269', // dark navy
      },
      orange: {
        500: '#FFA000', // orange
        300: '#F0B957', // light mid orange
        100: '#F9DFB1', // light orange
        50: '#FFF1D9', // lightest orange
      },
      blue: {
        400: '#4AB7F3', // blue
        200: '#C7F0FF', // soft blue
      },
      green: {
        800: '#006D2C',
        400: '#078A3C',
        200: '#CDE8D8',
        50: '#E6F9EE',
      },
      red: {
        800: '#BA1809', // dark red
        400: '#E93323', // red
        50: '#FEF2F2', // light red
      },
    },
  },
  plugins: [forms, typography],
};
