// eslint.config.js

const tsPlugin = require('@typescript-eslint/eslint-plugin')
module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@/semi': ['off'],
      // Tipado estricto
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error', // Forzar tipos explícitos en límites del módulo
/*      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
        },
      ],
*/
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ], // Expresiones booleanas estrictas, sin falsos positivos con valores nulos
      '@typescript-eslint/no-explicit-any': 'error', // Prohibir "any" completamente
      '@typescript-eslint/no-unsafe-assignment': 'error', // Prohibir asignaciones inseguras
      '@typescript-eslint/no-unsafe-call': 'error', // Prohibir llamadas inseguras
      '@typescript-eslint/no-unsafe-member-access': 'error', // Prohibir acceso inseguro a miembros
      '@typescript-eslint/no-unsafe-return': 'error', // Prohibir retornos inseguros

      // Preferencias de tipos
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // Forzar interfaces
      '@typescript-eslint/prefer-readonly': 'error', // Forzar propiedades readonly cuando sea posible
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignoreTernaryTests: false },
      ], // Preferir ?? en vez de ||
      '@typescript-eslint/prefer-as-const': 'error', // Usar `as const` en literales

      // Reglas estrictas de manejo de errores
      '@typescript-eslint/no-floating-promises': 'error', // Prohibir promesas sin manejar
      '@typescript-eslint/no-non-null-assertion': 'error', // Prohibir uso de aserciones de no nulidad (!)

      // Variables y convenciones de código
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^ignored' },
      ],
    },
    ignores: ['node_modules/**', 'dist/**'],
  },
]
