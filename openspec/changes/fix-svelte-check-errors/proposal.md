## Why

`npx svelte-check` reports 1044 errors across the codebase — none of which block the build or tests today, but which mask real regressions and make the type-checking CI gate meaningless. Cleaning these to zero makes svelte-check a reliable signal.

## What Changes

- Fix JSDoc `$props()` annotation pattern in all 16 Svelte components so consumer prop-types are visible to svelte-check (eliminates ~608 `never` errors)
- Add JSDoc parameter type annotations to `math.js`, `engine.js`, `midi.js`, `keyboard.js`, and `App.svelte` callbacks (eliminates ~198 `implicit any` errors)
- Fix null-safety in `main.js` and all test files that pass nullable `querySelector`/`getElementById` results directly to functions expecting non-null (eliminates ~195 null errors)
- Fix miscellaneous: `Window.__audioCtx` declaration, `midi.js` Uint8Array iterator, `test-setup.js` MediaQueryList stub (~43 errors)

## Capabilities

### New Capabilities

- `type-correctness`: Zero svelte-check errors enforced across all source and test files

### Modified Capabilities

- `knob`: JSDoc type annotation pattern updated (no requirement change, implementation detail only)

## Impact

- All 16 `.svelte` components in `src/components/` — script block JSDoc pattern change
- `src/App.svelte` — JSDoc param annotations on callbacks
- `src/audio/math.js`, `engine.js`, `midi.js`, `keyboard.js` — JSDoc param annotations
- `src/main.js` — null guard on mount target
- All `*.test.js` files — null guards on querySelector results
- `src/test-setup.js` — MediaQueryList stub completeness
- No API changes, no behavior changes, no dependency changes
