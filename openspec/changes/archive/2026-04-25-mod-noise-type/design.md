## Context

In `faust/synth.dsp`, `noiseSrc` is already defined for the mixer:

```
noiseSrc = select2(int(noiseType), no.noise, no.pink_noise);
```

But the modulation blend line beneath it uses a fresh `no.noise` call instead:

```
modSrc = osc3Signal * (1 - modMix) + no.noise * modMix;
```

`noiseSrc` is in scope at the point `modSrc` is computed — the fix is a single identifier substitution.

## Goals / Non-Goals

**Goals:**
- Modulation noise uses the same white/pink selection as the mixer noise

**Non-Goals:**
- A separate noise-type selector for modulation (one global selector is intentional)
- Any changes to noise level, mod depth, routing switches, or UI

## Decisions

### Reuse `noiseSrc` directly — no new parameter

**Decision:** Substitute `noiseSrc` for `no.noise` in `modSrc`. No new FAUST parameter, no UI control.

**Rationale:** A separate mod-noise-type toggle would add UI complexity for marginal benefit. The existing `noiseType` switch already expresses the user's intent — pink or white — and applying it consistently across both noise consumers (mixer and mod) is the expected behaviour.

**Alternatives considered:**
- Separate `modNoiseType` nentry — rejected: doubles the number of noise-type controls with no clear use case for wanting different types in each path simultaneously
- Always use white for mod — rejected: that's the current bug

### `noiseSrc` ordering — mixer definition comes first

`noiseSrc` is defined in the Mixer section of the DSP file, above the Modulation section where `modSrc` appears. No reordering is needed.

## Risks / Trade-offs

- **Existing presets/defaults are unaffected** — `noiseType` defaults to 0 (white noise), so the default behaviour is identical to before.
- **WASM rebuild required** — any DSP change requires running `npm run faust:build` and committing the regenerated `public/synth.wasm` and `public/synth.js` artifacts.
- **Minimal risk** — this is a one-token change in a well-understood expression with no structural side effects.

## Open Questions

None.
