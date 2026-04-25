# Project Rules

> **These rules define a mandatory workflow. Every step MUST be followed in order. Do not skip, reorder, or shortcut any step. If a step cannot be completed, halt and report the blocker to the human before proceeding.**

## Spec Driven Design

A spec MUST exist before any implementation begins. This applies to new features, changes to existing features, and bug fixes without exception. Do not write any code until a spec has been created and approved via the OpenSpec workflow.

## Branching

All tasks for a change MUST be implemented on a single branch. Branch names MUST use either the `feature/` or `bugfix/` prefix followed by the kebab-case change name. Branches MUST be created from `develop` at the time `/opsx:propose` is invoked.

**REQUIRED: Before creating a branch, prompt the human for the change type (feature or bugfix) and wait for confirmation. Do not create a branch until the human has confirmed the type.**

```
feature/<change-name>
bugfix/<change-name>
```

Examples:

- `feature/power-button`
- `feature/second-oscillator`
- `bugfix/fix-filter-cutoff`

Before starting any implementation work the branch MUST exist. If the current branch already has the correct name, proceed. If not, create the branch first. If a branch name conflict exists, halt and ask the human for guidance before doing anything else.

## Worktree Workflow

The `develop` branch is reserved exclusively for OpenSpec proposals and tooling work. All change implementation MUST happen in an isolated worktree. This is not optional.

**REQUIRED sequence:**

1. From `develop`, run `/opsx-apply-wt <change-name>` to create a sibling worktree on the correct branch
2. Open the new worktree in a separate VS Code window or terminal
3. From inside that worktree, run `/opsx:apply <change-name>` to begin implementation

Do not implement changes directly on `develop`. If you find yourself on `develop` with implementation work, halt and ask the human how to proceed.

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

## Committing Changes

EVERY individual task step (e.g., 1.1, 1.2, 2.1) MUST be committed immediately after it is complete. Do not batch multiple steps into a single commit. Do not begin the next step until the commit for the current step has been made.

## Section Completion

A section is NOT complete until ALL of the following are true:

1. All applicable tests pass (see table below)
2. All roborev reviews on the branch pass
3. A stacked PR has been created for the section

| Sections                         | Required passing                                           |
| -------------------------------- | ---------------------------------------------------------- |
| 1–11 (scaffold through assembly) | `npx vitest run` + all roborev reviews pass                |
| 12–13 (unit + component tests)   | `npx vitest run` + all roborev reviews pass                |
| 14 (Stryker)                     | `npx stryker run` (score ≥ 85%) + all roborev reviews pass |
| 15 (Playwright)                  | `npx playwright test` + all roborev reviews pass           |
| 16 (final verification)          | vitest + stryker + playwright + all roborev reviews pass   |

Do not proceed to the next section until all three conditions above are met.

## Stacked PRs

> **MANDATORY: All branch creation, rebase, sync, and PR submission MUST use stax. Raw `git` commands for branch management or PR operations are FORBIDDEN. No exceptions.**

One stacked PR MUST be created per section — all 1.x tasks become one PR, all 2.x tasks become one PR, and so on. This is a required workflow step, not optional. The next section MUST NOT begin until the PR for the current section has been created and confirmed.

### Section boundary workflow

EVERY section MUST end by completing ALL of the following steps in order:

1. All section tasks complete and tests pass (per the Section Completion table above)
2. Run `roborev status` to confirm the daemon is healthy — if it is not running, halt and report the error; do not skip the review gate
3. Run `roborev refine --max-iterations 3` to resolve all open review findings
4. Present refine results to the human and **wait for explicit human approval** before proceeding — do not self-approve
5. On approval, squash all section commits: `git rebase -i develop`
6. Push and create the stacked PR: `stax ss --yes --no-prompt`
7. Confirm the PR URL was returned and report it to the human before beginning the next section

If step 3 completes but open findings remain, present the remaining findings to the human. The human decides whether to run refine again, address findings manually, or explicitly override and proceed. Do not make this decision unilaterally.

### PR Feedback

When addressing comments left by a human reviewer on a stacked PR:

1. Make response commits on the section branch — the roborev post-commit hook fires and queues async reviews as normal
2. Human reviews the response commits and any roborev findings directly — `roborev refine` is **not** run during feedback cycles
3. On human approval, squash+force-push: `git rebase -i` to squash, then `stax ss --yes --no-prompt` to push
4. Sync trunk and restack all downstream section branches: `stax sync --restack`
