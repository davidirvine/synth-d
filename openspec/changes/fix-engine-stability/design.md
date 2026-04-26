## Context

Three independent problems converge here:

1. **Filter NaN crash**: `ve.moog_vcf(resonance, cutoff)` at `resonance=1.0` with a hot input signal (all oscillators + noise summed to ±4 amplitude) can overflow to `+Infinity` then `NaN`, which propagates through the Web Audio graph and silences the `AudioContext` permanently. The only recovery is a page reload.

2. **Dead context not recoverable**: `powerOff` calls `ctx.suspend()` and `powerOn` calls `ctx.resume()` when `initialized=true`. A crashed context has `state='closed'`, not `'suspended'`, so `ctx.resume()` does nothing. The power button becomes useless after a crash.

3. **UI/DSP param divergence**: The DSP boots with FAUST-compiled defaults. The UI knobs show their own initial values. These may not match, and they definitely don't match after a power cycle (since knob state persists in the Svelte component but the DSP resets on reinit).

## Goals / Non-Goals

**Goals:**
- Eliminate NaN generation in the signal chain
- Make power-off/on a reliable reset: always produces a known-good audio state
- Ensure UI and DSP param values agree from the first sample after power-on
- Give the user a tactile sense of reset via knob spring animation
- Replicate analog output stage saturation character at high master volume

**Non-Goals:**
- Persisting patch state across power cycles (out of scope — full reset is the intent)
- Changing any audio parameter ranges (that is phase 2, `tune-model-d-params`)
- Offline/background audio processing

## Decisions

**Pre-filter `ma.tanh` on mixer output**

The real Minimoog ladder's transistors soft-clip the input before it enters the filter stages. `ma.tanh(mixerOut)` limits the input to ±1, preventing the filter from receiving a signal large enough to overflow. Alternative: normalize mixer output by dividing by the number of active sources — rejected because it removes the analog character of hot-mixer overdrive.

**Resonance cap at 0.97**

`ve.moog_vcf` at `resonance=1.0` is a mathematical singularity. Capping at 0.97 allows audible self-oscillation while keeping the digital ladder numerically stable. The UI knob still goes to 1.0 — the cap is internal to the DSP, invisible to the user. Alternative: remap the resonance knob range — rejected because it would shift the feel of the control at all values.

**Output saturation: pre-effects, using a renamed `saturatedOut` signal**

The saturation sits between the VCA and the effects loop (delay, reverb). The VCA output is scaled and soft-clipped before entering the delay/reverb: `saturatedOut = vcaOut * (masterVol / 0.6) : ma.tanh`. The delay and reverb stages consume `saturatedOut` rather than a raw `masterOut`. This matches the signal flow of an analog desk where the output stage drive affects the signal going into the effects send.

Placing saturation pre-effects means delay feedback compounds with saturation character — heavy delay at high master volume produces progressively warmer repeats. This is intentional and musically desirable. Alternative: post-effects saturation (effects loop on clean signal, saturate only the final output) — considered but rejected because it would require duplicating the volume scaling step and complicates the effects send/return chain.

At 60% master vol the drive into `tanh` is 1.0 (unity — `tanh(1.0) ≈ 0.76`, a gentle gain reduction audible only on full-scale signals). At 100% vol the drive is 1.67 (noticeable warm clipping). The `tanh` output plateaus as drive increases — matching pushed-hard analog output stage behaviour. `ma.tanh` is always active; below 60% it operates near its linear region and produces no perceptible distortion. Alternative: blend saturated with dry to keep output growing linearly — rejected because the plateau is the desired character.

**Full teardown on power-off, full init on power-on**

`ctx.close()` permanently closes the `AudioContext`. The next power-on creates a fresh context, compiles the WASM, and builds the AudioWorklet node from scratch. This is the only path that guarantees recovery after a NaN crash. Startup latency (1–3 seconds) is acceptable per user confirmation.

**Reset prop (incrementing counter) on panel components**

Each panel component (`Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Modulation`, `Glide`, `Effects`) receives a `reset` numeric prop. A `$effect` inside each component watches for changes to `reset` and restores all internal discrete state to defaults, firing `onchange` for each param so App.svelte can flush them to the DSP. Counter-based (vs boolean toggle) allows multiple consecutive resets to fire correctly.

**Spring on Knob visual position for external value changes**

`svelte/motion`'s `spring` is applied to the derived `pos` value used for SVG rendering only. The logical `value` (used for `onchange`) updates immediately. During pointer drag, the spring is bypassed — the visual tracks the pointer directly. On `externalValue` change (MIDI or reset), the spring animates. Stiffness and damping are tuned so the sweep back to default completes in roughly 400–600ms.

**App.svelte DEFAULTS object as source of truth**

A `DEFAULTS` constant in App.svelte mirrors every continuous param's default value. On power-on, App.svelte pushes these through `ccExternalValues` (which flows to each knob's `externalValue` prop) and increments the `reset` counter for panels. This makes the reset path deterministic and testable.

## Risks / Trade-offs

- [WASM recompile required] DSP changes to `synth.dsp` require running `npm run faust:build`. The built WASM artifacts (`public/dsp-module.wasm`, `public/dsp-meta.json`) must be committed. → Document in tasks; CI should validate the build.
- [Spring adds visual lag on MIDI input] MIDI CC parameter changes will animate via the spring rather than snapping. At fast MIDI automation rates this could look laggy. → Spring parameters must be tuned; if problematic, MIDI path can bypass spring separately.
- [Output level plateau] At high master volume, signal no longer gets louder — only more saturated. Users expecting a linear volume control above 60% will be surprised. → This is the intended character; document it.

## Open Questions

- None — all decisions confirmed with user.
