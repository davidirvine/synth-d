<script>
  // A single spring-loaded wheel: a vertical track with a horizontal cursor line
  // that the user drags (or arrow-keys) and which springs back to 0.5 on release
  // via the shared damped-harmonic-oscillator integrator. The component is
  // display-agnostic — it emits `onchange({ value })` (matching Knob) and leaves
  // the synth-param mapping and aria value-text formatting to its parent.
  import { REST, stepSpring, isAtRest, DEFAULT_PHYSICS } from '../audio/wheelPhysics.js'

  /** @type {{
    label?: string,
    externalValue?: number,
    mass?: number,
    spring?: number,
    damping?: number,
    formatValueText?: (value: number) => string,
    onchange?: (e: { value: number }) => void,
  }} */
  let {
    label = '',
    externalValue = undefined,
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

  let value = $state(REST)
  let cursorTop = $derived((1 - value) * (TRACK_HEIGHT - CURSOR_THICKNESS))

  // Plain (untracked) interaction state — drag is gated imperatively, not via
  // reactivity, so the externalValue effect below tracks only externalValue.
  let dragging = false
  let startY = 0
  let startVal = REST

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
    const next = stepSpring({ value, velocity, mass, spring, dampingRatio: damping, dt })
    value = next.value
    velocity = next.velocity
    if (isAtRest(value, velocity)) {
      value = REST
      velocity = 0
      rafId = null
      onchange?.({ value })
      return
    }
    onchange?.({ value })
    rafId = requestAnimationFrame(tick)
  }

  function startSpring() {
    cancelSpring()
    velocity = 0
    // Seed lastTime so the first frame's dt is small (clamped regardless).
    lastTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  // Programmatic value (power transitions, incoming MIDI CC 1 / pitch-bend):
  // snap the cursor and cancel any active spring-back — external input wins.
  // Does NOT fire onchange (the caller already wrote the param).
  $effect(() => {
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

  /** @param {KeyboardEvent} e */
  function onKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      cancelSpring()
      value = Math.min(1, value + KEY_STEP)
      onchange?.({ value })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      cancelSpring()
      value = Math.max(0, value - KEY_STEP)
      onchange?.({ value })
    }
    // Left/Right and Home/End are intentionally ignored.
  }

  /** @param {KeyboardEvent} e */
  function onKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      startSpring()
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
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .wheel-track {
    position: relative;
    width: 18px;
    height: 60px;
    background: #2a2a2a;
    border: 1px solid #444;
    cursor: ns-resize;
    touch-action: none;
  }

  .wheel-track:focus-visible {
    outline: 2px solid #c87941;
    outline-offset: 2px;
  }

  .wheel-cursor {
    position: absolute;
    left: 0;
    width: 100%;
    height: 4px;
    background: #c87941;
  }
</style>
