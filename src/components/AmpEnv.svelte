<script>
  import Knob from './Knob.svelte'
  import ClipLed from './ClipLed.svelte'

  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
    reset = 0,
    getOutputPeak = () => 0,
    powered = false,
  } = /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    reset?: number,
    getOutputPeak?: () => number,
    powered?: boolean,
  }} */ ($props())

  let drLock = $state(1)
  let decayValue = $state(0.5)

  function toggleDrLock() {
    drLock = drLock === 0 ? 1 : 0
    onchange?.({ param: 'drLock', value: drLock })
  }

  $effect(() => {
    if (reset === 0) return
    drLock = 1
    onchange?.({ param: 'drLock', value: 1 })
  })
</script>

<div class="panel">
  <div class="panel-header">
    <span class="panel-label">output</span>
    <ClipLed getPeak={getOutputPeak} {powered} />
  </div>
  <div class="knob-row centered">
    <Knob
      label="volume"
      min={0}
      max={1}
      default={0.75}
      scale="linear"
      externalValue={midiState?.masterVol?.externalValue}
      learningMidi={midiState?.masterVol?.learningMidi ?? false}
      assignedCc={midiState?.masterVol?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'masterVol', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('masterVol')}
    />
  </div>
  <div class="section-divider"></div>
  <div class="contour-header">
    <span class="sub-label">loudness contour</span>
    <button
      class="drlock-btn"
      class:active={drLock === 1}
      onclick={toggleDrLock}
      aria-pressed={drLock === 1}
      title="Decay/Release lock"
    >
      d/r
    </button>
  </div>
  <div class="knob-row">
    <Knob
      label="attack"
      min={0.001}
      max={4}
      default={0.01}
      scale="log"
      unit="s"
      externalValue={midiState?.ampAttack?.externalValue}
      learningMidi={midiState?.ampAttack?.learningMidi ?? false}
      assignedCc={midiState?.ampAttack?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'ampAttack', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('ampAttack')}
    />
    <Knob
      label="decay"
      min={0.001}
      max={4}
      default={0.5}
      scale="log"
      unit="s"
      externalValue={midiState?.ampDecay?.externalValue}
      learningMidi={midiState?.ampDecay?.learningMidi ?? false}
      assignedCc={midiState?.ampDecay?.assignedCc ?? null}
      onchange={(e) => {
        decayValue = e.value
        onchange?.({ param: 'ampDecay', value: e.value })
      }}
      oncontextmenu={() => onknobcontextmenu?.('ampDecay')}
    />
    <Knob
      label="sustain"
      min={0}
      max={1}
      default={0.7}
      scale="linear"
      externalValue={midiState?.ampSustain?.externalValue}
      learningMidi={midiState?.ampSustain?.learningMidi ?? false}
      assignedCc={midiState?.ampSustain?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'ampSustain', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('ampSustain')}
    />
    <Knob
      label="release"
      min={0.001}
      max={8}
      default={0.3}
      scale="log"
      unit="s"
      disabled={drLock === 1}
      externalValue={drLock === 1 ? decayValue : midiState?.ampRelease?.externalValue}
      learningMidi={midiState?.ampRelease?.learningMidi ?? false}
      assignedCc={midiState?.ampRelease?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'ampRelease', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('ampRelease')}
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

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .section-divider {
    height: 1px;
    background: #2a2a2a;
  }

  .sub-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .knob-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .knob-row.centered {
    justify-content: center;
  }

  .contour-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 20px;
  }

  .drlock-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 2px 6px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .drlock-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }
</style>
