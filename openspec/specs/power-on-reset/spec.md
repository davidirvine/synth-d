# power-on-reset Specification

## Purpose
TBD - created by archiving change fix-engine-stability. Update Purpose after archive.
## Requirements
### Requirement: All parameters reset to safe defaults on every power-on
On power-on, after the engine initialises, App.svelte SHALL apply the **active patch** to the central synth store, which drives both the DSP and the UI. The active patch is the most recently loaded patch, or the factory defaults when no patch has been loaded. Every continuous and discrete parameter of the active patch SHALL be applied to the DSP before any note is played. The result SHALL be that the UI and DSP are in complete agreement at the moment the synth becomes playable.

#### Scenario: Continuous params match the active patch after power-on
- **WHEN** the power button is toggled on and no patch has been loaded
- **THEN** every continuous parameter (cutoff, resonance, envelope times, levels, etc.) is set in the DSP to its factory-default value, matching the UI knob position

#### Scenario: Discrete controls match the active patch after power-on
- **WHEN** the power button is toggled on and no patch has been loaded
- **THEN** all wave selectors reset to triangle, OSC ranges reset to 0, all routing buttons reset to off, key track resets to off, glide resets to off, and delay and reverb reset to off

#### Scenario: Power-on applies a loaded patch instead of defaults
- **WHEN** a patch has been loaded while powered off and the power button is then toggled on
- **THEN** every continuous and discrete parameter is set in the DSP and UI to the loaded patch's values, not to factory defaults

#### Scenario: DSP and UI agree from first sample
- **WHEN** a note is played immediately after power-on
- **THEN** the audio output matches the parameter values visible on the UI

---

### Requirement: A central store is the single source of truth for synth parameters
The synth's continuous and discrete parameters SHALL be held in a single central reactive store. User interactions, MIDI CC input, patch loads, and power-on SHALL write to this store, and the store SHALL be the sole driver of `setParam` calls to the DSP. A single subscription SHALL apply store changes to the DSP, firing `setParam(name, value)` only for audio parameters and only for finite values, without creating feedback loops between MIDI, knob, and store updates.

#### Scenario: Store change drives the DSP
- **WHEN** a parameter value in the store changes to a finite value for an audio parameter
- **THEN** `setParam` is called exactly once for that parameter with the new value

#### Scenario: Knob animation behavior is preserved
- **WHEN** the store changes a knob's value while the user is not dragging that knob
- **THEN** the knob's indicator animates to the new position via its existing spring animation, exactly as it did when driven by `externalValue`

#### Scenario: Non-finite and non-audio values are not sent to the DSP
- **WHEN** a store value is non-finite, or the key is not an audio parameter
- **THEN** no `setParam` call is made for it

