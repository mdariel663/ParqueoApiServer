/** @type {import('typescript-eslint').ConfigWithExtends()} */
const config = [
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {
      '@typescript-eslint/space-before-function-paren': 'off'
    }
  }
]

module.exports = config
