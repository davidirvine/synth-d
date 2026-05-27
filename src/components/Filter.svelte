<script>
  import Knob from './Knob.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    keyTrack?: number,
  }} */
  let { onchange, midiState = {}, onknobcontextmenu, keyTrack = 0 } = $props()

  function toggleKeyTrack() {
    onchange?.({ param: 'keyTrack', value: keyTrack === 0 ? 1 : 0 })
  }
</script>

<div class="panel">
  <span class="panel-label">filter</span>

  <div class="knob-row centered">
    <Knob
      label="cutoff"
      min={20}
      max={20000}
      default={2000}
      scale="log"
      unit="Hz"
      externalValue={midiState?.cutoff?.externalValue}
      learningMidi={midiState?.cutoff?.learningMidi ?? false}
      assignedCc={midiState?.cutoff?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'cutoff', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('cutoff')}
    />
    <Knob
      label="res"
      min={0}
      max={1}
      default={0.3}
      scale="linear"
      externalValue={midiState?.resonance?.externalValue}
      learningMidi={midiState?.resonance?.learningMidi ?? false}
      assignedCc={midiState?.resonance?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'resonance', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('resonance')}
    />
    <div class="key-track-col">
      <div class="key-track-btn-wrap">
        <button
          class="toggle-btn"
          class:active={keyTrack === 1}
          onclick={toggleKeyTrack}
          aria-pressed={keyTrack === 1}
        >
          KEY TRACK
        </button>
      </div>
    </div>
  </div>

  <div class="section-divider"></div>
  <div class="contour-header">
    <span class="sub-label">filter contour</span>
  </div>

  <div class="knob-row">
    <Knob
      label="attack"
      min={0.001}
      max={4}
      default={0.01}
      scale="log"
      unit="s"
      externalValue={midiState?.filterAttack?.externalValue}
      learningMidi={midiState?.filterAttack?.learningMidi ?? false}
      assignedCc={midiState?.filterAttack?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterAttack', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterAttack')}
    />
    <Knob
      label="decay"
      min={0.001}
      max={4}
      default={0.3}
      scale="log"
      unit="s"
      externalValue={midiState?.filterDecay?.externalValue}
      learningMidi={midiState?.filterDecay?.learningMidi ?? false}
      assignedCc={midiState?.filterDecay?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterDecay', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterDecay')}
    />
    <Knob
      label="sustain"
      min={0}
      max={1}
      default={0.5}
      scale="linear"
      externalValue={midiState?.filterSustain?.externalValue}
      learningMidi={midiState?.filterSustain?.learningMidi ?? false}
      assignedCc={midiState?.filterSustain?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterSustain', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterSustain')}
    />
    <Knob
      label="release"
      min={0.001}
      max={8}
      default={0.3}
      scale="log"
      unit="s"
      externalValue={midiState?.filterRelease?.externalValue}
      learningMidi={midiState?.filterRelease?.learningMidi ?? false}
      assignedCc={midiState?.filterRelease?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterRelease', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterRelease')}
    />
    <Knob
      label="amount"
      min={-10000}
      max={10000}
      default={0}
      scale="linear"
      unit="Hz"
      bipolar={true}
      externalValue={midiState?.filterEnvAmt?.externalValue}
      learningMidi={midiState?.filterEnvAmt?.learningMidi ?? false}
      assignedCc={midiState?.filterEnvAmt?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterEnvAmt', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterEnvAmt')}
    />
  </div>
</div>

<style>
  .panel {
    background: var(--panel-bg, #1c1c1c);
    border: 1px solid var(--panel-border, #333);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-label {
    font-size: 10px;
    color: var(--panel-label-color, #e8dcc8);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .sub-label {
    font-size: 9px;
    color: var(--control-hint-color, #666);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .contour-header {
    display: flex;
    align-items: center;
    min-height: 20px;
  }

  .section-divider {
    height: 1px;
    background: var(--control-bg, #2a2a2a);
  }

  .knob-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .knob-row.centered {
    justify-content: center;
  }

  .key-track-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding-top: 14px; /* offset knob-label height (~12px) + knob-wrap gap (2px) */
  }

  .key-track-btn-wrap {
    height: var(--knob-body-size, 48px);
    display: flex;
    align-items: center;
  }

  .toggle-btn {
    font-family: inherit;
    font-size: 9px;
    background: var(--control-bg, #2a2a2a);
    color: var(--control-label-color, #888);
    border: 1px solid var(--control-border, #444);
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    height: 22px;
    width: auto;
    min-width: 32px;
  }

  .toggle-btn.active {
    background: var(--led-on-bg, #1a2a1a);
    color: var(--led-on-color, #20b040);
    border-color: var(--led-on-color, #20b040);
  }

  /* Reserve fixed width for the filter env amount knob value.
     Prevents layout shift when the displayed string changes between e.g. "0.00 Hz",
     "10.0 kHz", and the bipolar negative reading "-10.0 kHz" (leading minus sign). */
  .knob-row :global(:last-child .knob-value) {
    min-width: 6.5em;
    display: inline-block;
    text-align: center;
  }
</style>
