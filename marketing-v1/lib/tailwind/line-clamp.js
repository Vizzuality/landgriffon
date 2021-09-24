/* eslint-disable @typescript-eslint/no-var-requires */
const plugin = require('tailwindcss/plugin');

module.exports = plugin(
  ({ addUtilities, theme, e, variants }) => {
    const t = theme('lineClamp');
    const utilities = Object.keys(t).map((key) => ({
      [`.${e(`clamp-${key}`)}`]: {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': `${t[key]}`,
        '-webkit-box-orient': 'vertical',
      },
    }));

    addUtilities(utilities, variants('lineClamp', []));
  },
  {
    theme: {
      lineClamp: {
        1: 1,
        2: 2,
        3: 3,
      },
    },
  }
);
