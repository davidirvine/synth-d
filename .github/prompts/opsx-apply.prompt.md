---
description: Implement tasks from an OpenSpec change (Experimental)
---

Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx:apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx:apply <other>`).

2. **Check status to understand the schema**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using `/opsx:continue`
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

6. **Implement tasks section by section**

   Tasks are grouped into sections by their `## N. Section Title` headings in the tasks file.
   A section contains all tasks with the same numeric prefix (e.g., all `1.x` tasks belong to section 1).

   **For each section (in order):**

   a. **Implement all tasks in the section** — for each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - **After every file edit**, run the appropriate lint/format command before moving on:
     - `*.svelte` or `*.js`: `npx eslint --fix <file>` then `npx prettier --write <file>`
     - `*.css`, `*.md`, `*.json`, `*.toml`: `npx prettier --write <file>`
     - `*.dsp` (FAUST): `faust <file> -o /dev/null` (validation only)
     - If lint/format fails: fix the error before proceeding — do not continue to the next task
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Commit immediately: every individual task step gets its own commit — do not batch
   - Continue to next task within the section

   **Pause within a section if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

   b. **Section gate** — once all tasks in the section are marked complete, run each step below in order. Do not skip any step.

   **Gate step 1 — Run tests.** Select the command based on section number:
   - Sections 1–13: `npx vitest run`
   - Section 14: `npx stryker run` (score must be ≥ 85%)
   - Section 15: `npx playwright test`
   - Section 16: `npx vitest run` then `npx stryker run` then `npx playwright test`

   If tests fail, fix the failure before proceeding. Do not continue to the next section with failing tests.

   **Gate step 2 — Check roborev daemon:**

   ```bash
   roborev status
   ```

   If the daemon is not healthy, halt and report the error. Do not skip this check.

   **Gate step 3 — Resolve review findings:**

   ```bash
   roborev refine --max-iterations 3
   ```

   **Gate step 4 — Human approval.** Present the refine results to the human and wait for explicit approval before proceeding. If open findings remain, present them — the human decides whether to run refine again, address findings manually, or explicitly override. Do not self-approve. Do not proceed until the human says to continue.

   **Gate step 5 — Squash section commits.** On human approval:

   ```bash
   git rebase -i develop
   ```

   Squash all commits from this section into one.

   **Gate step 6 — Create the stacked PR:**

   ```bash
   stax ss --yes --no-prompt
   ```

   **Gate step 7 — Report the PR URL** to the human before starting the next section. Do not begin the next section until the URL has been confirmed.

   c. **Continue to the next section** only after the PR for the current section has been created and the URL reported.

7. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

### Section 1: <Section Title>

Working on task 1.1/2: <task description>
[...implementation happening...]
✓ Task complete — committed

Working on task 1.2/2: <task description>
[...implementation happening...]
✓ Task complete — committed

#### Section 1 Gate
Running tests... ✓
roborev status... ✓
roborev refine... ✓

[Present refine results]

Waiting for your approval to create the PR for section 1.
```

**Output After Section PR Created**

```
#### Section 1 PR Created
PR: <url>

Starting section 2...
```

**Output On Completion**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! You can archive this change with `/opsx:archive`.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**

- Implement one section at a time — do not begin the next section until the current section's PR is created
- Lint and format every file immediately after editing it — do not skip or batch
- Commit every task immediately after completing it — do not batch multiple tasks into one commit
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements — do not guess
- Use contextFiles from CLI output, do not assume specific file names
- Never use raw `git` for branch management or PR creation — always use `stax`
- Never self-approve the roborev gate — wait for explicit human confirmation

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
- **Resuming mid-section**: If invoked mid-section (some tasks already checked), complete remaining tasks in the current section first, then run the section gate before proceeding
