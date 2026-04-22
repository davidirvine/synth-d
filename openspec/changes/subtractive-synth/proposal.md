## Why

Subtractive synthesis is the foundation of most electronic music synthesis, but learning it typically requires expensive hardware or complex software. A browser-based monophonic synth with clean, exposed modules gives learners and musicians an immediately accessible tool for understanding how oscillators, filters, and envelopes interact — with zero installation friction.

## What Changes

- New standalone web application: browser-based monophonic subtractive synthesizer
- DSP engine written in FAUST, compiled to WebAssembly, running in a Web Audio AudioWorklet
- Svelte + Vite frontend with Moog-inspired dark aesthetic
- Five oscillator waveforms (sine, sawtooth, square, triangle, noise)
- SEM-style state variable filter with continuous LP/BP/HP crossfade
- Two independent AD envelopes (filter cutoff modulation, VCA control)
- 2-octave interactive keyboard with QWERTY mapping and retrigger behavior
- Custom SVG rotary knob component with log/linear parameter curves and fine-mode

## Capabilities

### New Capabilities

- `dsp-engine`: FAUST DSP signal chain compiled to WASM, loaded as AudioWorklet — oscillator, filter, VCA, envelopes, master volume
- `oscillator`: Five waveform sources (sine, saw, square, triangle, noise) with parallel generation and index-based selection
- `sem-filter`: SEM-style 2-pole state variable filter with continuous mode crossfade (LP→BP→HP), resonance, and envelope-modulated cutoff
- `ad-envelope`: One-shot attack-decay envelope triggered on gate rising edge, decays to zero regardless of key hold; used for both filter and amp
- `keyboard`: 2-octave visual piano with QWERTY mapping, retrigger on new key press, maps to frequency and gate parameters
- `knob`: Reusable SVG rotary knob with per-parameter log/linear curve, Shift fine mode, double-click reset
- `synth-ui`: Panel layout assembling all modules in Moog dark aesthetic
- `testing`: Three-layer test suite — Vitest unit tests for pure functions, Svelte component tests, Playwright audio smoke tests, and Stryker mutation testing on math-critical modules

### Modified Capabilities

## Impact

- New project: no existing code affected
- Runtime dependencies: Svelte, Vite, FAUST stdlib (stdfaust.lib)
- Dev dependencies added: Vitest, @testing-library/svelte, Playwright, Stryker + @stryker-mutator/vitest-runner
- Build dependency: local `faust` CLI for WASM compilation
- Browser requirements: Web Audio API with AudioWorklet support (all modern browsers)
- No backend, no server — fully static, deployable to any CDN
