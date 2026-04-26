import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
    },
  },
  {
    files: ['*.svelte', 'src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      globals: {
        __APP_VERSION__: 'readonly',
        __GIT_BRANCH__: 'readonly',
      },
    },
  },
  {
    files: ['src/test-setup.js', '**/*.test.js', 'e2e/**/*.spec.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['*.config.js', '*.config.ts', '*.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'public/synth.js', 'public/synth.wasm'],
  },
]
