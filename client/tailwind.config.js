/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const lineClamp = require('./lib/tailwind/line-clamp');

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV !== 'development',
    content: ['./**/*.ts', './**/*.tsx'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [forms, typography, lineClamp],
};
