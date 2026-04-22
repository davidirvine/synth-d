# Project Rules

## Branching

Each section in `tasks.md` is implemented on its own git branch. Branch names are kebab-case combining the change name and section name:

```
<change-name>/<section-name>
```

Examples:
- `subtractive-synth/project-scaffold`
- `subtractive-synth/faust-dsp-oscillator`
- `subtractive-synth/pure-function-modules`
- `subtractive-synth/unit-tests-pure-functions`

Create the branch before starting any work in a section. Do not begin the next section until the current branch is merged.

## Section Completion

A section is not complete until all applicable tests pass:

| Sections | Required passing |
|---|---|
| 1–11 (scaffold through assembly) | `npx vitest run` |
| 12–13 (unit + component tests) | `npx vitest run` |
| 14 (Stryker) | `npx stryker run` with mutation score ≥ 85% |
| 15 (Playwright) | `npx playwright test` |
| 16 (final verification) | all three: vitest, stryker, playwright |

## Linting and Formatting

After every file edit, run the appropriate tool before moving to the next task:

| File type | Command |
|---|---|
| `*.svelte` | `npx eslint --fix <file>` then `npx prettier --write <file>` |
| `*.js` | `npx eslint --fix <file>` then `npx prettier --write <file>` |
| `*.css` | `npx prettier --write <file>` |
| `*.md` | `npx prettier --write <file>` |
| `*.json` | `npx prettier --write <file>` |
| `*.dsp` (FAUST) | `faust <file> -o /dev/null` (validation only — `-check` flag not supported) |

ESLint must use `eslint-plugin-svelte` for `.svelte` files and Prettier must use `prettier-plugin-svelte`. Both are configured in section 1 (project scaffold).
