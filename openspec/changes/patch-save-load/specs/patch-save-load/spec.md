## ADDED Requirements

### Requirement: A patch captures the full synth sound

A patch SHALL capture the complete *sound* of the synth: every continuous knob parameter and every discrete switch/toggle parameter. A patch SHALL NOT include performance or controller state — specifically the keyboard register, MIDI CC assignments, and the mod-wheel position SHALL be excluded.

#### Scenario: Patch includes all knob parameters

- **WHEN** a patch is saved
- **THEN** the saved data includes a value for every continuous knob parameter (oscillator detune/LFO rate, mixer levels, filter cutoff/resonance/envelope, amp envelope, master volume, modulation mix, glide rate, delay parameters, reverb parameters)

#### Scenario: Patch includes all switch parameters

- **WHEN** a patch is saved
- **THEN** the saved data includes a value for every discrete parameter: the three oscillator waveform selections, the three oscillator ranges, OSC3 LFO mode, key track, delay on/off, delay-mod on/off, and reverb on/off

#### Scenario: Patch excludes performance and controller state

- **WHEN** a patch is saved
- **THEN** the saved data does NOT include the keyboard register, any MIDI CC assignment, or the mod-wheel position

### Requirement: User can save the current sound as a named patch

The system SHALL let the user save the current synth state under a name they choose. The name SHALL be trimmed of surrounding whitespace; an empty or whitespace-only name SHALL be rejected and SHALL NOT create a patch. Saving under a name that does not yet exist SHALL create a new patch. Saving under an existing name SHALL require an inline confirmation before overwriting that patch.

#### Scenario: Save a new patch

- **WHEN** the user enters a non-empty name and activates save, and no patch with that name exists
- **THEN** a new patch with that name is created from the current synth state and appears in the patch list

#### Scenario: Reject an empty name

- **WHEN** the user activates save with an empty or whitespace-only name
- **THEN** no patch is created and the user is informed the name is required

#### Scenario: Overwrite requires confirmation

- **WHEN** the user activates save with a name that matches an existing patch
- **THEN** an inline overwrite confirmation is shown, and the existing patch is replaced only after the user confirms

### Requirement: User can load a saved patch

The system SHALL let the user load any saved patch. Loading SHALL be available whether the synth is powered on or off. When powered on, the loaded patch SHALL be applied to the DSP and UI immediately. When powered off, the loaded patch SHALL become the active patch and SHALL be applied on the next power-on. A loaded patch SHALL be applied in full, replacing all in-scope parameter values; unsaved changes to the previously active state SHALL be discarded.

#### Scenario: Load while powered on applies immediately

- **WHEN** the synth is powered on and the user loads a patch
- **THEN** every knob and switch updates to the patch's values and the DSP reflects them immediately

#### Scenario: Load while powered off applies on power-on

- **WHEN** the synth is powered off and the user loads a patch, then powers on
- **THEN** the synth powers on with the loaded patch's values rather than factory defaults

#### Scenario: Loading discards unsaved changes

- **WHEN** the user has modified parameters without saving and then loads a different patch
- **THEN** the loaded patch's values fully replace the current state without a separate confirmation

### Requirement: User can delete a saved patch

The system SHALL let the user delete a saved patch. Because deletion is irreversible, it SHALL require an inline confirmation and SHALL NOT occur on a single click. Deleting a patch SHALL remove it from the patch list and from persistent storage.

#### Scenario: Delete requires inline confirmation

- **WHEN** the user activates delete on a patch row
- **THEN** an inline confirm/cancel control is shown, and the patch is removed only after the user confirms

#### Scenario: Cancel leaves the patch intact

- **WHEN** the user activates delete and then cancels the confirmation
- **THEN** the patch remains in the list and in storage

### Requirement: Patches persist across page reloads

Saved patches SHALL persist in the browser's local storage so they survive a page reload. The patch name SHALL serve as the storage slot identifier. Storage access failures (unavailable storage, quota exceeded, corrupt data) SHALL be handled gracefully and SHALL NOT break audio or crash the UI.

#### Scenario: Saved patch survives reload

- **WHEN** the user saves a patch and then reloads the page
- **THEN** the patch still appears in the patch list and can be loaded

#### Scenario: Storage failure is non-fatal

- **WHEN** a patch cannot be read or written because local storage is unavailable, full, or corrupt
- **THEN** the synth continues to function and the user is shown a non-fatal indication rather than an unhandled error

### Requirement: The UI shows whether the active patch has unsaved changes

The system SHALL track whether the current synth state differs from the saved version of the active patch. When the current state diverges from the saved patch (or when state has been changed and no patch is active), the UI SHALL display a dirty indicator. Saving or loading SHALL clear the dirty indicator.

#### Scenario: Editing a loaded patch marks it dirty

- **WHEN** the user loads a patch and then changes any in-scope parameter
- **THEN** a dirty indicator appears next to the patch name

#### Scenario: Saving clears the dirty indicator

- **WHEN** the active patch is dirty and the user saves it
- **THEN** the dirty indicator is cleared

#### Scenario: Loading clears the dirty indicator

- **WHEN** the user loads a patch
- **THEN** the dirty indicator is cleared because the current state matches the just-loaded patch

### Requirement: Patch controls live in the header and use the app's native idiom

The patch controls SHALL be presented as a control in the header, alongside the MIDI status and power button, and SHALL remain reachable while the synth is powered off. The control SHALL open a popover containing the list of saved patches (with the active patch marked), a per-row load and delete affordance, an inline name field for saving, and a save action. The popover SHALL show an empty-state message when no patches exist. The patch UI SHALL use the application's dark/monospace styling and SHALL NOT use browser dialogs (`window.prompt`/`window.confirm`) for naming or confirmation.

#### Scenario: Patch control is usable while powered off

- **WHEN** the synth is powered off
- **THEN** the patch control in the header is still operable and patches can be listed, loaded, saved, and deleted

#### Scenario: Active patch is marked in the list

- **WHEN** a patch is the active (loaded) patch and the popover is open
- **THEN** that patch is visually distinguished from the others in the list

#### Scenario: Empty state is shown when no patches exist

- **WHEN** the popover is opened and no patches have been saved
- **THEN** an empty-state message is shown above the name field

#### Scenario: No OS dialogs are used

- **WHEN** the user names a patch or confirms an overwrite or delete
- **THEN** the interaction happens inline within the app UI, not via a browser `prompt`/`confirm` dialog
