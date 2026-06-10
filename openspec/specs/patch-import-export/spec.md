# patch-import-export Specification

## Purpose

TBD - created by syncing change patch-import-export. Update Purpose after sync.

## Requirements

### Requirement: The patch file is a versioned, self-describing JSON contract

An exported patch SHALL be a single JSON object that carries a numeric
`fileFormat` version identifying the file-format contract, alongside the patch
payload. The file-format version SHALL be independent of the patch envelope's
own `version` so that the on-disk contract can evolve separately from the patch
data shape. The exported object SHALL contain the patch `name`, the patch
`version`, and the `params` map exactly as captured by the existing patch
envelope; it SHALL NOT include performance or controller state (keyboard
register, MIDI CC assignments, mod-wheel position), consistent with what a saved
patch already excludes.

#### Scenario: Exported file declares its file-format version

- **WHEN** a patch is exported
- **THEN** the resulting JSON object contains a numeric `fileFormat` field identifying the file-format contract version
- **AND** it contains the patch `name`, the patch `version`, and the `params` map

#### Scenario: File-format version is distinct from patch version

- **WHEN** the exported file is inspected
- **THEN** the `fileFormat` value identifies the file contract and is not required to equal the patch envelope's `version` field

### Requirement: User can export the active patch to a file

The system SHALL let the user export the currently active patch as a downloadable
`.json` file via an Export control in the patch manager. The download filename
SHALL be derived from the patch name and sanitized so that it is safe to use on
common filesystems. Exporting SHALL NOT modify any stored patch or the active
patch state. When there is no active patch to export, the Export control SHALL be
disabled.

#### Scenario: Export downloads a JSON file for the active patch

- **WHEN** the user activates the Export control with an active patch
- **THEN** the browser downloads a `.json` file whose contents are the versioned patch file for the active patch

#### Scenario: Download filename is derived from the patch name and filesystem-safe

- **WHEN** a patch is exported
- **THEN** the download filename is derived from the patch name with characters that are unsafe for common filesystems replaced or removed, and ends in `.json`

#### Scenario: Export does not mutate state

- **WHEN** the user exports the active patch
- **THEN** the stored patches, the active patch, and the dirty indicator are unchanged

#### Scenario: Export is disabled with no active patch

- **WHEN** the patch popover is open and no patch is active
- **THEN** the Export control is disabled and cannot trigger a download

### Requirement: User can import a single patch from a file

The system SHALL let the user import a single patch from a user-selected `.json`
file via an Import control in the patch manager. Selecting a valid file SHALL
add the imported patch to the saved patch list. Import SHALL be available
regardless of whether the synth is powered on, since it does not capture live
synth state.

#### Scenario: Importing a valid file adds the patch

- **WHEN** the user selects a structurally valid patch file
- **THEN** the patch it describes is added to the saved patch list and becomes selectable like any other saved patch

#### Scenario: Import is available while powered off

- **WHEN** the synth is powered off and the patch popover is open
- **THEN** the Import control is available and a valid file can be imported

### Requirement: Import validates file structure before accepting it

Before accepting an imported file, the system SHALL validate its structure with
hand-rolled checks (no external validation library): the top-level value MUST be
a JSON object, it MUST carry a recognized `fileFormat` version, `name` MUST be a
string, `params` MUST be an object, and parameter values MUST be numbers. A file
that fails to parse as JSON, or that fails any structural check, SHALL be
rejected with a human-readable reason and SHALL NOT create or modify any patch.
An empty `params` object SHALL be accepted as structurally valid and SHALL
produce a patch carrying factory defaults. The structural gate SHALL check only
that parameter values are numbers; the integer-domain check for switch
parameters belongs to the value-coercion layer, not the structural gate.

#### Scenario: Unparseable file is rejected

- **WHEN** the user selects a file whose contents are not valid JSON
- **THEN** the import is rejected with a human-readable reason and no patch is created or modified

#### Scenario: Structurally invalid file is rejected

- **WHEN** the user selects a JSON file that is not an object, lacks a recognized `fileFormat` version, whose `name` is not a string, or whose `params` is not an object
- **THEN** the import is rejected with a human-readable reason and no patch is created or modified

#### Scenario: Empty params imports a defaults patch

- **WHEN** the user selects an otherwise valid file whose `params` is an empty object
- **THEN** the import succeeds and the resulting patch carries factory-default parameter values

#### Scenario: Unrecognized file-format version is rejected

- **WHEN** the user selects a file whose `fileFormat` version the system does not recognize
- **THEN** the import is rejected with a human-readable reason and no patch is created or modified

### Requirement: Import is bounded and surfaces read errors

