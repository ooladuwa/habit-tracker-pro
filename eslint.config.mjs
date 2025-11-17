import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Apply to all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'babel.config.js',
      'metro.config.js',
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React plugin configuration
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React Native
      'react/prop-types': 'off', // We use TypeScript
    },
  },

  // React Native plugin configuration
  {
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
    },
  },

  // Prettier config (disables conflicting rules)
  prettierConfig,

  // Custom rules
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // Language options
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
  },
];
