<script>
  import { untrack } from 'svelte'
  import Knob from './Knob.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    reset?: number,
  }} */
  let { onchange, midiState = {}, onknobcontextmenu, reset = 0 } = $props()

  let modToOsc1 = $state(0)
  let modToOsc2 = $state(0)
  let modToFilter = $state(0)

  $effect(() => {
    if (reset === 0) return
    modToOsc1 = 0
    modToOsc2 = 0
    modToFilter = 0
    untrack(() => {
      onchange?.({ param: 'modToOsc1', value: 0 })
      onchange?.({ param: 'modToOsc2', value: 0 })
      onchange?.({ param: 'modToFilter', value: 0 })
    })
  })

  function toggleRoute(/** @type {string} */ param) {
    if (param === 'modToOsc1') {
      modToOsc1 = modToOsc1 === 0 ? 1 : 0
      onchange?.({ param, value: modToOsc1 })
    } else if (param === 'modToOsc2') {
      modToOsc2 = modToOsc2 === 0 ? 1 : 0
      onchange?.({ param, value: modToOsc2 })
    } else if (param === 'modToFilter') {
      modToFilter = modToFilter === 0 ? 1 : 0
      onchange?.({ param, value: modToFilter })
    }
  }
</script>

<div class="panel">
  <span class="panel-label">modulation</span>
  <div class="mod-layout">
    <div data-testid="mod-mix-knob">
      <Knob
        label="mix"
        min={0}
        max={1}
        default={0}
        scale="linear"
        showValue={false}
        bipolar={true}
        ticks={[
          { pos: 0, label: 'LFO' },
          { pos: 1, label: 'NOISE' },
        ]}
        externalValue={midiState?.modMix?.externalValue}
        learningMidi={midiState?.modMix?.learningMidi ?? false}
        assignedCc={midiState?.modMix?.assignedCc ?? null}
        onchange={(e) => onchange?.({ param: 'modMix', value: e.value })}
        oncontextmenu={() => onknobcontextmenu?.('modMix')}
      />
    </div>
    <div class="routes">
      <button
        class="route-btn"
        class:active={modToOsc1 === 1}
        onclick={() => toggleRoute('modToOsc1')}
        aria-pressed={modToOsc1 === 1}
      >
        osc 1
      </button>
      <button
        class="route-btn"
        class:active={modToOsc2 === 1}
        onclick={() => toggleRoute('modToOsc2')}
        aria-pressed={modToOsc2 === 1}
      >
        osc 2
      </button>
      <button
        class="route-btn"
        class:active={modToFilter === 1}
        onclick={() => toggleRoute('modToFilter')}
        aria-pressed={modToFilter === 1}
      >
        filter
      </button>
    </div>
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

  .mod-layout {
    display: flex;
    gap: 28px;
    align-items: flex-start;
  }

  .routes {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .route-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .route-btn.active {
    background: #1a2a1a;
    color: #20b040;
    border-color: #20b040;
  }
</style>
