## Context

synth-d began as a single subtractive synth but its architecture is already parameter-store-driven: a central store (`src/state/synth.svelte.js`) is the single source of truth for the sound; user interaction, MIDI CC, patch loads, and power-on all write to it, and it is the sole driver of `engine.setParam('/synth/' + name)`. The UI reads the same store; keyboard, MIDI, pitch-bend, and patch storage all route through it. The engine (`src/audio/engine.js`) talks to the FAUST DSP through a tiny, instrument-independent contract: note params `freq`/`gate`, the controller param `modWheel`, and the meter readbacks `mixerPeak`/`outputPeak`. **Everything else is parameter-schema-driven.**

That means the boundary between the reusable *chassis* and the specific *instrument* already exists logically — the seam **is the parameter schema**. It is only entangled physically, at two points:

1. **The schema is smeared across two files.** Defaults live in `state/synth.svelte.js` (`CONTINUOUS_DEFAULTS` + `SWITCH_DEFAULTS`); ranges and bipolar flags live in `App.svelte`'s `<script module>` (`KNOB_PARAMS` + `BIPOLAR_PARAMS`). They must be kept in sync by hand.
2. **`App.svelte` mixes the generic shell with the instrument's panel layout.** The header, power button, MIDI wiring, keyboard row, wheel/scope plumbing, and store seeding are generic; the `<panels>` grid (Oscillator/Mixer/Filter/AmpEnv/Effects/Modulation/Glide) is purely subtractive.

This change is **Phase 1 of a two-phase effort**. Phase 1 (this change, in the synth-d repo) makes the seam explicit with no behavior change. Phase 2 (`extract-workflow-kernel`, a separate later proposal in a **new** repo) promotes the now-clean chassis into a reusable kernel preset. Phase 2 is specified here so the vision is captured in one place, but it is **not implemented by this change** and cannot begin until Phase 1 has merged (it copies the refactored chassis).

### The tier map (current `src/`)

```
TIER 2 — GENERIC CHASSIS (reusable; instrument-agnostic after this change)
  audio/   engine · keyboard · math · midi · midiCcMap · pitchbend ·
           wheelPhysics · wheelPhysicsStore
  state/   synth.svelte.js          (machinery only; defaults become derived)
  patches/ storage.js               (generic CRUD; `synth-d:` namespace = identity)
  comp/    Knob · Wheel · WheelsPanel · Keyboard(+harness) · PowerButton ·
           MidiStatus · PatchControl · Scope · LevelLed · EmptyPanel ·
           RegisterPanel
  App.svelte shell  (header · power · MIDI wiring · keyboard row · store seed)

TIER 3 — INSTRUMENT (subtractive; stays in the synth-d repo)
  audio/   filterGains.js           (SEM LP/BP/HP morph; currently imported only by its test)
  comp/    Oscillator · Mixer · Filter · AmpEnv · Effects · Modulation · Glide
  comp/    Volume.svelte            (hardcodes masterVol; currently unused dead code)
  schema   the param literals (to be consolidated into src/param-schema.js)
  faust/   synth.dsp
  App.svelte <panels> layout
```

**Tier classification notes (resolved during review):** `RegisterPanel` is chassis — it is Shell-internal keyboard-row state (`activeRegister`/`keyboardBase`), not contract surface. `Volume.svelte` is **Tier 3**: it hardcodes the instrument param `masterVol` and is not imported anywhere (dead code) — classifying it as chassis would violate D4, so it stays instrument-side (and may simply be deleted as part of instrument cleanup). `masterVol` stays instrument-side: it is defined in the schema and rendered inside the `AmpEnv` instrument panel, so it raises no purity issue.

## Goals / Non-Goals

**Goals:**

- Consolidate the parameter schema into one instrument-owned module, `src/param-schema.js`, as the single source of truth: `name → { min, max, default, bipolar, kind: 'knob' | 'switch' }`.
- Make `state/synth.svelte.js` and `App.svelte`'s knob metadata **derive** from the schema instead of holding duplicate literals.
- Split `App.svelte` into a generic `Shell` (no instrument knowledge) and an instrument-supplied panel layout.
- Make explicit and enforce the contract that the chassis couples to the instrument only via (a) the schema and (b) the universal engine params `freq`/`gate`/`modWheel`/`mixerPeak`/`outputPeak`.
- Preserve behavior exactly: the existing `vitest` + `stryker` + `playwright` suites are the regression gate and must pass with assertion changes limited to import paths.

