## Context

MIDI ships with three tightly-scoped modules — `MidiManager` (Web MIDI I/O + message parsing), `MidiCcMap` (CC ↔ parameter mapping with `localStorage` persistence), and `MidiStatus` (status indicator UI) — plus the App-level glue in `App.svelte` that wires CC learn mode and forwards messages to `engine.setParam`. Unit and component coverage is good for the inner modules but thin at the seams: spec scenarios for pitchbend deferral and the learn lifecycle have no executing test, MIDI math is excluded from Stryker, and Playwright never touches MIDI at all (so the App→engine wiring runs only in production).

The fake-MIDI mocking pattern is already proven in two shapes:

- `src/audio/midi.test.js` installs `navigator.requestMIDIAccess` via `Object.defineProperty` and dispatches `MIDIMessageEvent` shapes through a fake port's `onmidimessage`.
- `src/App.test.js` mocks the `MidiManager` class itself and captures the callbacks (`lastMidiCallbacks`) so tests can drive `onNoteOn`, `onStatusChange`, etc. without going through `requestMIDIAccess`.

Both are valid for their layer. The new work needs a third shape (a fake `requestMIDIAccess` installed via Playwright's `addInitScript` so it runs in the page context before `goto`), and a small refactor to extract pitchbend math into a pure module so Stryker can mutate it meaningfully.

## Goals / Non-Goals

**Goals:**
- Every requirement in the MIDI spec is exercised by at least one passing test.
- MIDI math (CC scaling, pitchbend) is under mutation testing at the same ≥85% bar as `math.js` / `filterGains.js` / `keyboard.js`.
- CI runs an end-to-end MIDI smoke test that does not depend on WASM or audio hardware.
- Mock setup is consistent enough that adding the next MIDI test (any layer) is a one-import job.

**Non-Goals:**
- Changing any runtime MIDI behavior. The pitchbend extraction is a structural refactor; behavior must be byte-for-byte identical.
- Audio assertions in E2E. Playwright stays at the DOM/state layer; AudioContext correctness remains a unit-test concern.
- Adding MIDI features (no learn-mode UI changes, no SysEx, no MIDI output).
- Replacing the existing `MidiManager` class-mock in `App.test.js` with the lower-level fake. The class mock is the right abstraction for App-level tests; we widen it, not replace it.

## Decisions

### Decision 1: Extract pitchbend math into `src/audio/pitchbend.js`

Pitchbend math currently lives inline in `MidiManager._pitchBend` and `_bentFreq` ([src/audio/midi.js:166-177](src/audio/midi.js#L166-L177)). Extract two pure functions:

```js
// src/audio/pitchbend.js
export function parseBend(raw)      { return ((raw - 8192) / 8192) * 2 }   // 14-bit → ±2 semitones
export function bentFreq(noteFreq, bendSemitones) {
  return noteFreq * Math.pow(2, bendSemitones / 12)
}
```

`MidiManager` becomes a thin caller. Stryker can then mutate the math without touching I/O wrapper code (which Stryker can't usefully mutate anyway).

**Alternative considered:** add `midi.js` to Stryker's mutate list whole. Rejected — `MidiManager` is mostly side-effectful I/O around `MIDIAccess`, callbacks, and listener attachment. Stryker would generate huge numbers of equivalent mutants in the I/O paths and produce a noisy report. Targeting only the pure math gives a meaningful score.

**Why centralize the bend constants too:** the `BEND_SEMITONES` and `BEND_CENTER` constants currently live in `midi.js`. Move them into `pitchbend.js` and re-export only what `MidiManager` needs. Single source of truth — and any change to bend range only touches one file.

### Decision 2: Three-layer MIDI mocking via shared helper

Today the same fake exists in three soon-to-be-three forms:

```
                                              installed via
                                              ─────────────
  unit  → fake MIDIAccess + ports             defineProperty(navigator, …)
  App   → mock MidiManager class itself        vi.mock('./audio/midi.js', …)
  E2E   → fake requestMIDIAccess + ports      page.addInitScript(…)
```

Extract a single helper module `src/audio/test-helpers/midi.js` exposing:

- `makeFakeMidiAccess(ports = [])` — returns the `{ inputs, onstatechange }` shape the spec uses.
- `makePort(id, name)` — fake `MIDIInput`-shaped object.
- `bytes(messageName, ...args)` — semantic helper, e.g. `bytes('noteOn', 60, 100)` returns `[0x90, 60, 100]`. Replaces the magic numbers scattered across current tests.
- `installFakeMidiOnNavigator(target)` — one call sets up `navigator.requestMIDIAccess` correctly, returns a teardown function. Works in both jsdom (`globalThis`) and in Playwright's page context (when serialized via `addInitScript`).

The class-level mock in `App.test.js` stays where it is (different abstraction: it bypasses `requestMIDIAccess` entirely and lets us drive callbacks directly). We just widen its captured callback type to include `onCc` and `onNoteOn`.

**Alternative considered:** unify on the class-level mock everywhere. Rejected — the unit tests in `midi.test.js` exist precisely to verify the message parsing inside `MidiManager`, which a class-level mock would short-circuit. Layering the mocks correctly is the point.

### Decision 3: Playwright fake via `addInitScript`, no Web MIDI Test API

Chromium has a Web MIDI Test API behind a flag (`--enable-blink-features=MIDIManagerInterface`) that simulates real-shaped device events. We are not using it.

**Why:** the test API requires a launch-flag config in `playwright.config.js`, which couples the test infrastructure to a Chromium-only feature flag. `addInitScript` works in every Playwright browser, has no flag dependency, and gives us complete control over what events fire and when. The trade-off is that we're testing against our fake's shape rather than Chromium's, but the unit tests already cover real `MIDIMessageEvent` parsing — the E2E job is to verify wiring, not parsing.

**Pattern:**

```js
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const port = { id: 'fake', name: 'Fake MIDI', type: 'input', state: 'connected', onmidimessage: null }
    const access = { inputs: new Map([['fake', port]]), onstatechange: null }
    window.__fakeMidi = {
      port,
      send: (bytes) => port.onmidimessage?.({ data: new Uint8Array(bytes) }),
    }
    navigator.requestMIDIAccess = async () => access
  })
})

// In a test:
await page.evaluate(() => window.__fakeMidi.send([0x90, 60, 100]))
```

### Decision 4: E2E MIDI specs run in CI (do not gate on `wasmBuilt`)

The existing powered-audio specs in [e2e/synth.spec.js:8-9,93-94](e2e/synth.spec.js#L8-L9) skip in CI because headless Chromium has no audio hardware. MIDI E2E specs do not need the AudioWorklet path — they only need DOM updates that flow from the MIDI callbacks. They run unconditionally in CI.

This means all assertions in the new E2E file must be DOM-only (key `.active` class, `.dot.active`, knob CC label visibility). No `engine.setParam` checks, no `AudioContext.state` checks.

**Implementation note (added during apply).** As written, [App.svelte](src/App.svelte) called `midiManager.connect()` *inside* `handleToggle`'s try block, after `await powerOn()`. In CI, `powerOn()` throws (no audio hardware), the catch fires, and `midiManager.connect()` never runs. The MIDI status indicator stays `'unavailable'` and every E2E assertion times out — the design goal of "runs unconditionally in CI" was unreachable without a small runtime adjustment.

Resolution: `midiManager.connect()` moved into `onMount`; `midiManager.destroy()` moved out of the power-off path (it remains in `onDestroy`). MIDI now lives for the full app lifetime, independent of audio. `setParam`/`noteOn`/`noteOff` already guard on `!node`, so MIDI events while powered-off are no-ops. This is the only runtime change in the branch and is recorded in the proposal's Impact section.

### Decision 5: Spec change shape — modify one, add one

The current testing spec's mutation-testing requirement at [openspec/specs/testing/spec.md:121-150](openspec/specs/testing/spec.md#L121-L150) lists the targeted modules. Per OpenSpec rules, MODIFIED requirements MUST include the full updated content — so the delta will copy the entire block and add `midiCcMap.js` and `pitchbend.js` to the listed modules and add corresponding scenarios.

The Playwright MIDI requirement is genuinely new (the existing Playwright requirement at [openspec/specs/testing/spec.md:154-167](openspec/specs/testing/spec.md#L154-L167) is scoped to "AudioContext starts after click" / "Key press activates highlight" — different surface). It goes in as ADDED, not MODIFIED.

**No changes to the MIDI spec.** Every new test verifies an existing requirement. If we found ourselves writing a new MIDI requirement to support a test, that would be a sign the test is out of scope.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Pitchbend extraction subtly changes behavior (e.g. floating-point rounding order) → silent regression in production | Keep the extracted functions byte-for-byte equivalent; verify via the existing `pitchbend up` / `pitchbend center` tests in `midi.test.js` continuing to pass unchanged before any new tests are added. |
| Stryker on `pitchbend.js` produces equivalent mutants (e.g., `* 1` in `Math.pow(2, bend / 12)` when bend is 0) and bloats the report | Acceptable. Equivalent mutants are a known Stryker limitation; the score floor (≥85%) accounts for them. If the floor proves unreachable on `pitchbend.js`, we adjust the threshold for that file specifically rather than weakening the test. |
| Three mocking shapes lead to drift between unit, App, and E2E layers (a fix to the unit fake doesn't propagate) | The `test-helpers/midi.js` module is the single source for fake-port construction and byte builders; the App class-mock and E2E init script both consume the helper rather than redefining shapes inline. |
| `addInitScript` runs before every navigation, including ones triggered mid-test → the fake is reinstalled and any state captured in `window.__fakeMidi` is lost | Tests in this file always call `page.goto('/')` exactly once and never reload. If a future test needs persistence across navigation, capture the state in test scope rather than on `window`. |
| New E2E specs flake under CI load (timing of `requestMIDIAccess` resolution vs. App's `connect()` call) | Use Playwright's `expect(...).toBeVisible({ timeout })` rather than fixed waits. The fake's `requestMIDIAccess` is synchronous-resolving so timing should be tight, but assertions tolerate up to 2s. |
| Adding `midiCcMap.js` to Stryker reveals weak coverage in `midiCcMap.test.js` (especially the rename-pass logic) | Treat surfaced failures as the system working — fix tests until score meets threshold. Document the score floor change in the testing spec delta if needed. |

## Migration Plan

This is test-only with one structural refactor. No deploy, no rollback strategy beyond `git revert` of the branch.

Sequencing within the branch:

1. **Tier 1 first** — adds tests against the current code shape. Builds confidence the existing implementation is correct before any refactor.
2. **Tier 2 second** — extracts `pitchbend.js`. The existing pitchbend tests in `midi.test.js` (which test through `MidiManager`) act as the safety net. Add `midiCcMap.js` and `pitchbend.js` to Stryker. Iterate on `midiCcMap.test.js` until mutation score ≥85%.
3. **Tier 3 third** — adds E2E. Cleanest commit because no production code changes.
4. **Tier 4 last** — extract the helper and migrate existing call sites. If scope pressure mounts, drop Tier 4 and leave the duplication; nothing else depends on it.

Each tier commits independently. Roborev will run on each commit per CLAUDE.md rules.

## Open Questions

- **Stryker config location:** the proposal mentions `stryker.config.json` but the actual file may be `stryker.conf.json`, `.stryker.conf.cjs`, or inline in `package.json`. Confirm at apply time and update tasks accordingly.
- **Mutation score floor on `pitchbend.js`:** `parseBend` and `bentFreq` are short enough that ≥85% may be either trivially achieved or surprisingly hard depending on equivalent mutants. If a per-file override is needed, decide whether to lower the floor for that file or strengthen the tests with edge-case scenarios (raw=0, raw=8191, raw=8193).
- **Tier 4 priority:** if Tier 1–3 takes longer than expected, is the Tier 4 helper extraction worth landing in this branch or deferring to a follow-up change? Default: include it. Override: human says drop.
