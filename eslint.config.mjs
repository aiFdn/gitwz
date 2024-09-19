import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            import: fixupPluginRules(_import),
            '@typescript-eslint': typescriptEslint,
            prettier,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                project: './tsconfig.json',
            },
        },

        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
        },

        ignores: ['out/', 'out/**/*', 'node_modules/', 'node_modules/**/*', '.github/'],

        rules: {
            'prettier/prettier': 'error',
            'no-console': 'error',
            'import/order': 'off',
            'sort-imports': 'off',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            complexity: ['warn', 15],
            'max-depth': ['warn', 4],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/prefer-for-of': 'warn',
            '@typescript-eslint/prefer-includes': 'warn',
            '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
];
