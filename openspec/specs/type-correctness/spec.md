# Type Correctness

## Purpose

Ensures the codebase is type-clean as enforced by `svelte-check`: every component prop is type-visible to consumers, audio modules carry explicit JSDoc annotations, DOM nullability is handled at boundaries, and custom `window` extensions are declared in ambient `.d.ts` files.

## Requirements

### Requirement: svelte-check reports zero errors
`npx svelte-check` SHALL complete with zero errors across all source and test files.

#### Scenario: Clean check on source files
- **WHEN** `npx svelte-check` is run against the project
- **THEN** it reports 0 errors and exits with code 0

### Requirement: Component props are type-visible to consumers
Every Svelte component that declares props via `$props()` SHALL annotate them in a form that svelte-check can resolve from consumer files.

#### Scenario: Knob props visible from consumer
- **WHEN** a parent component passes a typed prop (e.g., `min={0}`) to `<Knob>`
- **THEN** svelte-check reports no type error on that prop

#### Scenario: All other components similarly typed
- **WHEN** any component passes props to another component in this codebase
- **THEN** svelte-check reports no `not assignable to never` error

### Requirement: No implicit any in audio modules
All function parameters in `src/audio/math.js`, `engine.js`, `midi.js`, and `keyboard.js` SHALL have explicit JSDoc type annotations.

#### Scenario: math.js parameters typed
- **WHEN** svelte-check analyzes `src/audio/math.js`
- **THEN** no `implicitly has an 'any' type` errors are reported for its parameters

### Requirement: Null safety at DOM boundaries
Code that calls `querySelector`, `getElementById`, or similar nullable-returning DOM APIs SHALL handle the nullable result before passing it to typed callers.

#### Scenario: main.js mount target
- **WHEN** svelte-check analyzes `src/main.js`
- **THEN** no error is reported for the `mount()` target argument

#### Scenario: Test files query results
- **WHEN** svelte-check analyzes any `*.test.js` file
- **THEN** no error is reported for `Element | null` being passed to event or assertion functions

### Requirement: Window augmentation declared
Custom properties added to `window` (e.g., `__audioCtx`) SHALL be declared in a `.d.ts` ambient declaration file.

#### Scenario: engine.js window access
- **WHEN** svelte-check analyzes `src/audio/engine.js`
- **THEN** no `Property '__audioCtx' does not exist on type 'Window'` error is reported
