/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV !== 'development',
    content: ['./**/*.ts', './**/*.tsx'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      red: colors.red,
      beige: '#F9F5F3',
      black: colors.black,
      blue: '#0142AC',
      current: 'currentColor',
      darkGray: '#1F1F1F',
      green: '#00634A',
      lightBlue: '#A5D2EB',
      lightGray: '#B8B8B8',
      orange: '#FFA000',
      transparent: 'transparent',
      white: colors.white,
    },
    fontFamily: {
      heading: 'Montserrat',
      sans: ['Public Sans', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.625rem', { lineHeight: '0.75rem' }], // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }], // 16px
      lg: ['1.125rem', { lineHeight: '1.5' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.5' }], // 20px
      '2xl': ['1.5rem', { lineHeight: '1.2' }], // 24px
      '3xl': ['1.875rem', { lineHeight: '1.2' }], // 30px
      '4xl': ['2.5rem', { lineHeight: '1.2' }], // 40px
      '5xl': ['3.4375rem', { lineHeight: '1.2' }], // 55px
      '6xl': ['4.6875rem', { lineHeight: '1.2' }], // 75px
      '7xl': ['9.375rem', { lineHeight: '1.2' }], // 150px
    },
    extend: {
      fontSize: {
        ue: ['0.625rem', { lineHeight: '0.75rem' }], // UE logo text
      },
    },
  },
  variants: {
    extend: {
      borderColor: ['hover'],
      borderStyle: ['hover'],
      borderWidth: ['hover'],
      display: ['first', 'responsive'],
      fontFamily: ['hover'],
      fontWeight: ['hover'],
      visibility: ['first', 'hover', 'group-hover'],
    },
    transitionProperty: {
      height: 'height',
      spacing: 'margin, padding',
      visibility: 'visibility',
    },
  },
  plugins: [forms, typography],
};
