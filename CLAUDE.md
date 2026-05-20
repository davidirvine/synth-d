# Project Rules

> **These rules define a mandatory workflow. Every step MUST be followed in order. Do not skip, reorder, or shortcut any step. If a step cannot be completed, halt and report the blocker to the human before proceeding.**

> **This file is the stack-agnostic workflow kernel. Stack-specific rules (lint commands, build gotchas, test runners, domain-specific verification) belong in `STACK.md`, which is imported at the end of this file via `@./STACK.md`.**

## Spec Driven Design

A spec MUST exist before any implementation begins. This applies to new features, changes to existing features, and bug fixes without exception. Do not write any code until a spec has been created and approved via the OpenSpec workflow.

## Branching

All tasks for a change MUST be implemented on a single branch. Branch names MUST use either the `feature/` or `bugfix/` prefix followed by the kebab-case change name.

`/opsx:propose` does **not** create a branch — it commits the proposal artifacts directly to `main` (see "Spec Driven Design"). The `feature/`|`bugfix/` branch is created from `main` only by `/opsx-apply-wt`, which is also where the human is prompted for the change type.

**REQUIRED: At `/opsx-apply-wt` time, before creating the branch, prompt the human for the change type (feature or bugfix) and wait for confirmation. Do not create the branch until the human has confirmed the type.**

```
feature/<change-name>
bugfix/<change-name>
```

Examples:

- `feature/power-button`
- `feature/second-oscillator`
- `bugfix/fix-filter-cutoff`

Before starting any implementation work the worktree branch created by `/opsx-apply-wt` MUST exist. If a branch name conflict exists, halt and ask the human for guidance before doing anything else.

## Worktree Workflow

Implementation happens in worktrees branched from `main`. All change implementation MUST happen in an isolated worktree. This is not optional.

**REQUIRED sequence:**

1. From `main`, run `/opsx-apply-wt <change-name>` to create a sibling worktree on the correct branch
2. Open the new worktree in a separate VS Code window or terminal
3. From inside that worktree, run `/opsx:apply <change-name>` to begin implementation

Do not implement changes directly on `main`. If you find yourself on `main` with implementation work, halt and ask the human how to proceed.

## Code review with roborev

This repo uses roborev for continuous code review. After each commit,
reviews run automatically in the background.

- Browse open reviews interactively with `roborev tui`, or list them with `roborev fix --open --list`
- To address open findings, use the `/roborev-fix` skill
- Commit often so reviews stay scoped and contextual
- Configuration lives in `.roborev.toml` at the repo root

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

**This is a functional requirement, not a style preference.** Each feature/bugfix PR is squash-merged to `main`, and the PR title becomes the single commit `release-please` parses for the version bump type. Using the wrong type (or no type) silently breaks the release pipeline.

## Implementation Completion

There are no review or human-verification gates at section boundaries. Proceed straight through all sections until every task is implemented. The single review + human-verification gate runs once, at the end of the implementation.

The implementation is NOT complete until ALL of the following are true:

1. All applicable tests pass (see `STACK.md` for this project's specific test commands)
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

## Pull Requests

> **Branch creation, rebase, sync, and PR submission use plain `git` and the `gh` CLI. `gh` is a required tool for this workflow — it must be installed and authenticated.**

A single PR is opened per feature/bugfix branch when the entire change is complete. **Do not create per-section PRs.** The end-of-implementation gate (tests + roborev + human approval) runs once before the PR is opened — see "Implementation Completion" above.

### Feature-level verification

The feature branch is ready for PR ONLY after the human has completed:

1. Visual verification of the feature in the running app
2. Personal reflection on the feature's behaviour and quality
3. Explicit instruction to open the PR

Any stack-specific verification gates (e.g. audio verification) and the pre-push CI-parity checks are listed in `STACK.md`'s Feature-level verification section.

Do not open the PR autonomously. Wait for the human to request it.

### Opening the PR

When the human requests the PR:

1. Confirm the end-of-implementation gate has passed (tests pass, roborev clean, human approved per "Implementation Completion" above)
2. Push the branch and open the PR against `main`: `git push -u origin HEAD && gh pr create --fill --base main`
3. Report the PR URL to the human

### PR Feedback

When addressing comments left by a human reviewer on the feature PR:

1. Make response commits on the feature branch — the roborev post-commit hook fires and queues async reviews as normal
2. Human reviews the response commits and any roborev findings directly — `roborev refine` is **not** run during feedback cycles
3. On human approval, squash+force-push: `git rebase -i` to squash, then `git push --force-with-lease` to push

## Project-specific rules

@./STACK.md
