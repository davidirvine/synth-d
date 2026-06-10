<script>
  // A single spring-loaded wheel: a vertical track with a horizontal cursor line
  // that the user drags (or arrow-keys) and which springs back to 0.5 on release
  // via the shared damped-harmonic-oscillator integrator. The component is
  // display-agnostic — it emits `onchange({ value })` (matching Knob) and leaves
  // the synth-param mapping and aria value-text formatting to its parent.
  import { untrack } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { REST, stepSpring, isAtRest, DEFAULT_PHYSICS } from '../audio/wheelPhysics.js'

  /** @type {{
    label?: string,
    externalValue?: number,
    externalNonce?: number,
    springBack?: boolean,
    mass?: number,
    spring?: number,
    damping?: number,
    rest?: number,
    formatValueText?: (value: number) => string,
    onchange?: (e: { value: number }) => void,
  }} */
  let {
    label = '',
    externalValue = undefined,
    externalNonce = 0,
    springBack = true,
    rest = REST,
    mass = DEFAULT_PHYSICS.mass,
    spring = DEFAULT_PHYSICS.spring,
    damping = DEFAULT_PHYSICS.damping,
    formatValueText = undefined,
    onchange,
  } = $props()

  // Track / cursor geometry (px). The cursor's top edge travels [0, H−T] so the
  // 4px line sits flush at each edge instead of half-clipping.
  const TRACK_HEIGHT = 60
  const CURSOR_THICKNESS = 4
  const KEY_STEP = 0.05

  // Initialise the cursor at this wheel's `rest` (PITCH 0.5, MOD 0). Read once
  // via untrack so the initializer doesn't subscribe to the prop — `rest` is
  // fixed per instance and external/drag updates own `value` thereafter.
  let value = $state(untrack(() => rest))
  let cursorTop = $derived((1 - value) * (TRACK_HEIGHT - CURSOR_THICKNESS))

  // Plain (untracked) interaction state. `dragging` is deliberately NOT $state:
  // the externalValue effect below reads it only to gate, and keeping it
  // untracked means that effect subscribes to `externalValue` alone. So an
  // external value arriving mid-drag is correctly ignored (dragging is true at
  // read time), and the effect does not spuriously re-fire when the drag ends
  // with the same externalValue still set — the released wheel springs home
  // instead of re-snapping to a stale external value.
  let dragging = false
  let startY = 0
  let startVal = untrack(() => rest)

  // RAF spring-back loop state.
  let rafId = /** @type {number | null} */ (null)
  let velocity = 0
  let lastTime = 0

  function cancelSpring() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /** @param {number} now */
  function tick(now) {
    const dt = (now - lastTime) / 1000
    lastTime = now
    const next = stepSpring({ value, velocity, mass, spring, dampingRatio: damping, dt, rest })
    value = next.value
    velocity = next.velocity
    if (isAtRest(value, velocity, rest)) {
      value = rest
      velocity = 0
      rafId = null
      onchange?.({ value })
      return
    }
    onchange?.({ value })
    rafId = requestAnimationFrame(tick)
  }

  function startSpring() {
    // A non-spring wheel (springBack=false) holds wherever it was left: no RAF
    // loop is started, so the cursor stays put instead of returning to rest.
    if (!springBack) return
    cancelSpring()
    // The spring starts from rest at the released position (no carried-over drag
    // velocity), matching the design's integrator model. A "flick" feel that
    // preserves release velocity is a possible future enhancement, not required.
    velocity = 0
    // Seed lastTime so the first frame's dt is small (clamped regardless).
    lastTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  // Programmatic value (power transitions, incoming MIDI CC 1 / pitch-bend):
  // snap the cursor and cancel any active spring-back — external input wins.
  // Does NOT fire onchange (the caller already wrote the param).
  //
  // The effect also subscribes to `externalNonce`, which the parent bumps on
  // every external write. Without it, an external value equal to the previous
  // one would be deduped by Svelte and never re-run this effect, so a repeated
  // identical MIDI CC/pitch-bend value would fail to cancel an in-flight spring.
  $effect(() => {
    externalNonce
    if (externalValue !== undefined && !dragging) {
      cancelSpring()
      value = externalValue
    }
  })

  // Tear down the RAF loop on unmount so no frame leaks past the component.
  $effect(() => () => cancelSpring())

  /** @param {PointerEvent & { currentTarget: Element }} e */
  function onPointerDown(e) {
    cancelSpring()
    dragging = true
    startY = e.clientY
    startVal = value
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  /** @param {PointerEvent} e */
  function onPointerMove(e) {
    if (!dragging) return
    const delta = (startY - e.clientY) / 80
    value = Math.max(0, Math.min(1, startVal + delta))
    onchange?.({ value })
  }

  function onPointerUp() {
    if (!dragging) return
    dragging = false
    startSpring()
  }

  // Arrow keys currently held. The spring fires only once every arrow is
  // released, so overlapping presses (e.g. ArrowDown pressed while ArrowUp is
  // still down) don't start a spring-back that fights the still-held key.
  const heldArrows = new SvelteSet()

  /** @param {KeyboardEvent} e */
  function onKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      heldArrows.add(e.key)
      cancelSpring()
      value = Math.min(1, value + KEY_STEP)
      onchange?.({ value })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      heldArrows.add(e.key)
      cancelSpring()
      value = Math.max(0, value - KEY_STEP)
      onchange?.({ value })
    }
    // Left/Right and Home/End are intentionally ignored.
  }

  /** @param {KeyboardEvent} e */
  function onKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      heldArrows.delete(e.key)
      if (heldArrows.size === 0) startSpring()
    }
  }
</script>

<div class="wheel">
  <span class="wheel-label">{label}</span>
  <div
    class="wheel-track"
    role="slider"
    tabindex={0}
    aria-label={`${label} wheel`}
    aria-valuemin={0}
    aria-valuemax={1}
    aria-valuenow={value}
    aria-valuetext={formatValueText ? formatValueText(value) : undefined}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onkeydown={onKeyDown}
    onkeyup={onKeyUp}
  >
    <div class="wheel-cursor" style="top: {cursorTop}px"></div>
  </div>
</div>

<style>
  .wheel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .wheel-label {
    font-size: 10px;
    color: var(--panel-label-color, #e8dcc8);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .wheel-track {
    position: relative;
    width: 18px;
    height: 60px;
    background: var(--control-bg, #2a2a2a);
    border: 1px solid var(--control-border, #444);
    cursor: ns-resize;
    touch-action: none;
  }

  .wheel-track:focus-visible {
    outline: 2px solid var(--accent-color, #c87941);
    outline-offset: 2px;
  }

  .wheel-cursor {
    position: absolute;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--accent-color, #c87941);
  }
</style>
