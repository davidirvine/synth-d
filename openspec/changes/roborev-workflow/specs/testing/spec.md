## MODIFIED Requirements

### Requirement: Section completion requires all roborev reviews to pass
The system SHALL require all roborev review findings on the branch to pass (via `roborev refine`) before a section is considered complete, in addition to the existing test suite requirements. A section is complete only when ALL of the following are satisfied:

| Section       | Required passing                                                        |
| ------------- | ----------------------------------------------------------------------- |
| 1–11          | `npx vitest run` + all roborev reviews pass                             |
| 12–13         | `npx vitest run` + all roborev reviews pass                             |
| 14            | `npx stryker run` (score ≥ 85%) + all roborev reviews pass              |
| 15            | `npx playwright test` + all roborev reviews pass                        |
| 16            | vitest + stryker + playwright + all roborev reviews pass                |

#### Scenario: Section not complete with failing roborev reviews
- **WHEN** all vitest tests pass for a section but roborev has open failing reviews
- **THEN** the section is NOT considered complete and `roborev refine` must be run

#### Scenario: Section complete when tests and roborev both pass
- **WHEN** all required test suites pass AND all roborev reviews on the branch pass
- **THEN** the section is considered complete and the human checkpoint may proceed
