<script>
  // The standalone wheels panel: a MOD and a PITCH spring-loaded wheel side by
  // side, a gear button (visually top-left, last in tab order) opening a popup
  // of per-wheel physics knobs, and localStorage persistence of those physics.
  // Each wheel stays param-agnostic; this panel adds the synth `param` (MOD →
  // `modWheel`) or forwards to the pitch handler before bubbling onchange up.
  import { tick } from 'svelte'
  import Wheel from './Wheel.svelte'
  import Knob from './Knob.svelte'
  import { PHYSICS_RANGES } from '../audio/wheelPhysics.js'
  import { BEND_SEMITONES } from '../audio/pitchbend.js'
  import {
    loadWheelPhysics,
    saveWheelPhysics,
    resetWheelPhysics,
  } from '../audio/wheelPhysicsStore.js'

  /** @type {{
    modExternalValue?: number,
    pitchExternalValue?: number,
    onModChange?: (e: { param: string, value: number }) => void,
    onPitchChange?: (e: { value: number }) => void,
  }} */
  let { modExternalValue, pitchExternalValue, onModChange, onPitchChange } = $props()

  let physics = $state(loadWheelPhysics())

  let open = $state(false)
  let rootEl = $state(/** @type {HTMLElement | null} */ (null))
  let gearEl = $state(/** @type {HTMLButtonElement | null} */ (null))
  let popupEl = $state(/** @type {HTMLElement | null} */ (null))

  // PITCH cursor maps 0–1 to ±BEND_SEMITONES around 0.5 (no bend). Surfaced to
  // the slider as aria-valuetext so screen readers announce the bend in
  // semitones rather than a bare 0–1 number.
  /** @param {number} v */
  function pitchValueText(v) {
    const semis = (v - 0.5) * 2 * BEND_SEMITONES
    const rounded = Math.round(semis * 100) / 100
    return `${rounded > 0 ? '+' : ''}${rounded} st`
  }

  /** @param {number} v */
  function modValueText(v) {
    return `${Math.round(v * 100)}%`
  }

  async function toggleOpen() {
    open = !open
    if (open) {
      // Move focus into the popup so keyboard users land on the settings.
      await tick()
      popupEl?.focus()
    }
  }

  /**
   * Update one physics field and persist. Bound to each knob's onchange.
   * @param {'mod' | 'pitch'} wheel
   * @param {'mass' | 'spring' | 'damping'} field
   * @param {number} value
   */
  function updatePhysics(wheel, field, value) {
    physics = { ...physics, [wheel]: { ...physics[wheel], [field]: value } }
    saveWheelPhysics(physics)
  }

  function resetPhysics() {
    physics = resetWheelPhysics()
  }

  /** @param {KeyboardEvent} e */
  function onKeyDown(e) {
    // Listening on the window (rather than rootEl) matches the established
    // popover pattern in PatchControl: the popup can be dismissed by Escape
    // regardless of which descendant holds focus. `stopPropagation` keeps the
    // same Escape from also reaching App's MIDI-learn-cancel handler.
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      open = false
      gearEl?.focus()
    }
  }

  /** @param {PointerEvent} e */
  function onWindowPointerDown(e) {
    // Close on a press outside the panel (pointerdown, not click, so the check
    // runs before an in-popup handler can detach its own target).
    if (open && rootEl && e.target instanceof Node && !rootEl.contains(e.target)) {
      open = false
    }
  }
</script>

<svelte:window onkeydown={onKeyDown} onpointerdown={onWindowPointerDown} />

