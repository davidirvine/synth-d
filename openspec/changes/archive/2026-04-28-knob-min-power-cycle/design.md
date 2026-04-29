## Context

`App.svelte` maintains a `ccExternalValues` reactive state object — a `Record<string, number|undefined>` — that is spread into each panel's `midiState` prop. Each panel passes the relevant entry to individual `Knob` components as `externalValue`. When `externalValue` changes the Knob's `$effect` applies it, fires `onchange`, and (when `springEnabled` is `true`) animates the indicator via the Svelte spring store.

Current initialisation:

```js
let ccExternalValues = $state(
  Object.fromEntries(
    Object.keys(DEFAULTS).map((p) => {
      const { min, max } = KNOB_PARAMS[p]
      return [p, min + Math.random() * (max - min)]  // ← random
    })
  )
)
```

Current power-off:

```js
ccExternalValues = {}  // ← externalValue becomes undefined; knobs freeze in place
```

The spring animation on power-on (via `knob-spring-reset`) sweeps from the pre-reset position (currently random) to `DEFAULTS`. The goal is that position to always be `min`, and for power-off to sweep back to `min` symmetrically.

## Goals / Non-Goals

**Goals:**

- All knobs render at `min` on page load (no random positions)
- Power-on spring sweep always starts from `min`, giving a consistent "powering up" effect
- Power-off triggers a spring sweep from current → `min`, giving a symmetric "powering down" effect
- No changes to `Knob.svelte`, panel components, or the audio engine

**Non-Goals:**

- Changing spring duration or easing parameters
- Animating power-off with a separate animation path (reuse the existing `externalValue` → spring mechanism)
- Persisting knob state across page reloads

## Decisions

### Use per-param min from KNOB_PARAMS for both init and power-off

`KNOB_PARAMS` already contains `{ min, max }` for every continuous parameter, and `DEFAULTS` keys are a strict subset of those. Computing the min map is a one-liner `Object.fromEntries(Object.keys(DEFAULTS).map(p => [p, KNOB_PARAMS[p].min]))`. Re-using this same expression for both the initial state and the power-off assignment avoids a new constant and keeps the two sites obviously parallel.

**Alternative considered:** introduce a `MINS` constant analogous to `DEFAULTS`. Rejected — it duplicates data that is already authoritative in `KNOB_PARAMS`.

### Power-off sets externalValue to min rather than undefined

Setting `ccExternalValues = {}` on power-off caused knobs to receive `externalValue = undefined`, which skips the `$effect` guard (`if (externalValue !== undefined && !dragging)`) and leaves indicators frozen. Setting each entry to `min` instead lets the existing `$effect` path handle the sweep, including the spring when `springEnabled` is `true`.

**Alternative considered:** add a dedicated `resetToMin` event or prop on Knob. Rejected — unnecessary indirection; the `externalValue` path already does exactly what is needed.

### onchange fires during power-off sweep; engine calls are benign

When `externalValue` changes, the Knob `$effect` calls `onchange`, which ultimately reaches `setParam` in the audio engine. On power-off, `powerOff()` is awaited before `ccExternalValues` is updated, so the engine is already stopped. Engine `setParam` calls after teardown are no-ops (the DSP worklet is detached). No guard is needed in `App.svelte`.

## Risks / Trade-offs

- [Risk]: Engine receives `setParam` calls for every knob during power-off sweep → Mitigation: `powerOff()` is awaited first; worklet is detached and calls are harmless no-ops.
- [Risk]: A future engine change could make post-teardown `setParam` throw → Mitigation: engine already guards against calls when uninitialised; if that changes, a single guard in `onParamChange` covers all cases.

## Migration Plan

Two-line change in `App.svelte`:

1. Replace random init expression with `KNOB_PARAMS[p].min`
2. Replace `ccExternalValues = {}` with min-valued object

No migration or rollback steps required — the change is purely visual (knob start positions) with no data persistence or API surface changes.
