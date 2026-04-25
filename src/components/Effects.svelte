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

  let delayOn = $state(0)
  let reverbOn = $state(0)

  function toggleDelay() {
    delayOn = delayOn === 0 ? 1 : 0
    onchange?.({ param: 'delayOn', value: delayOn })
  }

  function toggleReverb() {
    reverbOn = reverbOn === 0 ? 1 : 0
    onchange?.({ param: 'reverbOn', value: reverbOn })
  }
</script>

<div class="panel">
  <span class="panel-label">effects</span>

  <span class="sub-label">delay</span>
  <div class="effects-row">
    <button
      class="toggle-btn"
      class:active={delayOn === 1}
      onclick={toggleDelay}
      aria-pressed={delayOn === 1}
    >
      {delayOn === 1 ? 'on' : 'off'}
    </button>
    <Knob
      label="time"
      min={0.01}
      max={1.0}
      default={0.3}
      scale="log"
      unit="s"
      externalValue={midiState?.delayTime?.externalValue}
      learningMidi={midiState?.delayTime?.learningMidi ?? false}
      assignedCc={midiState?.delayTime?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayTime', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayTime')}
    />
    <Knob
      label="feedback"
      min={0}
      max={0.9}
      default={0.3}
      scale="linear"
      externalValue={midiState?.delayFeedback?.externalValue}
      learningMidi={midiState?.delayFeedback?.learningMidi ?? false}
      assignedCc={midiState?.delayFeedback?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayFeedback', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayFeedback')}
    />
    <Knob
      label="mix"
      min={0}
      max={1}
      default={0.3}
      scale="linear"
      externalValue={midiState?.delayMix?.externalValue}
      learningMidi={midiState?.delayMix?.learningMidi ?? false}
      assignedCc={midiState?.delayMix?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayMix', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayMix')}
    />
  </div>

  <div class="section-divider"></div>

  <span class="sub-label">reverb</span>
  <div class="effects-row">
    <button
      class="toggle-btn"
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

  .sub-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .section-divider {
    height: 1px;
    background: #2a2a2a;
  }

  .effects-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .toggle-btn {
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

  .toggle-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }
</style>
