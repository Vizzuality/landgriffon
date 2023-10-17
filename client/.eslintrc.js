/** @type import('eslint').Linter.Config */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  },
  rules: {
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'internal', 'object', 'type'],
        'newlines-between': 'always',
      },
    ],
    'import/no-named-as-default': ['off'],
    'import/no-named-as-default-member': ['off'],
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
    'no-restricted-imports': [
      'error',
      {
        patterns: [{ group: ['lodash', '!lodash-es'], message: 'Use lodash-es instead' }],
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
