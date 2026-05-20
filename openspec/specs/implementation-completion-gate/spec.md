# Implementation Completion Gate

## Purpose

Define the single review and human-verification gate that runs once at the end of a change's implementation — after all tasks across all sections are complete and before the PR is opened. The gate runs `roborev refine` once (not at section boundaries), verifies the roborev daemon is healthy first, and requires explicit human approval before any squash or PR creation.
## Requirements
### Requirement: roborev refine runs once at the end-of-implementation gate

When all tasks across all sections are complete, the system SHALL run `roborev refine` once as part of the end-of-implementation gate, before opening the PR. `roborev refine` SHALL iterate the auto-fix cycle until all open review findings on the branch pass or the iteration limit is reached. The system SHALL NOT run review gates at section boundaries; implementation proceeds straight through all sections.

#### Scenario: Refine runs after all tasks across all sections complete

- **WHEN** every task in every section of the change is marked complete
- **THEN** `roborev refine` is invoked once on the branch as part of the end-of-implementation gate

#### Scenario: Refine iterates until all reviews pass

- **WHEN** `roborev refine --max-iterations 3` is running and open findings exist
- **THEN** it deploys an agent to fix findings, commits the fixes, awaits re-review, and repeats until all reviews pass or 3 iterations are exhausted

#### Scenario: Refine iteration limit exhausted with remaining findings

- **WHEN** `roborev refine --max-iterations 3` completes but open findings remain
- **THEN** the remaining findings are presented to the human, and the human decides whether to run refine again, address findings manually, or override and proceed

#### Scenario: No review gate at section boundaries

- **WHEN** all tasks in a single section (e.g., 1.1 through 1.n) are complete but other sections remain
- **THEN** `roborev refine` is NOT invoked; implementation continues to the next section, and per-task commits queue asynchronous reviews only

---

### Requirement: Human checkpoint is required before squash and PR creation

After `roborev refine` completes at the end-of-implementation gate, the system SHALL present the results to the human and wait for explicit approval before proceeding to squash commits or create the PR. The squash and PR steps SHALL NOT be automated.

#### Scenario: Results presented after refine completes

- **WHEN** `roborev refine` finishes
- **THEN** a summary of review results (pass/fail counts, any remaining findings) is presented to the human

#### Scenario: Squash does not proceed without human approval

- **WHEN** refine has completed but the human has not approved
- **THEN** neither the commit squash nor the PR creation proceeds

#### Scenario: Workflow continues on human approval

- **WHEN** the human explicitly approves after reviewing refine results
- **THEN** the branch's PR is opened via `gh` (one PR per branch, base `main`)

---

### Requirement: roborev daemon is verified before running refine

Before invoking `roborev refine` at the end-of-implementation gate, the system SHALL verify that the roborev daemon is running via `roborev status`. If the daemon is not running, the system SHALL surface an error and halt rather than silently skipping the review gate.

#### Scenario: Daemon running — refine proceeds

- **WHEN** `roborev status` reports the daemon is healthy
- **THEN** `roborev refine` is invoked normally

#### Scenario: Daemon not running — halt with error

- **WHEN** `roborev status` reports the daemon is not running
- **THEN** an error is surfaced to the human and the end-of-implementation gate halts

### Requirement: /opsx:verify runs first as a hard gate at the end-of-implementation gate

When all tasks across all sections are complete, the system SHALL run `/opsx:verify <change-name>` as the FIRST step of the end-of-implementation gate — before the test suite, `roborev status`, `roborev refine`, and the human-approval checkpoint. `/opsx:verify` SHALL confirm that the implementation matches the change artifacts (proposal, design, specs, tasks). This is a hard gate: if `/opsx:verify` reports that the implementation does not match the artifacts, the system SHALL halt and resolve the mismatch before running tests, `roborev refine`, or requesting human approval. An artifact↔implementation mismatch SHALL NOT be treated as a "human decides whether it blocks" finding. To resolve, the system SHALL fix the implementation when the code is wrong, update the artifacts via the normal artifact-update flow when the artifacts are wrong, and ask the human when it is unclear which side is correct.

#### Scenario: Verify runs first when all tasks complete

- **WHEN** every task in every section of the change is marked complete
- **THEN** `/opsx:verify <change-name>` is invoked as the first step of the end-of-implementation gate, before the test suite and `roborev refine`

#### Scenario: Verify mismatch halts the gate

- **WHEN** `/opsx:verify` reports that the implementation does not match the change artifacts
- **THEN** the gate halts and the mismatch is resolved before tests, `roborev refine`, or human approval proceed

#### Scenario: Verify pass allows the gate to continue

- **WHEN** `/opsx:verify` confirms the implementation matches the change artifacts
- **THEN** the gate proceeds to the full STACK.md test suite, then `roborev status`, then `roborev refine`, then the human-approval checkpoint

