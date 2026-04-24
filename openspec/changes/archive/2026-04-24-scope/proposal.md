## Why

The synthesizer currently provides no visual feedback about the audio signal being produced. Adding an oscilloscope panel gives players an instant, real-time view of the output waveform — making the relationship between knob settings and sound tangible and aiding both musical exploration and learning.

## What Changes

- Add a `Scope.svelte` component that renders a live oscilloscope display using a Web Audio `AnalyserNode` tapped on the master output
- Expose the analyser node from the audio engine so the scope component can read time-domain waveform data each animation frame
- Insert the scope panel into the existing UI layout between the header strip and the control panels
- Add corresponding unit and component tests

## Capabilities

### New Capabilities

- `scope`: Real-time oscilloscope display that reads time-domain waveform data from a Web Audio `AnalyserNode` and renders it on a `<canvas>` element, updating each animation frame while the synth is powered on

### Modified Capabilities

- `dsp-engine`: Export the `AnalyserNode` from the engine so other modules can access the post-master-volume signal for visualisation
- `synth-ui`: Add the Scope panel to the panel layout in the place holder panel under the output panel

## Impact

- `src/audio/engine.js`: create and connect an `AnalyserNode` after the master volume node; export a getter so components can obtain the node
- `src/components/Scope.svelte` (new): canvas-based waveform renderer
- `src/App.svelte`: import `Scope`, pass the analyser node prop, insert into layout
- No changes to FAUST DSP or existing audio parameter routing
