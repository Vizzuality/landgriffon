/** @type import('eslint').Linter.Config */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': ['error'],
    'react/button-has-type': ['warn'],
    'require-await': ['error'],
    'no-console': ['warn'],
    'no-debugger': ['warn'],
    '@typescript-eslint/consistent-type-imports': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': ['off'],
      },
    },
  ],
};
