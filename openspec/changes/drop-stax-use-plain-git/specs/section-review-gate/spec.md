## ADDED Requirements

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

## REMOVED Requirements

### Requirement: roborev refine runs at section boundaries

**Reason**: `CLAUDE.md` eliminated section-boundary review gates — the single review + human-verification gate now runs once at the end of implementation. Running refine per section contradicts the current workflow.

**Migration**: Run `roborev refine` once at the end-of-implementation gate after all tasks across all sections are complete (see "roborev refine runs once at the end-of-implementation gate").

## MODIFIED Requirements

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

### Requirement: roborev daemon is verified before running refine

Before invoking `roborev refine` at the end-of-implementation gate, the system SHALL verify that the roborev daemon is running via `roborev status`. If the daemon is not running, the system SHALL surface an error and halt rather than silently skipping the review gate.

#### Scenario: Daemon running — refine proceeds

- **WHEN** `roborev status` reports the daemon is healthy
- **THEN** `roborev refine` is invoked normally

#### Scenario: Daemon not running — halt with error

- **WHEN** `roborev status` reports the daemon is not running
- **THEN** an error is surfaced to the human and the end-of-implementation gate halts
