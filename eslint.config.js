import js from '@eslint/js';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const feature = './src/features/*';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Dependencies point inwards: app → pages → features → shared, and
    // ui → application → infrastructure → domain within a feature (ADR 0002)
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({ extensions: ['.ts', '.tsx', '.js'] }),
      ],
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: ['./src/app', './src/pages', './src/features'],
              message: 'shared code cannot depend on the app.',
            },
            {
              target: './src/features',
              from: ['./src/app', './src/pages'],
              message: 'Features cannot depend on pages or the app.',
            },
            {
              target: './src/pages',
              from: './src/app',
              message: 'Pages cannot depend on the app.',
            },
            {
              target: `${feature}/domain/**`,
              from: [
                `${feature}/application/**`,
                `${feature}/infrastructure/**`,
                `${feature}/ui/**`,
              ],
              message: 'The domain cannot depend on outer layers.',
            },
            {
              target: `${feature}/infrastructure/**`,
              from: [`${feature}/application/**`, `${feature}/ui/**`],
              message: 'Infrastructure cannot depend on application or ui.',
            },
            {
              target: `${feature}/application/**`,
              from: `${feature}/ui/**`,
              message: 'Application cannot depend on ui.',
            },
            {
              target: `${feature}/ui/**`,
              from: `${feature}/infrastructure/**`,
              message: 'The ui reaches infrastructure through application.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/domain/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^[^.]',
              message: 'The domain is plain TypeScript: no packages.',
            },
          ],
        },
      ],
    },
  },
]);
