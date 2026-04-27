export function mtof(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

export function normalizedToValue(pos, min, max, scale) {
  if (scale === 'log') {
    return min * Math.pow(max / min, pos)
  }
  // log-reverse: concentrates knob travel at the high end of the range.
  // pos=0→min, pos=1→max, pos=0.5≈(max+min−√(min·max)) — mirror of log around the midpoint.
  // Used for decay so the top half of the throw gives fine control over long tails.
  if (scale === 'log-reverse') {
    return max + min - min * Math.pow(max / min, 1 - pos)
  }
  return min + (max - min) * pos
}

export function valueToNormalized(val, min, max, scale) {
  if (scale === 'log') {
    return Math.log(val / min) / Math.log(max / min)
  }
  if (scale === 'log-reverse') {
    return 1 - Math.log((max + min - val) / min) / Math.log(max / min)
  }
  return (val - min) / (max - min)
}

export function formatValue(val, unit) {
  if (unit === 'Hz') {
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)} kHz`
    if (Math.abs(val) < 10) return `${val.toFixed(2)} Hz`
    return `${Math.round(val)} Hz`
  }
  if (unit === 's') {
    return val < 1 ? `${Math.round(val * 1000)} ms` : `${val.toFixed(2)} s`
  }
  return val.toFixed(2)
}
