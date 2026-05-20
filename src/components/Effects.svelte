<script>
  import Knob from './Knob.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    delayOn?: number,
    delayModOn?: number,
    reverbOn?: number,
  }} */
  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
    delayOn = 0,
    delayModOn = 0,
    reverbOn = 0,
  } = $props()

  function toggleDelay() {
    onchange?.({ param: 'delayOn', value: delayOn === 0 ? 1 : 0 })
  }

  function toggleDelayMod() {
    onchange?.({ param: 'delayModOn', value: delayModOn === 0 ? 1 : 0 })
  }

  function toggleReverb() {
    onchange?.({ param: 'reverbOn', value: reverbOn === 0 ? 1 : 0 })
  }
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
      max={2.0}
      default={0.3}
      scale="linear"
      unit="s"
      disabled={delayOn === 0}
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
      disabled={delayOn === 0}
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
      disabled={delayOn === 0}
      externalValue={midiState?.delayMix?.externalValue}
      learningMidi={midiState?.delayMix?.learningMidi ?? false}
      assignedCc={midiState?.delayMix?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayMix', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayMix')}
    />
  </div>
  <div class="mod-row">
    <button
      class="toggle-btn"
      class:active={delayModOn === 1}
      onclick={toggleDelayMod}
      aria-pressed={delayModOn === 1}
      disabled={delayOn === 0}
    >
      MOD
    </button>
    <Knob
      label="rate"
      min={0.1}
      max={10}
      default={0.5}
      scale="log"
      unit="Hz"
      disabled={delayOn === 0 || delayModOn === 0}
      externalValue={midiState?.delayModRate?.externalValue}
      learningMidi={midiState?.delayModRate?.learningMidi ?? false}
      assignedCc={midiState?.delayModRate?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayModRate', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayModRate')}
    />
    <Knob
      label="depth"
      min={0}
      max={0.025}
      default={0}
      scale="linear"
      unit="s"
      disabled={delayOn === 0 || delayModOn === 0}
      externalValue={midiState?.delayModDepth?.externalValue}
      learningMidi={midiState?.delayModDepth?.learningMidi ?? false}
      assignedCc={midiState?.delayModDepth?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'delayModDepth', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('delayModDepth')}
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
      label="send"
      min={0}
      max={1}
      default={0.3}
      scale="linear"
      disabled={reverbOn === 0}
      externalValue={midiState?.reverbSend?.externalValue}
      learningMidi={midiState?.reverbSend?.learningMidi ?? false}
      assignedCc={midiState?.reverbSend?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbSend', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbSend')}
    />
    <Knob
      label="damp"
      min={0}
      max={1}
      default={0.5}
      scale="linear"
      showValue={false}
      disabled={reverbOn === 0}
      externalValue={midiState?.reverbDamp?.externalValue}
      learningMidi={midiState?.reverbDamp?.learningMidi ?? false}
      assignedCc={midiState?.reverbDamp?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'reverbDamp', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('reverbDamp')}
    />
    <Knob
      label="decay"
      min={0.01}
      max={1}
      default={0.5}
      scale="log-reverse"
      disabled={reverbOn === 0}
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
      default={0.015}
      scale="linear"
      unit="s"
      disabled={reverbOn === 0}
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

  .mod-row {
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

  .toggle-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
