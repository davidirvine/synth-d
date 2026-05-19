# Workflow Kernel Structure

## Purpose

The project's Claude-Code rules are split into a stack-agnostic workflow kernel (`CLAUDE.md`) and a project-specific stack file (`STACK.md`) imported via the `@`-syntax. This separation keeps `CLAUDE.md` portable across projects while letting a template consumer replace `STACK.md` wholesale. This capability defines the structure and contents of each file and how they compose at load time.

## Requirements

### Requirement: CLAUDE.md contains only stack-agnostic workflow rules

The `CLAUDE.md` file at the repository root SHALL contain only process and workflow rules that apply to any Claude-Code project regardless of programming language, build system, or test framework. Stack-specific rules — including but not limited to lint and format commands per file type, build-system gotchas, framework-specific test commands at the completion gate, and domain-specific verification steps (such as audio verification) — SHALL NOT appear directly inside `CLAUDE.md`.

#### Scenario: CLAUDE.md is read as a portable kernel

- **WHEN** a contributor or a Claude-Code session opens `CLAUDE.md` in isolation (without resolving imports)
- **THEN** every rule in the file is applicable to any project that follows the agent-workflow process
- **THEN** the file contains no references to specific lint commands, specific test runners, or the project's build-system gotchas

#### Scenario: Adding a stack-specific rule

- **WHEN** a contributor needs to record a rule that depends on this project's toolchain (e.g., a new prettier plugin, a new test runner, a build-system quirk)
- **THEN** the contributor SHALL add it to `STACK.md`, not to `CLAUDE.md`

### Requirement: STACK.md holds project-specific stack rules

A file named `STACK.md` SHALL exist at the repository root, as a sibling of `CLAUDE.md`. `STACK.md` SHALL contain all rules that are specific to this project's chosen stack and conventions, including the linting and formatting table by file extension, build-configuration gotchas, the specific test commands invoked at the implementation-completion gate, and any domain-specific verification gates (such as audio verification for this synth project). `STACK.md` SHALL open with a short preamble identifying it as the project-specific stack rules and noting that it is imported by `CLAUDE.md`.

#### Scenario: A contributor needs the project's lint command

- **WHEN** a contributor looks up which command to run to lint a `.svelte` file
- **THEN** the command is documented in `STACK.md`'s linting and formatting table
- **THEN** the same information is not duplicated in `CLAUDE.md`

#### Scenario: A contributor needs the completion-gate test commands

- **WHEN** a contributor reaches the implementation-completion gate and needs the exact test commands to run
- **THEN** `STACK.md` lists the specific commands (e.g., `npx vitest run`, `npx stryker run`, `npx playwright test`)
- **THEN** `CLAUDE.md` describes only the **structure** of the gate (tests pass, roborev reviews pass, human approval) without naming the specific commands

### Requirement: CLAUDE.md imports STACK.md via the @-syntax

`CLAUDE.md` SHALL end with a section titled `## Project-specific rules` whose body is exactly the single line `@./STACK.md`. Claude Code resolves this `@`-import by inlining `STACK.md`'s content at load time, so the effective ruleset loaded into a Claude-Code session is the concatenation of `CLAUDE.md`'s kernel rules and `STACK.md`'s stack rules.

#### Scenario: Claude Code loads the project rules

- **WHEN** a Claude-Code session starts in the repository root and the harness loads `CLAUDE.md`
- **THEN** the session's effective project rules include both the contents of `CLAUDE.md` and the contents of `STACK.md`
- **THEN** behavior is functionally equivalent to a single concatenated document

#### Scenario: The import is the last section of CLAUDE.md

- **WHEN** `CLAUDE.md` is inspected
- **THEN** the final section is `## Project-specific rules`
- **THEN** the body of that section is exactly `@./STACK.md` (no surrounding prose, no other content)

#### Scenario: Removing or moving STACK.md is detectable

- **WHEN** `STACK.md` is missing or moved away from the repo root
- **THEN** Claude Code's `@./STACK.md` import fails to resolve and the missing-import condition is visible (rather than silently degrading)
