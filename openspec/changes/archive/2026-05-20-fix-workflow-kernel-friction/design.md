## Context

`CLAUDE.md` is the stack-agnostic workflow kernel; the per-change branch/PR/proposal flow is specced under `pr-workflow`, `commit-review-cycle`, and `conventional-commits`. Four rules in the kernel and its specs are wrong or non-executable:

- **#1** `CLAUDE.md` ("Code review with roborev") says "After each commit, reviews run automatically in the background," and PR-feedback step 1 says "the roborev post-commit hook fires and queues async reviews as normal." But `.githooks/post-commit` is an empty stub (`#!/usr/bin/env sh` only); roborev queueing is daemon-based and, because `core.hooksPath` is shared across worktrees, worktree-branch commits are not auto-queued. Every gate that actually depends on a review already invokes one explicitly: the proposal design-review (`/roborev-design-review-branch`) and the end-of-implementation `roborev refine`. The `commit-review-cycle` spec encodes the false claim ("The post-commit hook SHALL trigger an asynchronous AI code review after every commit") and states `post_commit_review = true` while `.roborev.toml` actually sets `post_commit_review = "commit"`.
- **#2** `CLAUDE.md` line ~84 calls per-task Conventional Commit types "a functional requirement, not a style preference" and justifies it by release-please — but PRs are squash-merged, so per-commit types are discarded and only the PR title is parsed. The `conventional-commits` "Squash-merged PR title drives the release version bump" requirement already states the correct mechanism; the per-commit requirement's rationale is what's mis-attributed.
- **#3** PR-feedback step 3 instructs `git rebase -i` to squash. Interactive git flags are unsupported in the agent harness, and a local squash is redundant before a GitHub squash-merge — but the local squash still feeds the roborev post-rewrite remap requirement, so it is kept, just made non-interactive.
- **#6** The synced `pr-workflow` "Proposing reviews the proposal on a branch before merging it to main" requirement fast-forward merges a proposal to `main` as soon as the design review is clean, with no human sign-off — the only merge to `main` in the workflow without a human gate, asymmetric with the implementation gate.

## Goals / Non-Goals

**Goals:**

- Make the four rules accurate and executable, and keep `CLAUDE.md` consistent with `pr-workflow`, `commit-review-cycle`, and `conventional-commits`.
- Describe roborev reviews as invoked explicitly at the defined gates (no "automatic after every commit" promise), matching the real hook/daemon behaviour and the worktree caveat.
- Add a human-approval step before a reviewed proposal merges to `main`.

**Non-Goals:**

- No change to `.githooks/`, `.roborev.toml`, `scripts/`, or any runtime code. We align docs/specs to reality rather than rewiring hooks to make "automatic" true (explicitly chosen direction for #1).
- No change to the apply/verify/archive flows beyond the wording above.
- No `STACK.md` change — these are stack-agnostic kernel rules.

## Decisions

**#1 — Fix the docs/specs to match reality, not the hook to match the docs.** Reword the roborev section to: reviews are run explicitly at the defined gates (proposal design-review, end-of-implementation `roborev refine`) and via explicit `roborev review`/`roborev tui`; worktree commits are not auto-queued, so do not rely on a post-commit review firing on its own. Update `commit-review-cycle` to drop the "triggers a review after every commit" guarantee (keep the post-rewrite remap, which is real and relied upon) and to state the actual `post_commit_review = "commit"` value. Alternative — wire `post-commit` to queue in worktrees — rejected per the chosen direction: higher risk, touches shared `core.hooksPath` behaviour, and the explicit gates already cover the need.

**#2 — Keep the per-commit requirement, fix its rationale.** Per-commit Conventional Commit types remain required (they keep roborev reviews scoped and history readable), but the text stops claiming they drive the release bump; the load-bearing input is the squash-merge PR title, as the `conventional-commits` "Squash-merged PR title drives the release version bump" requirement already says.

**#3 — Non-interactive squash, keep force-push-with-lease.** Replace `git rebase -i` with `git reset --soft "$(git merge-base HEAD main)" && git commit` (a single squash commit), then `git push --force-with-lease`. This is runnable head-less, keeps the post-rewrite remap requirement meaningful, and avoids the double-squash confusion without removing the local squash. Alternative — drop the local squash entirely and rely solely on GitHub's squash-merge — rejected to preserve the existing remap requirement and a clean force-pushed history for the human's final review.

**#6 — Human-approval step before the proposal fast-forward.** After the proposal design review passes cleanly, the agent presents the result and waits for explicit human approval before fast-forward merging `proposal/<change-name>` to `main` and deleting the branch. This mirrors the implementation gate's "wait for explicit human approval" posture and closes the asymmetry. Alternative — document auto-merge-on-clean-review as intentional — rejected per the chosen direction.

**#7 — `/opsx:verify` as the first, hard step of the end-of-implementation gate.** The completion gate currently jumps straight to tests and `roborev refine` with no check that the implementation actually matches what was proposed/spec'd. Add `/opsx:verify <change-name>` as gate step 1: it verifies the implementation against the change artifacts (proposal/design/specs/tasks) before any test or review work. It is a **hard gate** — if `/opsx:verify` reports a mismatch, the agent halts and resolves it before running tests, `roborev refine`, or requesting approval; a mismatch is not a "human decides whether it blocks" finding. This is deliberately stricter than the `roborev refine` remaining-findings posture (which defers to the human) because an artifact↔implementation mismatch means the spec-driven contract itself is unmet, so proceeding to PR would merge work that diverges from its approved spec. Ordering: `/opsx:verify` → full STACK.md test suite → `roborev status` → `roborev refine` → present results → explicit human approval. Alternative — run `/opsx:verify` advisorily (report, human decides) — rejected: the user chose a hard gate, and a soft artifact-coherence check adds little over no check.

## Risks / Trade-offs

- **Editing the kernel could drift from the specs again** → The implementation updates `CLAUDE.md` and the three spec deltas together, and `openspec validate` plus the completion gate run before archive. The just-completed archive of `propose-commits-to-main` removed the prior `CLAUDE.md`↔spec sync gap that this change builds on.
- **#1 leaves `.roborev.toml`/hooks untouched** → Accepted: the explicit gates are the real review triggers; the docs now say so. If the team later wants true per-commit auto-review in worktrees, that is a separate code change with its own proposal.
- **#6 adds a human touch-point to proposing** → Minor friction, but consistent with every other merge to `main`; proposals are infrequent and the approval is a single confirmation.
