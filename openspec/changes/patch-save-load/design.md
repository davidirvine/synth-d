## Context

`synth-d` is a Svelte 5 (runes) / Vite / FAUST web synth. Its parameter state is currently **decentralized** across three mechanisms:

1. **Knob values** live as `$state` inside each `Knob.svelte`. A knob receives an `externalValue` prop; an `$effect` (Knob.svelte:134-143) clamps it, sets the knob's value, fires `onchange` (→ `setParam`), and spring-animates the indicator — but only when the user is not dragging.
2. **MIDI CC values** live in `App.svelte`'s `ccExternalValues` record, which is fed into each knob's `externalValue`.
3. **Discrete/switch state** (osc waveforms/ranges, OSC3 LFO mode, key track, delay/delay-mod/reverb on-off) lives as `$state` inside the panel components and has **no input channel at all** — it is only ever changed by user click or zeroed by an incrementing numeric `reset` prop on power-on (`power-on-reset` spec).

There is no single object representing "the current sound," which is exactly what save/load needs. The codebase carries heavy unit + component test coverage, a Stryker mutation gate (≥85%), and Playwright E2E (see `STACK.md`).

## Goals / Non-Goals

**Goals:**

- A single source of truth for synth parameters that can be serialized (save) and replaced (load).
- Save the current sound under a user-chosen name; load and delete named patches; persist across page reloads.
- Loading works whether the synth is powered on or off; power-on applies whatever patch is active.
- Preserve all existing observable behavior: knob spring animation, power-off rest positions, MIDI CC control, DSP/UI agreement from the first sample.
- Keep the dark/monospace hardware aesthetic; no OS dialogs.

**Non-Goals:**

- Patches do **not** capture keyboard register, MIDI CC assignments, or mod-wheel position (performance/controller state, not sound).
- No cloud sync, sharing, or accounts. Storage is local to the browser.
- No factory-preset library, patch categories/tags, or A/B compare in this change (the store makes them easy later).
- Real on-disk `.json` file export/import is a possible later stretch, not part of this change.

## Decisions

### D1 — Central reactive store as the single source of truth

Introduce one runes-based store module (e.g. `src/state/synth.svelte.js`) exporting a `$state` object keyed by param name, covering every knob param and every switch param. All parameter reads/writes go through it.

- **Knob input is unchanged in mechanism:** the store *feeds* each knob's `externalValue`. We do **not** rip `externalValue` out of `Knob.svelte`; we keep its clamp + spring-animate + not-while-dragging logic intact (this is what preserves `knob-power-state` and `knob-spring-reset` behavior). What changes is the *source* — `ccExternalValues` is subsumed by the store.
- **Switch input is new:** panel components stop owning discrete `$state` and instead read their switch values from the store and write back on user interaction. This replaces the `reset`-prop-only input path.
- **DSP sync via one subscriber:** a single `$effect` (or explicit setter wrapper) calls `engine.setParam(name, value)` when a store value changes. It fires **only for audio params**, **only for finite values**, and must not create feedback loops with MIDI-originated writes (see R2).

*Alternative considered — "broadcast" pattern* (keep decentralized state, add an applied-patch prop + per-component `$effect`): smaller refactor, but leaves the save-snapshot logic spread across components and easy to under-cover, and keeps three parallel mechanisms. Rejected in favor of one source of truth, which also unlocks dirty-tracking and future features cheaply.

### D2 — Active patch drives power-on (replaces hardcoded reset)

Replace `App.svelte`'s power-on `ccExternalValues = {...DEFAULTS}; resetCounter++` with: maintain an `activePatch` (the last loaded patch, defaulting to factory `DEFAULTS`). On power-on, apply `activePatch` to the store (which drives both UI and DSP). Factory defaults become simply the initial `activePatch`, so "reset to defaults" and "load a patch" are the same code path with different data.

- When **powered on**, loading a patch applies it to the store immediately (UI animates, DSP updates).
- When **powered off**, loading stashes the patch as `activePatch`; it is applied on the next power-on. (Knobs remain at their power-off rest positions while off, per `knob-power-state`.)
- The numeric `reset` prop and its per-component `$effect` are removed; their job is now "apply the active patch via the store."

*Alternative considered — load only when powered on:* simpler, but contradicts the chosen "load anytime" UX and the natural reading of a power-on that honors the user's selected sound. Rejected.

### D3 — Persistence: `localStorage` named slots

- Index key `synth-d:patches` holds a JSON array of patch names (cheap listing without scanning all of `localStorage`).
- Each patch is stored at `synth-d:patch:<name>` as JSON of the in-scope params only.
- A small persistence module exposes `listPatches()`, `savePatch(name, data)`, `loadPatch(name)`, `deletePatch(name)`, keeping the index and slots consistent. All `localStorage` access is wrapped so quota/parse/availability errors are handled, not thrown into the UI.
- The serialized shape is a flat `{ param: value }` map plus a small envelope (e.g. `{ name, version, params }`) so future schema changes can migrate.

*Alternative considered — single blob holding all patches:* one read/write, but rewrites everything on each save and complicates partial corruption recovery. Named slots + index keep each save isolated.

