## ADDED Requirements

### Requirement: README displays a centered link to the live synth at the top of the page
The README SHALL include a centered Markdown link to `https://davidirvine.github.io/synth-d/` positioned immediately after the `# SYNTH-D` heading, before the project description. The link SHALL be rendered centered using an HTML `<p align="center">` block.

#### Scenario: Live link appears at the top of README
- **WHEN** the README is viewed on GitHub or any standard Markdown renderer
- **THEN** a centered link reading "▶ Live Synth" pointing to `https://davidirvine.github.io/synth-d/` appears at the top of the page, before the feature list and description

### Requirement: ASCII architecture diagram is removed from README
The multi-line ASCII box diagram under the `## Architecture` heading SHALL be removed. The Architecture section prose and sub-sections (DSP, UI, MIDI) SHALL remain intact.

#### Scenario: README renders without the ASCII diagram
- **WHEN** the README is rendered
- **THEN** no ASCII box-drawing characters appear in the Architecture section
- **THEN** the DSP, UI, and MIDI sub-sections and their prose descriptions are still present
