<script>
  import Knob from './Knob.svelte'

  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
  } = /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void
  }} */ ($props())
</script>

<div class="panel">
  <span class="panel-label">filter env</span>
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
      min={0}
      max={10000}
      default={0}
      scale="linear"
      unit="Hz"
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
    background: #1c1c1c;
    border: 1px solid #333;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .knob-row {
    display: flex;
    gap: 16px;
  }
</style>
