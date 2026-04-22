<script>
  import { normalizedToValue, valueToNormalized, formatValue } from '../audio/math.js'

  let {
    label = '',
    min = 0,
    max = 1,
    default: defaultValue = 0.5,
    value: initialValue = undefined,
    scale = 'linear',
    unit = '',
    ticks = [],
    showLabel = true,
    showValue = true,
    onchange,
  } = $props()

  // Intentional one-time init from prop; knob owns its state after mount
  let value = $state(initialValue !== undefined ? initialValue : defaultValue)

  const SWEEP = 270
  const START_ANGLE = 225
  const CX = 24
  const CY = 24
  const R = 18

  function polarToXY(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
  }

  function tickXY(tick) {
    const angle = START_ANGLE + tick.pos * SWEEP
    return polarToXY(angle, tick.r ?? R + 10)
  }

  function arcPath(pos) {
    const startRad = ((START_ANGLE - 90) * Math.PI) / 180
    const endAngle = START_ANGLE + pos * SWEEP
    const endRad = ((endAngle - 90) * Math.PI) / 180
    const sx = CX + R * Math.cos(startRad)
    const sy = CY + R * Math.sin(startRad)
    const ex = CX + R * Math.cos(endRad)
    const ey = CY + R * Math.sin(endRad)
    const large = pos * SWEEP > 180 ? 1 : 0
    return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`
  }

  let pos = $derived(valueToNormalized(value, min, max, scale))
  let indicatorEnd = $derived(polarToXY(START_ANGLE + pos * SWEEP, R - 3))

  let dragging = false
  let lastY = 0
  let shiftHeld = false

  function onPointerDown(e) {
    dragging = true
    lastY = e.clientY
    shiftHeld = e.shiftKey
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging) return
    shiftHeld = e.shiftKey
    const delta = -(e.clientY - lastY)
    lastY = e.clientY
    const sensitivity = shiftHeld ? 0.001 : 0.01
    const newPos = Math.max(0, Math.min(1, pos + delta * sensitivity))
    const newValue = normalizedToValue(newPos, min, max, scale)
    value = newValue
    onchange?.({ value: newValue })
  }

  function onPointerUp() {
    dragging = false
  }

  function onDblClick() {
    value = defaultValue
    onchange?.({ value: defaultValue })
  }
</script>

<div class="knob-wrap">
  <span class="knob-label" class:invisible={!showLabel}>{label}</span>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="knob-hit"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    ondblclick={onDblClick}
  >
    <svg width="48" height="48" viewBox="0 0 48 48" style="overflow: visible;">
      <path d={arcPath(1)} class="track" fill="none" stroke-width="3" />
      <path d={arcPath(pos)} class="arc" fill="none" stroke-width="3" />
      <circle cx={CX} cy={CY} r="13" class="body" />
      <line
        x1={CX}
        y1={CY}
        x2={indicatorEnd.x}
        y2={indicatorEnd.y}
        class="indicator"
        stroke-width="2"
        stroke-linecap="round"
      />
      {#each ticks as tick (tick.label)}
        {@const xy = tickXY(tick)}
        <text x={xy.x} y={xy.y} class="tick-label" text-anchor="middle" dominant-baseline="middle"
          >{tick.label}</text
        >
      {/each}
    </svg>
  </div>
  <span class="knob-value" class:invisible={!showValue}>{formatValue(value, unit)}</span>
</div>

<style>
  .knob-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    user-select: none;
  }

  .knob-label {
    font-size: 10px;
    color: #e8dcc8;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .knob-value {
    font-size: 10px;
    color: #888;
  }

  .invisible {
    visibility: hidden;
  }

  .knob-hit {
    cursor: ns-resize;
    touch-action: none;
  }

  .track {
    stroke: #333;
  }

  .arc {
    stroke: #c87941;
  }

  .body {
    fill: #2a2a2a;
    stroke: #444;
    stroke-width: 1;
  }

  .indicator {
    stroke: #c87941;
  }

  .tick-label {
    font-size: 7px;
    fill: #555;
    font-family: monospace;
    text-transform: uppercase;
    pointer-events: none;
    user-select: none;
  }
</style>
