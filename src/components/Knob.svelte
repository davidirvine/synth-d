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
    showArc = true,
    bipolar = false,
    externalValue = undefined,
    learningMidi = false,
    assignedCc = null,
    onchange,
    oncontextmenu,
  } = /** @type {{
    label?: string,
    min?: number,
    max?: number,
    default?: number,
    value?: number,
    scale?: string,
    unit?: string,
    ticks?: Array<{ pos: number, label: string, r?: number }>,
    showLabel?: boolean,
    showValue?: boolean,
    showArc?: boolean,
    bipolar?: boolean,
    externalValue?: number,
    learningMidi?: boolean,
    assignedCc?: number | null,
    onchange?: (e: { value: number }) => void,
    oncontextmenu?: () => void
  }} */ ($props())

  // Intentional one-time init — knob owns its state after mount, external prop changes are ignored.
  // Svelte 5 warns "only captures the initial value" here; that is the intended design.
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

  function bipolarArcPath(pos) {
    if (Math.abs(pos - 0.5) < 0.001) return ''
    const centerAngle = START_ANGLE + 0.5 * SWEEP
    const centerRad = ((centerAngle - 90) * Math.PI) / 180
    const cx2 = CX + R * Math.cos(centerRad)
    const cy2 = CY + R * Math.sin(centerRad)
    const endAngle = START_ANGLE + pos * SWEEP
    const endRad = ((endAngle - 90) * Math.PI) / 180
    const ex = CX + R * Math.cos(endRad)
    const ey = CY + R * Math.sin(endRad)
    if (pos > 0.5) {
      const large = (pos - 0.5) * SWEEP > 180 ? 1 : 0
      return `M ${cx2} ${cy2} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`
    } else {
      const large = (0.5 - pos) * SWEEP > 180 ? 1 : 0
      return `M ${ex} ${ey} A ${R} ${R} 0 ${large} 1 ${cx2} ${cy2}`
    }
  }

  let pos = $derived(valueToNormalized(value, min, max, scale))
  let indicatorEnd = $derived(polarToXY(START_ANGLE + pos * SWEEP, R - 3))
  let activePath = $derived(showArc ? (bipolar ? bipolarArcPath(pos) : arcPath(pos)) : null)

  let dragging = false
  let lastY = 0
  let shiftHeld = false

  // Apply externalValue when not dragging
  $effect(() => {
    if (externalValue !== undefined && !dragging) {
      const clamped = Math.max(min, Math.min(max, externalValue))
      if (clamped !== value) {
        value = clamped
        onchange?.({ value: clamped })
      }
    }
  })

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

  function handleContextMenu(/** @type {MouseEvent} */ e) {
    e.preventDefault()
    oncontextmenu?.()
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
    oncontextmenu={handleContextMenu}
  >
    <svg width="48" height="48" viewBox="0 0 48 48" style="overflow: visible;">
      {#if learningMidi}
        <circle cx={CX} cy={CY} r={R + 4} class="learn-ring" fill="none" stroke-width="2" />
      {/if}
      <path d={arcPath(1)} class="track" fill="none" stroke-width="3" />
      {#if activePath}
        <path d={activePath} class="arc" fill="none" stroke-width="3" />
      {/if}
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
  {#if assignedCc !== null}
    <span class="cc-label">CC {assignedCc}</span>
  {/if}
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

  .cc-label {
    font-size: 9px;
    color: #666;
    font-family: monospace;
    letter-spacing: 0.03em;
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
    fill: #e8dcc8;
    font-family: monospace;
    text-transform: uppercase;
    pointer-events: none;
    user-select: none;
  }

  .learn-ring {
    stroke: #c87941;
    animation: learn-pulse 0.8s ease-in-out infinite alternate;
  }

  @keyframes learn-pulse {
    from {
      opacity: 0.3;
    }
    to {
      opacity: 1;
    }
  }
</style>
