# Project Rules

## Spec driven design

This project uses spec driven design methodology using OpenSpec. A spec must exist before any new features, changes to existing features, or bug fixes can be implemented.

## Branching

All of the tasks for a change should be implemented in a single branch. Branch names are kebab-case versions of the change name. Branches should be created from the develop branch at the time the openspec new command is issued is invoked by the /opsx:propose skill.

```
<change-name>
```

Examples:
- `power-button`
- `second-oscillator`

Before starting any implementation work create the branch but only if the current branch has a different name.
In the case of branch name conflicts, stop and ask the user for guidance.

## Section Completion

A section is not complete until all applicable tests pass:

| Sections | Required passing |
|---|---|
| 1–11 (scaffold through assembly) | `npx vitest run` |
| 12–13 (unit + component tests) | `npx vitest run` |
| 14 (Stryker) | `npx stryker run` with mutation score ≥ 85% |
| 15 (Playwright) | `npx playwright test` |
| 16 (final verification) | all three: vitest, stryker, playwright |

## Committing changes

After each section is complete the changes should be committed. Do not begin the next section until this commit is performed.

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
