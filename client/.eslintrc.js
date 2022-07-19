module.exports = {
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true,
      },
    ],
    'react/button-has-type': ['warn'],
    'no-console': ['warn'],
    '@typescript-eslint/consistent-type-imports': ['warn'],
  },
};
