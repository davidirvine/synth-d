## 1. Component Implementation

- [x] 1.1 Replace the binary `lit` class on `.power-icon` with a derived `status` variable (`'off' | 'loading' | 'on'`) computed from `powered` and `loading` props, and bind it as a class on the SVG element
- [x] 1.2 Add three CSS rules in `PowerButton.svelte`: `.power-icon.off` (stroke `#e07820`, no glow), `.power-icon.loading` (stroke `#e0c020`, no glow), `.power-icon.on` (stroke `#20b040`, drop-shadow glow `#20b040`); update the base `.power-icon` transition to `stroke 0.3s, filter 0.3s`
- [x] 1.3 Remove the `.power-icon.lit` rule and the `opacity: 0.7` rule on `.power-btn:disabled`
- [x] 1.4 Lint and format `src/components/PowerButton.svelte`

## 2. Test Updates

- [x] 2.1 Replace the `lit`-class assertions in existing tests with the appropriate tri-state class (`off`, `loading`, or `on`)
- [x] 2.2 Add test: icon has class `off` when `powered=false` and `loading=false`
- [x] 2.3 Add test: icon has class `loading` when `loading=true` (regardless of `powered` value)
- [x] 2.4 Add test: icon has class `on` when `powered=true` and `loading=false`
- [x] 2.5 Lint and format `src/components/PowerButton.test.js`

## 3. Verification

- [x] 3.1 Run `npx vitest run` and confirm all tests pass
