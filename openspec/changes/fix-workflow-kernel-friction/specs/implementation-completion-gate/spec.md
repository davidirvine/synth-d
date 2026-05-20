## ADDED Requirements

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
