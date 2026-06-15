import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    ignores: ['node_modules/**', '**/*.min.js', 'dist/**', 'coverage/**']
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    plugins: {
      sonarjs: sonarjs
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'no-magic-numbers': ['warn', { ignore: [-1, 0, 1, 2], ignoreArrayIndexes: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'complexity': ['warn', 10],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['warn', 3],
      'id-length': ['warn', { min: 3, exceptions: ['i', 'j', 'k', 'x', 'y', 'z', 'id', '_'] }],
      'camelcase': ['warn'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-magic-numbers': 'off',
      'id-length': 'off',
      'camelcase': 'off',
      'sonarjs/no-duplicate-string': 'off'
    }
  }
];
