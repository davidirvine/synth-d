<script>
  import Knob from './Knob.svelte'

  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
    reset = 0,
  } = /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    reset?: number
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

  $effect(() => {
    if (reset === 0) return
    delayOn = 0
    reverbOn = 0
    onchange?.({ param: 'delayOn', value: 0 })
    onchange?.({ param: 'reverbOn', value: 0 })
  })
</script>

<div class="panel">
  <span class="panel-label">effects</span>

  <div class="section-header">
    <span class="sub-label">delay</span>
    <button
      class="toggle-btn"
      class:active={delayOn === 1}
      onclick={toggleDelay}
      aria-pressed={delayOn === 1}
    >
      {delayOn === 1 ? 'on' : 'off'}
    </button>
  </div>
  <div class="effects-row">
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

  <div class="section-header">
    <span class="sub-label">reverb</span>
    <button
      class="toggle-btn"
      class:active={reverbOn === 1}
      onclick={toggleReverb}
      aria-pressed={reverbOn === 1}
    >
      {reverbOn === 1 ? 'on' : 'off'}
    </button>
  </div>
  <div class="effects-row reverb-row">
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
      label="LPF"
      min={1000}
      max={16000}
      default={4000}
      scale="log"
      unit="Hz"
      externalValue={midiState?.reverbTone?.externalValue}
      learningMidi={midiState?.reverbTone?.learningMidi ?? false}
      assignedCc={midiState?.reverbTone?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbTone', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbTone')}
    />
    <Knob
      label="decay"
      min={0.01}
      max={1}
      default={0.5}
      scale="log-reverse"
      externalValue={midiState?.reverbDecay?.externalValue}
      learningMidi={midiState?.reverbDecay?.learningMidi ?? false}
      assignedCc={midiState?.reverbDecay?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbDecay', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbDecay')}
    />
    <Knob
      label="pre-delay"
      min={0}
      max={0.1}
      default={0}
      scale="linear"
      unit="s"
      externalValue={midiState?.reverbPreDelay?.externalValue}
      learningMidi={midiState?.reverbPreDelay?.learningMidi ?? false}
      assignedCc={midiState?.reverbPreDelay?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbPreDelay', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbPreDelay')}
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

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    background: #1a2a1a;
    color: #20b040;
    border-color: #20b040;
  }

  /* Reserve fixed width for the LPF knob value (2nd child: mix + LPF).
     Prevents layout shift when the displayed string changes between e.g. "1.0 kHz" and "16.0 kHz". */
  .reverb-row :global(:nth-child(2) .knob-value) {
    min-width: 5.5em;
    display: inline-block;
    text-align: center;
  }
</style>
