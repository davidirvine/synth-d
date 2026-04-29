## Context

The project uses Svelte 5 with plain JavaScript (no `lang="ts"`) and JSDoc for type annotations. `tsconfig.json` has `"checkJs": true`, so `svelte-check` runs full type checking on all `.js` and `.svelte` files. Currently 1044 errors are reported, making svelte-check useless as a CI gate.

The dominant error category (608 errors, 58%) is `Type 'X' is not assignable to type 'never'` — every prop passed to a Svelte component from a consumer. The root cause is the JSDoc annotation placement: all components use a type _cast_ on the `$props()` expression, which does not expose the props interface to svelte-check's component type inference.

## Goals / Non-Goals

**Goals:**
- Reach zero `svelte-check` errors
- No behavior changes — pure type annotation work
- Keep the codebase in JavaScript (no conversion to TypeScript)

**Non-Goals:**
- Adding new runtime type validation
- Changing how components work at runtime
- Converting `.js` files to `.ts`

## Decisions

### D1: Fix `$props()` annotation placement

**Current pattern** (type cast on expression — does not expose props to consumers):
```javascript
let { label = '' } = /** @type {{ label?: string }} */ ($props())
```

**Fixed pattern** (type annotation on variable declaration — svelte-check reads this):
```javascript
/** @type {{ label?: string }} */
let { label = '' } = $props()
```

This is a mechanical change across all 16 components. No logic changes.

**Alternatives considered:**
- Convert to `lang="ts"` with TypeScript interfaces — more robust long-term but a larger scope change; deferred.
- Use `@typedef` + reference — equivalent fix, more verbose with no benefit here.

### D2: JSDoc parameter annotations on JS audio files

Add `@param` JSDoc tags to all untyped function parameters in `math.js`, `engine.js`, `midi.js`, `keyboard.js`. This is the minimal change to satisfy `checkJs: true`.

**Alternative:** Add `// @ts-nocheck` to these files — ruled out; it suppresses real errors and defeats the purpose of this change.

### D3: Null safety — non-null assertions in tests

Test files call `fireEvent` with `querySelector()` results which TypeScript sees as `Element | null`. The correct fix is a non-null assertion (`!`) immediately after the query, since these tests would throw at runtime anyway if the element wasn't found.

**Alternative:** Add null guards with `if (!el) return` — more verbose and hides test failures silently; non-null assertion is the right signal.

### D4: `main.js` null guard

`mount(App, { target: document.getElementById('app') })` — `getElementById` returns `HTMLElement | null`. Fix: `document.getElementById('app')!` or a startup assertion. Non-null assertion is appropriate; if `#app` is missing, failing loudly is correct.

### D5: `Window.__audioCtx` — add global declaration

`engine.js` accesses `window.__audioCtx` for Safari compatibility. Fix: add a `src/global.d.ts` file declaring the property on `Window`.

### D6: `test-setup.js` MediaQueryList stub

The mock object is missing required `MediaQueryList` properties. Fix: extend the stub with the missing fields (`media`, `onchange`, `addListener`, `removeListener`, `dispatchEvent`).

## Risks / Trade-offs

- **Risk**: Changing the `$props()` annotation placement could theoretically expose previously-hidden type mismatches in consumer components.  
  → **Mitigation**: Run svelte-check after each component fix and resolve immediately; don't batch all 16 components.

- **Risk**: Non-null assertions (`!`) in tests could mask genuine null-return bugs.  
  → **Mitigation**: The assertion is valid because these tests rely on specific DOM structure — if the element is missing the test should throw, which `!` ensures.

## Migration Plan

No deployment steps needed — pure source change. The work is sequenced by error category so svelte-check error count decreases incrementally and can be verified at each step.
