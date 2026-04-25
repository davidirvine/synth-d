# Section Review Gate

## Requirements

### Requirement: roborev refine runs at section boundaries

When all tasks in a section are complete (e.g., all 1.x tasks), the system SHALL run `roborev refine` before proceeding. `roborev refine` SHALL iterate the auto-fix cycle until all open review findings on the branch pass or the iteration limit is reached.

#### Scenario: Refine runs after all section tasks complete

- **WHEN** all tasks in a section (e.g., 1.1 through 1.n) are marked complete
- **THEN** `roborev refine` is invoked on the current branch

#### Scenario: Refine iterates until all reviews pass

- **WHEN** `roborev refine --max-iterations 3` is running and open findings exist
- **THEN** it deploys an agent to fix findings, commits the fixes, awaits re-review, and repeats until all reviews pass or 3 iterations are exhausted

#### Scenario: Refine iteration limit exhausted with remaining findings

- **WHEN** `roborev refine --max-iterations 3` completes but open findings remain
- **THEN** the remaining findings are presented to the human, and the human decides whether to run refine again, address findings manually, or override and proceed

#### Scenario: Refine runs only at section boundary, not after every commit

- **WHEN** an individual task step commit is made mid-section
- **THEN** `roborev refine` is NOT invoked; the review is queued asynchronously only

---

### Requirement: Human checkpoint is required before squash and PR creation

After `roborev refine` completes, the system SHALL present the results to the human and wait for explicit approval before proceeding to squash commits or create a stacked PR. The squash and PR steps SHALL NOT be automated.

#### Scenario: Results presented after refine completes

- **WHEN** `roborev refine` finishes
- **THEN** a summary of review results (pass/fail counts, any remaining findings) is presented to the human

#### Scenario: Squash does not proceed without human approval

- **WHEN** refine has completed but the human has not approved
- **THEN** neither the commit squash nor the stax PR creation proceeds

#### Scenario: Workflow continues on human approval

- **WHEN** the human explicitly approves after reviewing refine results
- **THEN** the section commits are squashed and a stacked PR is created via stax

---

### Requirement: roborev daemon is verified before running refine

Before invoking `roborev refine` at a section boundary, the system SHALL verify that the roborev daemon is running via `roborev status`. If the daemon is not running, the system SHALL surface an error and halt rather than silently skipping the review gate.

#### Scenario: Daemon running — refine proceeds

- **WHEN** `roborev status` reports the daemon is healthy
- **THEN** `roborev refine` is invoked normally

#### Scenario: Daemon not running — halt with error

- **WHEN** `roborev status` reports the daemon is not running
- **THEN** an error is surfaced to the human and the section boundary workflow halts
