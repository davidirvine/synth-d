export function mtof(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

export function normalizedToValue(pos, min, max, scale) {
  if (scale === 'log') {
    return min * Math.pow(max / min, pos)
  }
  return min + (max - min) * pos
}

export function valueToNormalized(val, min, max, scale) {
  if (scale === 'log') {
    return Math.log(val / min) / Math.log(max / min)
  }
  return (val - min) / (max - min)
}

export function formatValue(val, unit) {
  if (unit === 'Hz') {
    return val >= 1000 ? `${(val / 1000).toFixed(1)} kHz` : `${Math.round(val)} Hz`
  }
  if (unit === 's') {
    return val < 1 ? `${Math.round(val * 1000)} ms` : `${val.toFixed(2)} s`
  }
  return val.toFixed(2)
}
