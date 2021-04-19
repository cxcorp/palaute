module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  parser: 'babel-eslint',
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': 'warn',
    'max-len': [1, 200],
    'no-shadow': 0,
    'no-plusplus': 0,
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'eslintreact/jsx-props-no-spreading': 'off',
    'no-unused-vars': 'warn',
    'react/prop-types': [
      1,
      {
        skipUndeclared: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft'] },
    ],
  },
}
