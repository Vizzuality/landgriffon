/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');

const lineClamp = require('./lib/tailwind/line-clamp');

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
      // fontSize: {
      //   xxs: ['0.625rem', { lineHeight: '0.75rem' }], // 10px
      //   xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
      //   sm: ['0.75rem', { lineHeight: '1.875rem' }],
      //   base: ['1rem', { lineHeight: '1.625rem' }], // 16px
      //   lg: ['1.25rem', { lineHeight: '1.5rem' }], // 20px
      //   xl: ['1.25rem', { lineHeight: '1.875rem' }],
      //   '2xl': ['1.25rem', { lineHeight: '2.188rem' }],
      //   '3xl': ['1.563rem', { lineHeight: '2.188rem' }], // 25px
      //   '4xl': ['1.875rem', { lineHeight: '2.188rem' }], // 30px
      //   '5xl': ['1.875rem', { lineHeight: '2.5rem' }],
      //   '6xl': ['3.438rem', { lineHeight: '4.438rem' }], // 55px
      //   '7xl': ['4.688rem', { lineHeight: '5.313rem' }], // 75px
      //   '8xl': ['6rem', { lineHeight: '9.375rem' }], // 150px
      // },
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
  plugins: [forms, typography, lineClamp],
};
