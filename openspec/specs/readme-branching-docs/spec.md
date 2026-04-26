## ADDED Requirements

### Requirement: README documents the branching strategy and deployment pipeline
The README SHALL include a **Branching & Deployment** section that describes the branch model, the role of each branch, and how code flows from a feature branch to production. The section SHALL document: branch naming conventions (`feature/*`, `bugfix/*`), the role of `develop` as the integration branch, the auto-promotion PR from `develop` to `main`, CI checks per branch, production deployment to GitHub Pages on merge to `main`, PR preview deployments, and the `release-please` release flow.

#### Scenario: Developer reads branching strategy
- **WHEN** a developer reads the README
- **THEN** they can determine which branch to create for a new feature
- **THEN** they understand that CI runs tests + lint + format on PRs to `develop`
- **THEN** they understand that merging to `main` triggers deployment to GitHub Pages

#### Scenario: README describes the full branch-to-production flow
- **WHEN** the README is rendered
- **THEN** the Branching & Deployment section shows the relationship between `feature/*` → `develop` → `main` → GitHub Pages
- **THEN** PR preview deployments and `release-please` releases are mentioned

#### Scenario: Branching section is placed within the Development section
- **WHEN** the README is viewed
- **THEN** the Branching & Deployment section appears within or adjacent to the existing Development section, not in the middle of the Features or Architecture sections
