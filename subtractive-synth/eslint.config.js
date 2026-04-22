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
    files: ['*.svelte'],
    languageOptions: {
      parser: svelteParser,
    },
  },
  {
    files: ['src/test-setup.js', '**/*.test.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'public/synth.js', 'public/synth.wasm'],
  },
]
