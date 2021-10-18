module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'mocha'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['.*'],
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/typedef': [
      'error',
      {
        arrayDestructuring: false,
        arrowParameter: true,
        memberVariableDeclaration: true,
        objectDestructuring: false,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: false,
        variableDeclarationIgnoreFunction: true,
      },
    ],
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