**Non-Goals:**

- No new instrument and no new DSP. The subtractive sound is unchanged.
- No creation of the kernel repo, presets, or sync/setup scripts (that is Phase 2).
- No generalization of the chassis↔DSP interface beyond the param-schema seam (e.g. dynamically generated panels from the schema). Panels stay hand-authored; only the schema and shell/instrument split are addressed. Schema-driven panel generation is a possible future change, explicitly out of scope.
- No identity rename of the `synth-d:` localStorage namespace here — it is flagged as a chassis parameterization point for Phase 2, not changed now (renaming it would orphan existing users' saved patches and is a behavior change).

## Decisions

### D1 — The seam is the parameter schema, expressed as one module

`src/param-schema.js` exports an ordered map of parameter descriptors. Each descriptor carries everything the chassis needs to treat the parameter generically:

```
{ min, max, default, bipolar: boolean, kind: 'knob' | 'switch' }
```

Derived values computed once from the schema (replacing today's hand-maintained literals):

- `PARAM_DEFAULTS` / `PARAM_NAMES` / `AUDIO_PARAMS` (currently in `state/synth.svelte.js`).
- `KNOB_PARAMS` (min/max), `BIPOLAR_PARAMS`, and `powerOffValue(p)` (currently in `App.svelte`). `powerOffValue` becomes: bipolar → midpoint, else → min — derived from the descriptor.

**Why one module over keeping two synchronized tables:** the duplication is the entanglement. A single source removes the manual-sync hazard (a real past footgun: a default that disagreed with a range), and it is the exact artifact Phase 2's `new-synth.sh` will swap to define a different instrument. **Alternative considered:** generate the schema from FAUST DSP metadata at build time. Rejected for now — it couples the schema to FAUST specifics and expands scope; the hand-authored module is the minimal seam and stays stack-portable.

`param-schema.js` is classified Tier 3 (instrument-owned — a different instrument supplies a different schema), but it is **the one sanctioned cross-tier import**: chassis code (the store, the Shell's CC-scaling and power-off logic) imports `KNOB_PARAMS`, `powerOffValue`, and the store-membership sets *from the schema module by design*. It is the contract interface both tiers depend on — instrument-owned, chassis-consumed — not a tier-boundary violation. The chassis-purity test (D4) therefore forbids chassis imports of every Tier-3 module *except* `param-schema.js`.

### D2 — `kind: 'knob' | 'switch' | 'controller'`, with CC-scalability as a separate flag

The store today separates `CONTINUOUS_DEFAULTS` (knobs) from `SWITCH_DEFAULTS` (toggles/steppers). Rather than carry that split forward as two structures, each descriptor declares its `kind`. **Why:** one collection keeps ordering and lookup uniform and avoids a second source of "which list is a param in?"

Two derivations depend on more than `kind`, and conflating them is a trap (the review caught this):

- **Store membership** (`PARAM_DEFAULTS` / `PARAM_NAMES` / `AUDIO_PARAMS`, i.e. what is patchable and forwarded by the store) = descriptors with `kind ∈ { 'knob', 'switch' }`. `'controller'` (see D6) is excluded.
- **`KNOB_PARAMS` / CC-scalable set** is **not** `kind === 'knob'`. `keyTrack` is a `'switch'` (a 0/1 toggle) yet is MIDI-CC-assignable and so appears in today's `KNOB_PARAMS`; `modWheel` is a `'controller'` yet also CC-scalable. So descriptors carry an explicit `ccScalable: boolean`, and `KNOB_PARAMS` is derived from `ccScalable === true` (all knobs + `keyTrack` + `modWheel`), independent of `kind`. Pure switches (waveforms, ranges, routing toggles) are `ccScalable: false`.

`min`/`max` are required for any `ccScalable` descriptor (they are the scaling bounds) and present on switches only where meaningful.

### D3 — `Shell.svelte` (generic) + instrument panel layout (instrument-owned)

Extract a `Shell.svelte` that owns the application frame and everything instrument-independent: header/title/version, GitHub link, power button + power lifecycle, MIDI manager wiring and status, keyboard row (Keyboard + WheelsPanel + RegisterPanel), scope, store seeding, and the param/wheel change chokepoints. The Shell renders the instrument panels via a slot / child, and exposes the chassis callbacks (`onParamChange`, `onKnobContextMenu`, the per-knob `midiState` helper) to them.

The subtractive panel grid (`<div class="panels">` … Oscillator/Mixer/Filter/AmpEnv/Effects/Modulation/Glide …) moves into an instrument-owned layout component (e.g. `SubtractivePanels.svelte`) that the Shell hosts. The current top-level `App.svelte` becomes a thin composition: `Shell` wrapping the instrument panels.

**Why a slot/children boundary over the Shell importing panels directly:** the Shell must contain *no* instrument imports for the chassis to be liftable in Phase 2. Inversion of control (instrument is injected into the Shell) is what makes the Shell genuinely instrument-agnostic. **Alternative considered:** a registry/config object describing panels. Rejected as over-engineering for one instrument; the slot boundary is the minimal thing that proves the seam.

**The Shell→panels contract** (the data/callbacks crossing the slot boundary; surface to confirm against `App.svelte` during task 4.1, names not yet final):

- **Callbacks:** `onParamChange({ param, value })` and `onKnobContextMenu(param)` — the chassis chokepoints panels already call.
- **`midiStateFor` as an exposed function, not pre-computed state:** the Shell owns the param-name-_agnostic_ `midiStateFor(...)` helper, which closes over the reactive Shell-owned sources (`synthParams`, `powered`, `learningParam`, `midiCcMap`) and returns `{ externalValue, learningMidi, assignedCc }` for whatever param names it is called with. It is passed to the instrument layout as a function; see D4 for why the _invocations_ (which name instrument params) must live on the instrument side.
- **Current switch/param values:** the discrete `synthParams.*` values panels bind to (e.g. `osc1Wave`, `noiseType`, `drLock`, routing toggles) — read by the instrument layout from the store, not threaded individually through the Shell.
- **Meter readbacks:** `getMixerPeak` / `getOutputPeak` functions passed to Mixer/AmpEnv.
- **Power state:** the `powered` flag panels use for dimming/metering.

These are the *categories* of the boundary; the chassis owns all the *mechanisms* and the instrument layout supplies the *param names*. `activeRegister`/`keyboardBase` and the `RegisterPanel` `ondown`/`onup` callbacks are **Shell-internal** state (the register panel is part of the chassis keyboard row), not contract surface — they do not cross the boundary. Note `KNOB_PARAMS` is currently module-_private_ in `App.svelte` (not exported), so the schema consolidation removes a maintenance hazard between two files rather than changing any public import for that symbol; of the exported metadata, only `powerOffValue` has an external (test) importer (`App.test.js`) — `BIPOLAR_PARAMS` has none.

### D4 — Universal engine param contract is named and asserted

The chassis legitimately knows five instrument-independent param names: `freq`, `gate`, `modWheel`, `mixerPeak`, `outputPeak`. These are documented as the **universal engine contract** and are the *only* literal param names permitted in chassis code. Everything else flows through the schema. A lightweight test asserts the chassis modules reference no instrument-specific param name literally (guards against re-entanglement and is the executable form of the `chassis-architecture` capability).

**Consequence for the per-knob `$derived` MIDI state (resolved here, not at implementation time):** today `App.svelte` builds `oscMidiState = $derived(midiStateFor('osc2Detune', 'osc3Detune', …))` and one such block per panel. Those param-name literals are instrument-specific, so the `$derived` blocks **must live in the instrument layout (`SubtractivePanels`), not in the `Shell`** — otherwise the Shell would carry instrument param names and fail the D4 purity test. The split is therefore: the Shell exposes the param-name-agnostic `midiStateFor` function (D3); the instrument layout owns the `$derived` per-panel computations that call it with the instrument's own param names. Reactivity is preserved because `midiStateFor` reads the Shell-owned reactive sources (`synthParams`, `powered`, `learningParam`, `midiCcMap`) *at call time*, inside the instrument layout's `$derived`, so Svelte's dependency graph still tracks them across the function boundary. This keeps every instrument param-name literal on the instrument side of the seam — which is exactly what makes the purity test pass without an exception.

**`MidiCcMap` rename table relocated (discovered at implementation, resolved with the human):** the chassis `audio/midiCcMap.js` held an instrument-specific migration literal — `PARAM_RENAMES = { reverbMix: 'reverbSend' }`, the load-time translation of persisted CC mappings — which the D4 purity test correctly flags as instrument coupling. Rather than allowlist it (which would let the chassis keep an instrument param name and only make the test *appear* to pass), `PARAM_RENAMES` moves to the instrument-owned `param-schema.js`, and `MidiCcMap` becomes param-name-agnostic, taking the rename table via its constructor (defaulting to none). The `Shell` injects it as `new MidiCcMap(PARAM_RENAMES)`, importing `PARAM_RENAMES` from the schema (the sanctioned cross-tier import of D1), so neither the chassis `MidiCcMap` nor the `Shell` carries the literal. The four rename tests in `midiCcMap.test.js` were updated to pass the table explicitly — a constructor-signature change, not a weakened assertion (the D5 "import-paths-only" rule is relaxed here by explicit human approval, because making the chassis genuinely pure is what the `chassis-architecture` capability requires).

### D5 — Pure refactor; tests are the contract

No behavior changes. Because the store re-exports `PARAM_DEFAULTS`/`PARAM_NAMES`/`AUDIO_PARAMS` (D1/task 2.1), their import paths are unchanged; the **only** import-path update is `powerOffValue` (now in the schema module) in `App.test.js`. `KNOB_PARAMS` and `BIPOLAR_PARAMS` have no external importers. Mutation score (≥85%) and E2E must hold. If any test's *assertion* (not import) needs to change to pass, that is a signal the refactor altered behavior and must be corrected, not accommodated.

### D6 — `modWheel` is a `controller`: CC-scalable but not store-backed

`modWheel` straddles the seam today: it has a CC range (it lives in `KNOB_PARAMS`) but it is deliberately **not** a store parameter — it is performance/controller state, excluded from patches, owned by the app, and pushed straight to the DSP via `engine.setParam('/synth/modWheel')`. The schema must preserve this exactly or behavior changes.

Decision: `modWheel` gets a schema descriptor with `kind: 'controller'` and `ccScalable: true`. Per D2, `'controller'` is excluded from `PARAM_DEFAULTS` / `PARAM_NAMES` / `AUDIO_PARAMS` (so patches and store forwarding are unaffected) but included in the `ccScalable`-derived `KNOB_PARAMS` (so CC 1 → `modWheel` scaling still resolves its range from the schema). **Why model it in the schema at all rather than leave it a chassis constant:** its CC range is instrument-facing metadata that belongs with the other parameter metadata, and keeping the one CC-scaling table single-sourced is the whole point of D1. The equality gate (task 1.3) asserts `modWheel` is absent from `PARAM_DEFAULTS`/`PARAM_NAMES`/`AUDIO_PARAMS` and present in `KNOB_PARAMS`, exactly as before.

**Alternative considered:** keep `modWheel` entirely outside the schema and union it into `KNOB_PARAMS` separately. Rejected — it reintroduces a second CC-range source, the exact duplication D1 removes.

### Phase 2 — `extract-workflow-kernel` (design captured here; separate proposal, NEW repo)

> Not implemented by this change. Cannot start until Phase 1 merges (it copies the refactored chassis). Recorded here so the two-phase vision lives in one place.

- **New repo, carved fresh** (decided) for the stack-agnostic workflow kernel: `CLAUDE.md`, `.claude/commands` + `.claude/skills`, `scripts/opsx-*`, `.githooks`, `.roborev.toml`, `.github/workflows`, release-please config/manifest. Carved fresh rather than stripped from synth-d so synth-d keeps its full git history.
- **Three tiers, three homes:** Tier 1 (kernel, stack-agnostic) lives in the kernel repo; Tier 2 (chassis, Svelte/FAUST, instrument-agnostic) is **Option A** — the kernel repo holds the workflow **plus** `presets/svelte-faust-synth/` containing the Phase-1 chassis; Tier 3 (instrument) stays in each synth repo.
- **Three scripts:**
  - `new-synth.sh` (in kernel repo) — generator: emit a fresh synth = copy Tier 1 + the chosen `--preset` chassis, blank Tier 3, reset version → `0.1.0`, empty `changes/`, rename package + `synth-d:` namespace, `git init`.
  - `sync-kernel.sh` (in each synth) — re-pull Tier 1 + kernel specs via a manifest. Must include **clobber protection** for locally-modified synced files and a **kernel-version stamp**, so a sync is a deliberate bump (X→Y with a changelog), not an unbounded pull of HEAD.
  - `setup.sh` (in each synth) — idempotent, with a `--check` mode CI reuses. *Does* the repo-local deterministic work (`npm ci`, FAUST build, install hooks, set `core.hooksPath`); *verifies* global prereqs (`faust`, `gh`, `openspec`, `roborev`, node per `.nvmrc`) and instructs the human rather than auto-installing. `postinstall` stays thin (hooks only).
- **`openspec/` partitioning:** `config.yaml` travels verbatim; `changes/archive/` **never** travels (project-local history); `specs/` split three ways by a frontmatter `tier: kernel | stack | instrument` tag plus a generated manifest — kernel specs are synced (owned upstream), stack/chassis specs are seeded at bootstrap, instrument specs are project-local. A new synth starts with kernel + chassis specs present but `changes/` empty. This partitioning rule itself becomes part of the `workflow-kernel-structure` spec.
- **Kernel repo self-test:** the kernel repo has no instrument suite, so CI runs a **smoke-synth** fixture: `new-synth.sh` → `setup.sh --check` → build, proving the generator emits a working repo.
- **synth-d becomes the first consumer** of the kernel (retrofit to `sync-kernel.sh`), never a second diverging donor.
- **Divergence lifecycle** (the vendored-copy hazards) — sync-back/contribution path, clobber protection, kernel versioning — are first-class Phase-2 design concerns, not afterthoughts.

## Risks / Trade-offs

- **Hidden behavior change during refactor** → The existing `vitest` + `stryker` + `playwright` suites are the gate; D5 mandates that only import paths may change in tests. Mutation score (≥85%) catches silent logic drift. Run the full suite before the completion gate, not just unit tests.
- **Schema descriptor shape misses a case** (e.g. a switch that also needs min/max, or `powerOffValue`'s bipolar/midpoint rule) → Derive every currently-hand-maintained value from the schema and diff against today's literals (`PARAM_DEFAULTS`, `KNOB_PARAMS`, `BIPOLAR_PARAMS`, `powerOffValue` outputs) for exact equality before deleting the originals.
- **Shell slot boundary leaks an instrument import** → D4's chassis-purity test fails the build if a chassis module names an instrument param; code review checks the Shell has no Tier-3 imports.
- **Scope creep into Phase 2** → Phase 2 is design-only here. Any kernel-repo, script, or preset work is out of scope and must be rejected from this change's PR.
- **`synth-d:` namespace left un-parameterized** → Intentional (renaming is a behavior change that orphans saved patches). Flagged as a Phase-2 chassis parameterization point; documented, not changed.
- **CSS/layout coupling across the Shell split** → Svelte component styles are scoped by default, so moving the `<panels>` grid into `SubtractivePanels.svelte` and the frame into `Shell.svelte` could break layout if `App.svelte` holds `:global` rules or layout CSS the panels rely on (e.g. the `--knob-body-size` custom property set on `.app`). Mitigation: inventory `App.svelte`'s `<style>` for `:global` and inherited custom properties before the split; move each rule to whichever of Shell/panels owns its markup, and keep shared custom properties on the Shell's root. Task 4.4's pixel-identical check is the gate. (HMR note: splitting the module graph may broaden Vite HMR invalidation on Shell edits — a developer-experience nuance, not a correctness risk.)

## Migration Plan

This is an in-repo refactor with no runtime/data migration. Rollback is reverting the branch. Sequencing within the change: introduce `param-schema.js` and make the store + `App.svelte` derive from it (verify equality), then extract `Shell.svelte` and the instrument panel layout, then add the chassis-purity test — committing per task so each step stays independently reviewable and revertible.

## Open Questions

- Exact module/file names (`Shell.svelte`, `SubtractivePanels.svelte`, `param-schema.js`) — naming to be finalized in tasks; not load-bearing for the design.
- (The earlier open questions on `Volume.svelte`, `RegisterPanel.svelte`, and `masterVol` classification are now resolved — see the tier classification notes above.) Should a future change want a generic master-volume control in the chassis frame, that would require promoting `masterVol` into the universal engine contract (every instrument's schema would then declare it); out of scope here and noted only so the option is on record.
