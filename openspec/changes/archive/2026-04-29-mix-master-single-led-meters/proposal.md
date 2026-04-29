## Why

The binary clip LEDs in the mixer and output panels only flash red when clipping has already occurred, giving the user no information about how close the signal is to the threshold. A single level-sensing LED that shifts color from green (quiet) through yellow/orange to red (clipping) lets users read signal level at a glance and back off before saturation happens.

## What Changes

- Replace `ClipLed.svelte` with a new `LevelLed.svelte` component that maps peak level to a color spectrum (green → yellow → orange → red), while preserving the 1.5-second clip latch on the red state
- Update `Mixer.svelte` to use `LevelLed` instead of `ClipLed`
- Update `AmpEnv.svelte` to use `LevelLed` instead of `ClipLed`
- Delete `ClipLed.svelte` and its test file once replaced

## Capabilities

### New Capabilities

- `level-led`: A single circular LED indicator that maps a continuous peak value to a green-to-red color spectrum, replacing the binary clip LED in the mixer and output panels

### Modified Capabilities

- `clip-led`: The binary clip LED is replaced by `LevelLed`. The `ClipLed` component and its spec are superseded.
- `mixer`: The panel-header clip indicator is replaced by the level-sensing `LevelLed`
- `synth-ui`: Minor visual change to mixer and output panel headers

## Impact

- `src/components/ClipLed.svelte`: Deleted (superseded by `LevelLed.svelte`)
- `src/components/ClipLed.test.js`: Deleted
- `src/components/LevelLed.svelte`: New component
- `src/components/LevelLed.test.js`: New test file
- `src/components/Mixer.svelte`: Import `LevelLed` instead of `ClipLed`
- `src/components/AmpEnv.svelte`: Import `LevelLed` instead of `ClipLed`
- No DSP or engine changes — existing `getMixerPeak()` and `getOutputPeak()` are unchanged
