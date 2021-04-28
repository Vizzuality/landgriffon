/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');

module.exports = {
  purge: [
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './layout/**/*.{js,ts,jsx,tsx,md,mdx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: '.625rem',
      },
      colors: {
        primary: '#00634A',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    forms,
    typography,
  ],
};
