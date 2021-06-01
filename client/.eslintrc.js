module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    'react/react-in-jsx-scope': 'off',
    // NextJs specific fix: allow jsx syntax in js and ts files
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/jsx-props-no-spreading': ['error', {
      html: 'ignore',
      custom: 'ignore',
      exceptions: [''],
    }],
    'import/no-named-as-default': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {},
    },
  },
};
