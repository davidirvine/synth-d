## Why

The current "CLICK TO START" full-screen overlay is a blunt instrument for satisfying browser autoplay policy — it blocks the entire UI and gives no ongoing control over audio state. A power button replaces this pattern with a persistent, physical-feeling control that is more intuitive, matches the hardware synthesizer aesthetic, and gives the user explicit on/off control at any time.

## What Changes

- Remove the full-screen "CLICK TO START" overlay from `App.svelte`
- Add a power button component to the synth UI header/title area
- Power defaults to **off** on page load; the AudioContext is not created until the user powers on
- Powering **on** creates/resumes the AudioContext and enables all audio output
- Powering **off** suspends the AudioContext and stops all sound immediately
- The synth controls remain visible in both states (no hidden panel), but are visually dimmed when powered off

## Capabilities

### New Capabilities

- `power-button`: A toggleable power button control that manages the AudioContext lifecycle (create on first power-on, suspend/resume on subsequent toggles). Replaces the click-to-start overlay as the sole mechanism for browser autoplay compliance.

### Modified Capabilities

- `synth-ui`: The panel layout gains a power button in the header area. The existing "click to start" overlay requirement is superseded by the power button requirement.
- `dsp-engine`: The autoplay policy handling changes — instead of an overlay triggering AudioContext creation, the power button is the user gesture that creates/resumes the AudioContext.

## Impact

- `src/App.svelte`: Remove overlay markup and CSS, wire power button state to audio engine init
- `src/components/PowerButton.svelte`: New component
- `src/lib/audio.js` (or equivalent engine module): Expose `powerOn()` / `powerOff()` methods that create/resume and suspend the AudioContext respectively
- No new dependencies required
- Existing knob, keyboard, oscillator, and filter components are unaffected in their internal logic