<div class="wheels-panel" bind:this={rootEl}>
  <div class="wheels">
    <Wheel
      label="MOD"
      externalValue={modExternalValue}
      mass={physics.mod.mass}
      spring={physics.mod.spring}
      damping={physics.mod.damping}
      formatValueText={modValueText}
      onchange={(e) => onModChange?.({ param: 'modWheel', value: e.value })}
    />
    <Wheel
      label="PITCH"
      externalValue={pitchExternalValue}
      mass={physics.pitch.mass}
      spring={physics.pitch.spring}
      damping={physics.pitch.damping}
      formatValueText={pitchValueText}
      onchange={(e) => onPitchChange?.({ value: e.value })}
    />
  </div>

  <!-- Gear sits visually top-left but comes last in DOM, so tab order is
       MOD → PITCH → gear. -->
  <button
    class="gear"
    bind:this={gearEl}
    onclick={toggleOpen}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-label="wheel physics settings"
    title="Wheel physics"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm9-2a7.5 7.5 0 0 0-.07-1l2-1.55-2-3.46-2.35.95a7.4 7.4 0 0 0-1.74-1l-.36-2.49h-4l-.36 2.49a7.4 7.4 0 0 0-1.74 1L6.07 5l-2 3.46L6.07 10a7.5 7.5 0 0 0 0 2l-2 1.55 2 3.46 2.35-.95a7.4 7.4 0 0 0 1.74 1l.36 2.49h4l.36-2.49a7.4 7.4 0 0 0 1.74-1l2.35.95 2-3.46-2-1.55c.05-.33.07-.66.07-1z"
      />
    </svg>
  </button>

  {#if open}
    <div class="popup" bind:this={popupEl} role="dialog" aria-label="wheel physics" tabindex="-1">
      {#each ['mod', 'pitch'] as wheel (wheel)}
        <div class="physics-group">
          <span class="group-label">{wheel === 'mod' ? 'MOD' : 'PITCH'}</span>
          <div class="knobs">
            <Knob
              label="MASS"
              min={PHYSICS_RANGES.mass.min}
              max={PHYSICS_RANGES.mass.max}
              default={PHYSICS_RANGES.mass.default}
              externalValue={physics[wheel].mass}
              showArc={false}
              onchange={(e) => updatePhysics(wheel, 'mass', e.value)}
            />
            <Knob
              label="SPRING"
              min={PHYSICS_RANGES.spring.min}
              max={PHYSICS_RANGES.spring.max}
              default={PHYSICS_RANGES.spring.default}
              externalValue={physics[wheel].spring}
              showArc={false}
              onchange={(e) => updatePhysics(wheel, 'spring', e.value)}
            />
            <Knob
              label="DAMP"
              min={PHYSICS_RANGES.damping.min}
              max={PHYSICS_RANGES.damping.max}
              default={PHYSICS_RANGES.damping.default}
              externalValue={physics[wheel].damping}
              showArc={false}
              onchange={(e) => updatePhysics(wheel, 'damping', e.value)}
            />
          </div>
        </div>
      {/each}
      <button class="reset" onclick={resetPhysics}>reset</button>
    </div>
  {/if}
</div>

<style>
  .wheels-panel {
    position: relative;
    background: #1c1c1c;
    border: 1px solid #333;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .wheels {
    display: flex;
    gap: 16px;
  }

  .gear {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
  }

  .gear:hover {
    color: #c87941;
  }

  .gear:focus-visible {
    outline: 2px solid #c87941;
    outline-offset: 2px;
  }

  .popup {
    position: absolute;
    top: 32px;
    left: 6px;
    z-index: 10;
    max-width: calc(100vw - 24px);
    background: #1c1c1c;
    border: 1px solid #444;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .popup:focus-visible {
    outline: 2px solid #c87941;
    outline-offset: 2px;
  }

  .physics-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .group-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .knobs {
    display: flex;
    gap: 10px;
  }

  .reset {
    align-self: flex-start;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #e8dcc8;
    background: #2a2a2a;
    border: 1px solid #444;
    padding: 4px 10px;
    cursor: pointer;
  }

  .reset:hover {
    border-color: #c87941;
  }

  .reset:focus-visible {
    outline: 2px solid #c87941;
    outline-offset: 2px;
  }
</style>
