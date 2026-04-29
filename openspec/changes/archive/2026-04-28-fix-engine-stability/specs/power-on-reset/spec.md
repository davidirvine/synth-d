## ADDED Requirements

### Requirement: All parameters reset to safe defaults on every power-on
After the engine initialises on power-on, App.svelte SHALL push the default value of every continuous parameter to the DSP and SHALL signal every panel component to reset its discrete state. The DSP SHALL receive default values for all parameters before any note is played. The result SHALL be that the UI and DSP are in complete agreement at the moment the synth becomes playable.

#### Scenario: Continuous params match UI defaults after power-on
- **WHEN** the power button is toggled on
- **THEN** every continuous parameter (cutoff, resonance, envelope times, levels, etc.) is set in the DSP to the value shown by the UI knob in its default position

#### Scenario: Discrete controls reset to defaults after power-on
- **WHEN** the power button is toggled on
- **THEN** all wave selectors reset to triangle, OSC ranges reset to 0, all routing buttons reset to off, key track resets to off, glide resets to off, delay and reverb reset to off, D/R lock resets to off

#### Scenario: DSP and UI agree from first sample
- **WHEN** a note is played immediately after power-on
- **THEN** the audio output matches the parameter values visible on the UI

---

### Requirement: Panel components accept a reset signal
Each panel component (`Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Modulation`, `Glide`, `Effects`) SHALL accept a numeric `reset` prop. When the `reset` value increments, the component SHALL restore all internal discrete state to its defaults and SHALL fire `onchange` for each parameter so the DSP receives the reset values. Continuous params are reset via `externalValue` / `ccExternalValues` in App.svelte and do not require panel-level reset handling.

#### Scenario: Oscillator resets waveforms and range on reset signal
- **WHEN** the Oscillator component's reset prop increments
- **THEN** all three oscillator waveform selections return to triangle (index 0), OSC ranges return to 0, and onchange fires for each

#### Scenario: Modulation resets routing on reset signal
- **WHEN** the Modulation component's reset prop increments
- **THEN** modToOsc1, modToOsc2, and modToFilter all return to 0 (off) and onchange fires for each

#### Scenario: Consecutive resets both fire
- **WHEN** the reset prop increments twice in separate power-on cycles
- **THEN** both increments trigger a full discrete reset
