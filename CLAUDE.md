# Project Rules

## Spec driven design

This project uses spec driven design methodology using OpenSpec. A spec must exist before any new features, changes to existing features, or bug fixes can be implemented.

## Branching

All of the tasks for a change should be implemented in a single branch. Branch names use either the `feature/` or `bugfix/` prefix followed by the kebab-case change name. Branches should be created from the develop branch at the time the openspec new command is issued is invoked by the /opsx:propose skill.

**Before creating a branch, prompt the human for the change type (feature or bugfix) and use the corresponding prefix.** Do not create a branch until the human has confirmed the type.

```
feature/<change-name>
bugfix/<change-name>
```

Examples:

- `feature/power-button`
- `feature/second-oscillator`
- `bugfix/fix-filter-cutoff`

Before starting any implementation work create the branch but only if the current branch has a different name.
In the case of branch name conflicts, stop and ask the user for guidance.

## Worktree Workflow

The `develop` branch is reserved for OpenSpec proposals and tooling work. All change implementation happens in an isolated worktree:

1. On `develop`, run `/opsx-apply-wt <change-name>` to create a sibling worktree on the correct branch
2. Open the new worktree in a separate VS Code window or terminal
3. From inside that worktree, run `/opsx:apply <change-name>` to begin implementation

This ensures `develop` stays clean and each change is implemented in isolation.

## Section Completion

A section is not complete until all applicable tests pass **and** all roborev reviews on the branch pass:

| Sections                         | Required passing                                           |
| -------------------------------- | ---------------------------------------------------------- |
| 1–11 (scaffold through assembly) | `npx vitest run` + all roborev reviews pass                |
| 12–13 (unit + component tests)   | `npx vitest run` + all roborev reviews pass                |
| 14 (Stryker)                     | `npx stryker run` (score ≥ 85%) + all roborev reviews pass |
| 15 (Playwright)                  | `npx playwright test` + all roborev reviews pass           |
| 16 (final verification)          | vitest + stryker + playwright + all roborev reviews pass   |

At every section boundary, run `roborev refine --max-iterations 3` to resolve all open review findings before proceeding.

Before invoking `roborev refine`, verify the daemon is healthy with `roborev status`. If the daemon is not running, surface the error and halt — do not skip the review gate.

If `roborev refine --max-iterations 3` completes but open findings remain, present the remaining findings to the human. The human decides whether to run refine again, address findings manually, or override and proceed.

## Committing changes

Commit after every individual task step (e.g., step 1.1, 1.2, 2.1). Do not batch multiple steps into a single commit, and do not begin the next step until the commit for the current step is made.

## Linting and Formatting

After every file edit, run the appropriate tool before moving to the next task:

| File type       | Command                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `*.svelte`      | `npx eslint --fix <file>` then `npx prettier --write <file>`                |
| `*.js`          | `npx eslint --fix <file>` then `npx prettier --write <file>`                |
| `*.css`         | `npx prettier --write <file>`                                               |
| `*.md`          | `npx prettier --write <file>`                                               |
| `*.json`        | `npx prettier --write <file>`                                               |
| `*.toml`        | `npx prettier --write <file>`                                               |
| `*.dsp` (FAUST) | `faust <file> -o /dev/null` (validation only — `-check` flag not supported) |

ESLint must use `eslint-plugin-svelte` for `.svelte` files and Prettier must use `prettier-plugin-svelte`. Both are configured in section 1 (project scaffold).

## Stacked PRs

All git interactions (branch creation, rebase, sync, PR submission) use stax. Ad-hoc git commands for branch or PR management must not be used.

One stacked PR is created per section (all 1.x tasks = one PR, all 2.x = one PR, etc.).

### Section boundary workflow

1. All section tasks complete and tests pass
2. Run `roborev refine --max-iterations 3` to resolve all open review findings
3. Present refine results to the human and **wait for explicit approval** before proceeding
4. On approval, squash all section commits: `git rebase -i develop`
5. Push and create the stacked PR: `stax ss --yes --no-prompt`

### PR Feedback

When addressing comments left by a human reviewer on a stacked PR:

1. Make response commits on the section branch — the roborev post-commit hook fires and queues async reviews as normal
2. Human reviews the response commits and any roborev findings directly — `roborev refine` is **not** run
3. On human approval, squash+force-push: `git rebase -i` to squash, then `stax ss --yes --no-prompt` to push
4. Sync trunk and restack all downstream section branches: `stax sync --restack`
