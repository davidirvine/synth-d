## Context

Key-highlight state lives inside [Keyboard.svelte](src/components/Keyboard.svelte) as a local `activeKeys` SvelteSet. The component exposes private `_triggerNote` / `_releaseNote` functions to its parent via bind props, which [App.svelte](src/App.svelte) wires up to its MIDI input handler. The set is mutated only from inside Keyboard (mouse/touch handlers, QWERTY listener, and the bound MIDI hooks).

Power-off is orchestrated by `handleToggle()` in [App.svelte](src/App.svelte) (lines 214–236): it tears down `midiManager`, calls `engine.powerOff()` to disconnect the FAUST node and close the audio context, flips the `powered` flag, and resets MIDI/CC state. It does not touch `activeKeys`. As a result, any key that was held at the moment of power-off remains highlighted indefinitely, and `gate` retains its last value (which may be 1) inside the now-disconnected engine.

There is a symmetric capability `power-on-reset` that resets discrete and continuous parameters when power flips on. There is no analogous power-off-reset capability today; this change introduces the smallest necessary slice of one, scoped to the keyboard.

## Goals / Non-Goals

**Goals:**

- On power-off, every visible key on the on-screen keyboard returns to its un-highlighted state.
- The `activeKeys` set becomes empty on power-off, so a subsequent power-on starts from a clean slate.
- Gate is driven to 0 as part of the clear, mirroring the existing "all sources released → gate 0" requirement.

**Non-Goals:**

- Generalised power-off-reset for other panels (knobs, modulation, effects). Those are out of scope and would belong in a separate `power-off-reset` capability if ever needed.
- Changing how `activeKeys` is owned (e.g. lifting it into a store). The set stays inside Keyboard.svelte.
- Introducing any audible side effect at the moment of power-off — audio is already being suspended.

## Decisions

### Decision 1: Expose a `_releaseAll` binding from Keyboard, called by App.svelte's power-off branch

Mirror the existing `_triggerNote` / `_releaseNote` bind pattern: Keyboard exposes a `_releaseAll` function that clears `activeKeys` and runs the same release path as releasing the last held key (so `gate` → 0 via the existing "Shared active-key state" requirement). App.svelte stores the bound reference (e.g. `keyboardReleaseAll`) and invokes it from `handleToggle()` on the power-off branch, before `engine.powerOff()`.

**Alternatives considered:**

- _Lift `activeKeys` into a Svelte store owned by App.svelte._ Cleaner long-term ownership, but a much larger change touching every consumer of the set and unrelated to the bug. Rejected as scope creep for a bugfix.
- _Use a Svelte effect inside Keyboard that watches a `powered` prop and clears on the falling edge._ Plausible, but spreads the power-off side-effect path across two files (App.svelte tears down audio; Keyboard reacts to a prop). The bound-function approach keeps the side-effect path linear and visible in `handleToggle()`, matching how `midiManager.destroy()` and `engine.powerOff()` are already invoked.

### Decision 2: Clear before `engine.powerOff()`

Run `keyboardReleaseAll()` first, then `midiManager.destroy()`, then `engine.powerOff()`. The release-all path sets `gate` to 0, which is a parameter write to the still-live FAUST node — matches the existing "gate off when activeKeys empty" requirement and avoids writing to a disconnected node.

### Decision 3: Reuse the existing release path, do not bypass it

`_releaseAll` SHALL iterate or batch-clear via the same code path that `_releaseNote` uses for the final key (so `gate` → 0 fires via the established "all sources released" branch), rather than open-coding a separate "clear set + write gate" sequence. Keeps the single-source-of-truth invariant on what "released" means.

## Risks / Trade-offs

- **[Risk]** A future refactor moves `activeKeys` into a store and forgets to remove the `_releaseAll` binding. **Mitigation:** the new spec scenarios run as component/E2E tests; whichever ownership model wins must keep them green.
- **[Risk]** Holding a QWERTY key across a power-off → power-on cycle leaves the OS thinking the key is down; the next `keydown` only fires after the user physically releases and re-presses. **Mitigation:** this is the desired behavior — the spec scenario "Power-on after power-off with stuck physical input shows clean keyboard" makes it explicit so it cannot be mistaken for a regression.
- **[Trade-off]** Exposing a third bound function (`_releaseAll`) widens the Keyboard public surface slightly. Acceptable: it is symmetric with the existing two and the alternative (store ownership) is a much larger change.