The system SHALL bound the cost of import against crafted or accidental large
input: input whose size exceeds a fixed ceiling SHALL be rejected with a
human-readable reason before it is parsed. If reading the selected file fails
(for example the read is aborted or denied), the system SHALL surface a
human-readable reason and SHALL NOT create or modify any patch. These cases are
ordinary rejections and SHALL leave stored patches unchanged.

#### Scenario: Oversized input is rejected before parsing

- **WHEN** the user selects a file whose size exceeds the import size ceiling
- **THEN** the import is rejected with a human-readable reason without parsing the contents, and no patch is created or modified

#### Scenario: File read failure is surfaced

- **WHEN** reading the selected file fails before its contents are available
- **THEN** a human-readable reason is shown and no patch is created or modified

### Requirement: Import coerces parameter values into valid ranges

After the structural gate passes, the system SHALL coerce parameter values so
the imported patch is always in range. Continuous (knob) parameters SHALL be
clamped to their `[min, max]` bounds. Discrete (switch) parameters SHALL be
validated against a defined integer domain for each switch (the set of valid
values the synth accepts for that parameter); a switch value that is not an
integer within its domain SHALL fall back to that parameter's default value.
Parameters that are not part of the patch scope, and non-finite numeric values,
SHALL be dropped — mirroring the existing save/load filtering. Value coercion
operates separately from the structural gate: structure validation rejects a
malformed file, while coercion normalizes the values of an already-valid file.

#### Scenario: Out-of-range knob values are clamped

- **WHEN** an imported file contains a continuous parameter value outside its `[min, max]` bounds
- **THEN** the value is clamped to the nearest bound in the resulting patch

#### Scenario: Out-of-domain switch values fall back to default

- **WHEN** an imported file contains a discrete switch parameter value that is not an integer within that switch's valid domain
- **THEN** that parameter is set to its default value in the resulting patch

#### Scenario: In-domain switch values are preserved

- **WHEN** an imported file contains a discrete switch parameter value that is an integer within that switch's valid domain
- **THEN** that value is kept unchanged in the resulting patch

#### Scenario: Unknown and non-finite parameters are dropped

- **WHEN** an imported file contains a parameter name outside the patch scope, or a non-finite numeric value
- **THEN** that parameter is omitted from the resulting patch

### Requirement: Import normalizes the patch name and resolves collisions non-destructively

The imported patch name SHALL be normalized through the same name gate used when
saving (trimmed, upper-cased, capped at the maximum name length). If the
normalized name matches an existing patch, the system SHALL make the imported
name unique by appending an integer suffix, incrementing until the name is free,
rather than overwriting the existing patch. If appending the suffix would exceed
the maximum name length, the base name SHALL be truncated (not the suffix) so
the final name fits within the cap.

#### Scenario: Imported name is normalized like a saved name

- **WHEN** a file with a mixed-case or untrimmed name is imported
- **THEN** the stored patch name is trimmed, upper-cased, and capped at the maximum name length

#### Scenario: Colliding name is auto-suffixed

- **WHEN** an imported patch's normalized name matches an existing patch
- **THEN** the imported patch is stored under a name made unique with an incrementing integer suffix, and the existing patch is left unchanged

#### Scenario: Suffix fits within the name cap by truncating the base

- **WHEN** appending the integer suffix to a colliding name would exceed the maximum name length
- **THEN** the base name is truncated so that the suffixed name fits within the cap, and the suffix is preserved

### Requirement: Import is atomic

The import pipeline SHALL be atomic: the file is parsed, structurally validated,
name-normalized, collision-resolved, and value-coerced entirely in memory before
any persistent storage is written, and the resulting patch SHALL be committed
with exactly one save. If any stage before the commit fails, no patch SHALL be
created or modified — a rejected import leaves stored patches exactly as they
were.

#### Scenario: A rejected import writes nothing

- **WHEN** an import is rejected at any validation stage
- **THEN** no entry is added to or removed from persistent storage and every existing patch is unchanged

#### Scenario: A successful import commits once

- **WHEN** a valid file is imported
- **THEN** the resulting patch is written with a single save and appears in the patch list

### Requirement: Export and Import controls live in a patch-manager footer bar

The patch manager popover SHALL present the Export and Import controls in a
footer action bar below the existing save row. The existing per-row patch
controls (load, rename, delete) SHALL remain unchanged. The Import control SHALL
open a file picker for `.json` files. The controls SHALL follow the existing
patch-manager styling and theme tokens.

#### Scenario: Footer bar exposes Export and Import

- **WHEN** the patch popover is open
- **THEN** an Export control and an Import control are shown in a footer bar below the save row, and the per-row load/rename/delete controls are unchanged

#### Scenario: Import control opens a file picker

- **WHEN** the user activates the Import control
- **THEN** a file picker scoped to `.json` files is opened
