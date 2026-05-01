## MODIFIED Requirements

### Requirement: README documents the branching strategy and deployment pipeline
The README SHALL include a **Branching & Deployment** section that describes the branch model, the role of each branch, and how code flows from a feature branch to production. The section SHALL document: branch naming conventions (`feature/*`, `bugfix/*`), the role of `main` as the single long-running branch (trunk), CI checks on PRs to `main`, production deployment to GitHub Pages on release-please cut, PR preview deployments, and the `release-please` release flow. The section MUST NOT reference a `develop` branch, an integration branch, or an auto-promotion PR — these no longer exist.

#### Scenario: Developer reads branching strategy
- **WHEN** a developer reads the README
- **THEN** they can determine which branch to create for a new feature (a `feature/*` branch cut from `main`)
- **THEN** they understand that CI runs tests, lint, and format on PRs to `main`
- **THEN** they understand that `release-please` cuts releases on `main` and the release cut triggers deployment to GitHub Pages

#### Scenario: README describes the full branch-to-production flow
- **WHEN** the README is rendered
- **THEN** the Branching & Deployment section shows the relationship between `feature/*` (or `bugfix/*`) → `main` → release-please → GitHub Pages
- **THEN** PR preview deployments and `release-please` releases are mentioned
- **THEN** no `develop` branch is mentioned anywhere in the section

#### Scenario: Branching section is placed within the Development section
- **WHEN** the README is viewed
- **THEN** the Branching & Deployment section appears within or adjacent to the existing Development section, not in the middle of the Features or Architecture sections
