## REMOVED Requirements

### Requirement: ClipLed component renders a single circular LED indicator

**Reason**: `ClipLed.svelte` is replaced by `LevelLed.svelte`, which provides continuous green-to-red color mapping in addition to clip latching. The binary on/off behavior is superseded.
**Migration**: Replace all `import ClipLed from './ClipLed.svelte'` with `import LevelLed from './LevelLed.svelte'`. The prop interface (`getPeak`, `powered`) is unchanged.

### Requirement: ClipLed polls peak on every animation frame while powered

**Reason**: Superseded by the equivalent requirement in the `level-led` spec.
**Migration**: `LevelLed` provides the same rAF polling behavior.

### Requirement: ClipLed latches the clip state for 1.5 seconds

**Reason**: Superseded by the equivalent requirement in the `level-led` spec.
**Migration**: `LevelLed` retains the 1.5-second clip latch on the red state.

### Requirement: ClipLed is embedded right-aligned in the output panel label row

**Reason**: Superseded by the `level-led` spec requirement covering both mixer and output panel header integration.
**Migration**: `AmpEnv.svelte` imports `LevelLed` instead of `ClipLed`. Props are unchanged.
