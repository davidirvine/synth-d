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

  let reverbOn = $state(0)

  function toggleReverb() {
    reverbOn = reverbOn === 0 ? 1 : 0
    onchange?.({ param: 'reverbOn', value: reverbOn })
  }
</script>

<div class="panel">
  <span class="panel-label">reverb</span>
  <div class="reverb-row">
    <button
      class="reverb-btn"
      class:active={reverbOn === 1}
      onclick={toggleReverb}
      aria-pressed={reverbOn === 1}
    >
      {reverbOn === 1 ? 'on' : 'off'}
    </button>
    <Knob
      label="mix"
      min={0}
      max={1}
      default={0.5}
      scale="linear"
      externalValue={midiState?.reverbMix?.externalValue}
      learningMidi={midiState?.reverbMix?.learningMidi ?? false}
      assignedCc={midiState?.reverbMix?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbMix', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbMix')}
    />
    <Knob
      label="decay"
      min={0}
      max={1}
      default={0.5}
      scale="linear"
      externalValue={midiState?.reverbDecay?.externalValue}
      learningMidi={midiState?.reverbDecay?.learningMidi ?? false}
      assignedCc={midiState?.reverbDecay?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbDecay', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbDecay')}
    />
    <Knob
      label="shimmer"
      min={0}
      max={1}
      default={0}
      scale="linear"
      externalValue={midiState?.reverbShimmer?.externalValue}
      learningMidi={midiState?.reverbShimmer?.learningMidi ?? false}
      assignedCc={midiState?.reverbShimmer?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbShimmer', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbShimmer')}
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
    flex: 1;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .reverb-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .reverb-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    height: 22px;
    width: 32px;
  }

  .reverb-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }
</style>
