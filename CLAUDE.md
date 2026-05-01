# Project Rules

> **These rules define a mandatory workflow. Every step MUST be followed in order. Do not skip, reorder, or shortcut any step. If a step cannot be completed, halt and report the blocker to the human before proceeding.**

## Spec Driven Design

A spec MUST exist before any implementation begins. This applies to new features, changes to existing features, and bug fixes without exception. Do not write any code until a spec has been created and approved via the OpenSpec workflow.

## Branching

All tasks for a change MUST be implemented on a single branch. Branch names MUST use either the `feature/` or `bugfix/` prefix followed by the kebab-case change name. Branches MUST be created from `main` at the time `/opsx:propose` is invoked.

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

## Code review with roborev

This repo uses roborev for continuous code review. After each commit,
reviews run automatically in the background.

- Browse open reviews interactively with `roborev tui`, or list them with `roborev fix --open --list`
- To address open findings, use the `/roborev-fix` skill
- Commit often so reviews stay scoped and contextual
- Configuration lives in `.roborev.toml` at the repo root

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

### Conventional Commits

Every commit MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>
```

Required types and their version-bump effect:

| Type       | When to use                                          | Version bump |
| ---------- | ---------------------------------------------------- | ------------ |
| `feat`     | New user-visible functionality                       | minor        |
| `fix`      | Corrects incorrect behaviour without adding features | patch        |
| `chore`    | Tooling, dependency, or pipeline changes             | none         |
| `docs`     | Documentation only                                   | none         |
| `refactor` | Code restructuring with no behaviour change          | none         |
| `test`     | Adding or updating tests                             | none         |

**This is a functional requirement, not a style preference.** The `promote.yml` workflow reads commit types from the `develop..main` diff to determine the promote PR title (e.g., `feat: promote develop to main`). GitHub squash-merges that PR, so the PR title becomes the single commit on `main` that `release-please` parses for the version bump type. Using the wrong type (or no type) silently breaks the release pipeline.

## Implementation Completion

There are no review or human-verification gates at section boundaries. Proceed straight through all sections until every task is implemented. The single review + human-verification gate runs once, at the end of the implementation.

The implementation is NOT complete until ALL of the following are true:

1. All applicable tests pass:
   - `npx vitest run` (unit + component tests)
   - `npx stryker run` (mutation score ≥ 85%)
   - `npx playwright test` (E2E)
2. All roborev reviews on the branch pass
3. The human has explicitly approved moving forward

### End-of-implementation workflow

When all tasks across all sections are complete:

1. Confirm all tests pass (per the list above)
2. Run `roborev status` to confirm the daemon is healthy — if it is not running, halt and report the error; do not skip the review gate
3. Run `roborev refine --max-iterations 3` to resolve all open review findings
4. Present refine results to the human and **wait for explicit human approval** before opening the PR — do not self-approve

If step 3 completes but open findings remain, present the remaining findings to the human. The human decides whether to run refine again, address findings manually, or explicitly override and proceed. Do not make this decision unilaterally.

**Do not create a PR until human approval is granted.** A single PR is opened for the whole feature/bugfix branch — see "Pull Requests" below.

## Build Configuration

**`build: { minify: false }` MUST remain in `vite.config.js`. Do not enable minification.**

`@grame/faustwasm`'s `FaustMonoDspGenerator.createNode` uses `Function.prototype.toString()` on its internal helper functions to construct an AudioWorklet processor blob URL at runtime. Minification renames those functions (e.g. `FaustWasmInstantiator` → `Na`), so the blob URL references identifiers that do not exist in its scope. The AudioWorklet module silently fails to evaluate, `registerProcessor` is never called, and any subsequent `new AudioWorkletNode(context, 'synth')` throws `InvalidStateError: No ScriptProcessor was registered with this name`. Safari makes this especially hard to debug because `audioWorklet.addModule()` resolves even when the module evaluation throws.

## Pull Requests

> **MANDATORY: All branch creation, rebase, sync, and PR submission MUST use stax. There is a stax skill available. Raw `git` commands for branch management or PR operations are FORBIDDEN. No exceptions.**

A single PR is opened per feature/bugfix branch when the entire change is complete. **Do not create per-section PRs.** The end-of-implementation gate (tests + roborev + human approval) runs once before the PR is opened — see "Implementation Completion" above.

### Feature-level verification

The feature branch is ready for PR ONLY after the human has completed:

1. Visual verification of the feature in the running app
2. Audio verification (where applicable)
3. Personal reflection on the feature's behaviour and quality
4. Explicit instruction to open the PR

Do not open the PR autonomously. Wait for the human to request it. Pre-push hooks will run the same checks as the `ci-develop` GitHub Actions workflow before the push is accepted (see `.husky/pre-push`).

### Opening the PR

When the human requests the PR:

1. Confirm the end-of-implementation gate has passed (tests pass, roborev clean, human approved per "Implementation Completion" above)
2. Push and create the PR: `stax ss --yes --no-prompt`
3. Report the PR URL to the human

### PR Feedback

When addressing comments left by a human reviewer on the feature PR:

1. Make response commits on the feature branch — the roborev post-commit hook fires and queues async reviews as normal
2. Human reviews the response commits and any roborev findings directly — `roborev refine` is **not** run during feedback cycles
3. On human approval, squash+force-push: `git rebase -i` to squash, then `stax ss --yes --no-prompt` to push
