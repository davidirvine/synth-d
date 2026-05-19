# Project-Specific Stack Rules

> These are the stack-specific rules for the **synth-d** project (Svelte / Vite / FAUST). They are imported into `CLAUDE.md` via `@./STACK.md`, so a Claude Code session loads them as part of the project ruleset. When you record a rule that depends on this project's toolchain — a lint command, a build-system gotcha, a test runner, a domain-specific verification step — put it here, not in `CLAUDE.md`. A future template consumer replaces this file wholesale.

## Linting and Formatting

After EVERY file edit, run the appropriate tool BEFORE moving to the next task. Do not proceed to the next task if linting or formatting fails.

| File type       | Command                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `*.svelte`      | `npx eslint --fix <file>` then `npx prettier --write <file>`                |
| `*.js`          | `npx eslint --fix <file>` then `npx prettier --write <file>`                |
| `*.css`         | `npx prettier --write <file>`                                               |
| `*.md`          | `npx prettier --write <file>`                                               |
| `*.json`        | `npx prettier --write <file>`                                               |
| `*.toml`        | `npx prettier --write <file>`                                               |
| `*.dsp` (FAUST) | `faust <file> -o /dev/null` (validation only — `-check` flag not supported) |

ESLint MUST use `eslint-plugin-svelte` for `.svelte` files and Prettier MUST use `prettier-plugin-svelte`. Both are configured in section 1 (project scaffold).

## Build Configuration

**`build: { minify: false }` MUST remain in `vite.config.js`. Do not enable minification.**

`@grame/faustwasm`'s `FaustMonoDspGenerator.createNode` uses `Function.prototype.toString()` on its internal helper functions to construct an AudioWorklet processor blob URL at runtime. Minification renames those functions (e.g. `FaustWasmInstantiator` → `Na`), so the blob URL references identifiers that do not exist in its scope. The AudioWorklet module silently fails to evaluate, `registerProcessor` is never called, and any subsequent `new AudioWorkletNode(context, 'synth')` throws `InvalidStateError: No ScriptProcessor was registered with this name`. Safari makes this especially hard to debug because `audioWorklet.addModule()` resolves even when the module evaluation throws.

## Completion-gate test commands

The implementation-completion gate in `CLAUDE.md` requires all applicable tests to pass. For this project those are:

- `npx vitest run` (unit + component tests)
- `npx stryker run` (mutation score ≥ 85%)
- `npx playwright test` (E2E)

## Feature-level verification

These stack-specific checks compose with the human-approval gate in `CLAUDE.md`'s Pull Requests section — the human completes them before instructing that the PR be opened:

- Audio verification (where applicable)
- Pre-push hooks run the same checks as the `ci-main` GitHub Actions workflow before the push is accepted (see `.githooks/pre-push`).