### D4 — UI: header PATCH popover

A `PatchControl.svelte` in the header (sibling to `MidiStatus`/`PowerButton`, outside the `inert` `<main>` so it works while powered off). Trigger shows `PATCH: <name> *` (the `*` is the dirty marker). Click opens a popover:

- **List** of saved patches; the active one marked `▸`. Each row has a load affordance and a delete (`⌫`) that flips to an **inline** "delete? ✓ ✕" confirm — never one-click, since delete is irreversible.
- **Inline name field** prefilled with the active patch's name, and a **SAVE** button. This collapses Save vs. Save As: SAVE writes under the field's name; if the name matches an existing patch, an **inline** "Overwrite <name>?" confirm appears; editing the name forks a new patch.
- **Empty state:** "no patches saved yet" above the name field.
- Styling mirrors `MidiStatus.svelte`'s dark native-control idiom. No `window.prompt`/`confirm`.

**Dirty tracking:** dirty = serialized current in-scope state ≠ the saved slot for the active patch (string compare). Drives the `*` marker.

**Name validation:** trim; reject empty/whitespace-only; cap ~24 chars; a collision is not an error — it routes through the overwrite confirm.

**Load while dirty:** loads immediately and discards unsaved tweaks (the `*` already signaled them). No confirm in this change; revisit if it proves painful.

## Risks / Trade-offs

- **[Large refactor surface]** The store touches every panel component, `Knob`, `App.svelte`, and their tests, under a ≥85% mutation gate. → Sequence the store refactor as its own task section(s), landed and fully green (vitest + stryker + playwright) **before** any persistence/UI work is layered on. Preserve `externalValue` on knobs to minimize the change to knob-related specs/tests.
- **[R2 — MIDI ⇄ store ⇄ DSP feedback loop]** A naive "store change → setParam" plus "MIDI → store" plus "knob onchange → store" can double-fire or loop. → Define one clear write path: interactions and MIDI write the store; the store is the *only* thing that calls `setParam`; knob `onchange` updates the store but the store→knob `externalValue` must not re-trigger a redundant `setParam`/`onchange` (guard on value equality, reuse the existing not-while-dragging guard).
- **[Behavior regressions]** Power-on/off knob animation, "DSP and UI agree from first sample," and discrete reset are spec-locked (`power-on-reset`, `knob-power-state`, `knob-spring-reset`). → Treat their existing scenarios as a regression checklist; update only the `power-on-reset` requirements that genuinely change (target = active patch, reset mechanism = store), keep the rest passing.
- **[localStorage limits/availability]** Quota, private-mode restrictions, or corrupt JSON. → Wrap all access; on read failure treat a slot as absent and surface a non-fatal message; never let persistence errors break audio.
- **[Name collisions / unsafe names in keys]** Arbitrary names become key suffixes. → Validate/trim/cap length; the index array is the authority for what exists, so a stray key cannot create a phantom entry.

## Migration Plan

No data migration (net-new persistence). Rollout is internal: land the store refactor section first (no user-visible change, all tests green), then power-on-applies-active-patch, then persistence, then UI, then E2E. The patch envelope carries a `version` field so future schema changes can migrate old slots. Rollback = revert the branch; no persisted data depends on it for the synth to function (absence of patches = factory defaults).

## Refinements during implementation

These decisions were made while building the feature and are reflected in the specs:

- **All-caps names.** Patch names are normalized to upper-case in `validateName` and capped at 24 chars, so they are stored, listed, and displayed consistently and names differing only by case resolve to the same patch. Patches persisted under an earlier non-upper-case name are migrated to upper-case lazily when the list is read (so they stay operable). The name/rename inputs render upper-case via CSS.
- **Save requires power.** The name field and SAVE are disabled while powered off (saving captures the live sound); listing, loading, renaming, and deleting remain available off. The no-patch trigger label is `DEFAULT`.
- **In-place update vs overwrite.** Saving the active patch's own name updates it silently; a different existing name routes through the inline overwrite confirm. Rename uses the same overwrite-confirm idiom.
- **Keyboard submit + note guard.** Enter in the name field saves; Enter in the rename field confirms. The QWERTY-to-note handler ignores keystrokes whose target is an editable field, so typing a name never plays notes.
- **Delete affordance.** Per-row delete uses an `✕` glyph (sized to match the rename `✎`) with a tooltip, behind the inline confirm.
- **Click-outside close** is detected on `pointerdown` (not `click`) so an in-popover control that re-renders and detaches its own target (rename/delete confirm) does not falsely close the popover.
- **Factory default consistency.** `ampRelease` defaults to `0.5` to equal `ampDecay`, because the decay/release lock defaults on and slaves release to decay; otherwise the active patch read as dirty the instant the synth powered on.
- **Header placement.** The patch control is stacked under the MIDI status, right-aligned, with the power button to the right.

## Open Questions

- None blocking. Possible later follow-ups (explicitly out of scope here): real `.json` export/import, factory presets, and a "discard unsaved changes?" confirm on load-while-dirty if users report lost tweaks.
