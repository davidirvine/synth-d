import { describe, it, expect } from 'vitest'
import { mtof, normalizedToValue, valueToNormalized, formatValue } from './math.js'

describe('mtof', () => {
  it('A4 (MIDI 69) = 440 Hz', () => {
    expect(mtof(69)).toBeCloseTo(440, 5)
  })

  it('A5 (MIDI 81) = 880 Hz', () => {
    expect(mtof(81)).toBeCloseTo(880, 5)
  })

  it('each octave doubles frequency', () => {
    expect(mtof(60) * 2).toBeCloseTo(mtof(72), 5)
    expect(mtof(57) * 2).toBeCloseTo(mtof(69), 5)
  })

  it('MIDI 57 = 220 Hz', () => {
    expect(mtof(57)).toBeCloseTo(220, 5)
  })
})

describe('normalizedToValue — log scale', () => {
  it('pos=0 returns min', () => {
    expect(normalizedToValue(0, 20, 20000, 'log')).toBeCloseTo(20, 5)
  })

  it('pos=1 returns max', () => {
    expect(normalizedToValue(1, 20, 20000, 'log')).toBeCloseTo(20000, 5)
  })

  it('pos=0.5 returns geometric mean', () => {
    const geoMean = Math.sqrt(20 * 20000)
    expect(normalizedToValue(0.5, 20, 20000, 'log')).toBeCloseTo(geoMean, 1)
  })

  it('interior point is strictly between min and max', () => {
    const v = normalizedToValue(0.3, 20, 20000, 'log')
    expect(v).toBeGreaterThan(20)
    expect(v).toBeLessThan(20000)
  })
})

describe('normalizedToValue — linear scale', () => {
  it('pos=0 returns min', () => {
    expect(normalizedToValue(0, 0, 1, 'linear')).toBe(0)
  })

  it('pos=1 returns max', () => {
    expect(normalizedToValue(1, 0, 1, 'linear')).toBe(1)
  })

  it('pos=0.5 returns midpoint', () => {
    expect(normalizedToValue(0.5, 0, 100, 'linear')).toBeCloseTo(50, 5)
  })

  it('interior point scales linearly', () => {
    expect(normalizedToValue(0.25, 0, 80, 'linear')).toBeCloseTo(20, 5)
  })

  it('works correctly with non-zero min', () => {
    expect(normalizedToValue(0.5, 100, 200, 'linear')).toBeCloseTo(150, 5)
    expect(normalizedToValue(0, 100, 200, 'linear')).toBeCloseTo(100, 5)
    expect(normalizedToValue(1, 100, 200, 'linear')).toBeCloseTo(200, 5)
  })
})

describe('valueToNormalized — log scale', () => {
  it('min maps to 0', () => {
    expect(valueToNormalized(20, 20, 20000, 'log')).toBeCloseTo(0, 5)
  })

  it('max maps to 1', () => {
    expect(valueToNormalized(20000, 20, 20000, 'log')).toBeCloseTo(1, 5)
  })

  it('interior value maps to correct position', () => {
    const geoMean = Math.sqrt(20 * 20000)
    expect(valueToNormalized(geoMean, 20, 20000, 'log')).toBeCloseTo(0.5, 5)
  })
})

describe('valueToNormalized — linear scale', () => {
  it('min maps to 0', () => {
    expect(valueToNormalized(0, 0, 1, 'linear')).toBeCloseTo(0, 5)
  })

  it('max maps to 1', () => {
    expect(valueToNormalized(1, 0, 1, 'linear')).toBeCloseTo(1, 5)
  })

  it('midpoint maps to 0.5', () => {
    expect(valueToNormalized(50, 0, 100, 'linear')).toBeCloseTo(0.5, 5)
  })

  it('works correctly with non-zero min', () => {
    expect(valueToNormalized(150, 100, 200, 'linear')).toBeCloseTo(0.5, 5)
    expect(valueToNormalized(100, 100, 200, 'linear')).toBeCloseTo(0, 5)
    expect(valueToNormalized(200, 100, 200, 'linear')).toBeCloseTo(1, 5)
  })
})

describe('normalizedToValue — log-reverse scale', () => {
  const min = 0.01
  const max = 1

  it('pos=0 returns min', () => {
    expect(normalizedToValue(0, min, max, 'log-reverse')).toBeCloseTo(min, 5)
  })

  it('pos=1 returns max', () => {
    expect(normalizedToValue(1, min, max, 'log-reverse')).toBeCloseTo(max, 5)
  })

  it('pos=0.5 concentrates travel at the high end (value > arithmetic midpoint)', () => {
    const midpoint = (min + max) / 2
    const v = normalizedToValue(0.5, min, max, 'log-reverse')
    expect(v).toBeGreaterThan(midpoint)
    expect(v).toBeCloseTo(max + min - Math.sqrt(min * max), 5)
  })

  it('interior point is strictly between min and max', () => {
    const v = normalizedToValue(0.75, min, max, 'log-reverse')
    expect(v).toBeGreaterThan(min)
    expect(v).toBeLessThan(max)
  })
})

describe('valueToNormalized — log-reverse scale', () => {
  const min = 0.01
  const max = 1

  it('min maps to 0', () => {
    expect(valueToNormalized(min, min, max, 'log-reverse')).toBeCloseTo(0, 5)
  })

  it('max maps to 1', () => {
    expect(valueToNormalized(max, min, max, 'log-reverse')).toBeCloseTo(1, 5)
  })

  it('midpoint value maps to 0.5', () => {
    const mid = max + min - Math.sqrt(min * max)
    expect(valueToNormalized(mid, min, max, 'log-reverse')).toBeCloseTo(0.5, 5)
  })

  it('value above max+min threshold returns NaN (callers must clamp to [min,max])', () => {
    // Math.log((max+min-val)/min) goes negative when val > max+min.
    // Knob always clamps externalValue and drag output to [min,max], so this is unreachable in practice.
    const pos = valueToNormalized(max + min + 0.001, min, max, 'log-reverse')
    expect(Number.isNaN(pos)).toBe(true)
  })
})

describe('normalizedToValue — fine-center scale', () => {
  const min = -100
  const max = 100

  it('pos=0.5 returns center (0 cents)', () => {
    expect(normalizedToValue(0.5, min, max, 'fine-center')).toBeCloseTo(0, 10)
  })

  it('pos=0 returns min (-100 cents)', () => {
    expect(normalizedToValue(0, min, max, 'fine-center')).toBeCloseTo(-100, 5)
  })

  it('pos=1 returns max (100 cents)', () => {
    expect(normalizedToValue(1, min, max, 'fine-center')).toBeCloseTo(100, 5)
  })

  it('pos≈0.342 returns approximately -10 cents (within 0.1)', () => {
    const val = normalizedToValue(0.342, min, max, 'fine-center')
    expect(Math.abs(val - -10)).toBeLessThan(0.1)
  })
})

describe('valueToNormalized — fine-center scale', () => {
  const min = -100
  const max = 100

  it('center (0 cents) maps to pos 0.5', () => {
    expect(valueToNormalized(0, min, max, 'fine-center')).toBeCloseTo(0.5, 10)
  })

  it('min (-100 cents) maps to pos 0', () => {
    expect(valueToNormalized(-100, min, max, 'fine-center')).toBeCloseTo(0, 5)
  })

  it('max (100 cents) maps to pos 1', () => {
    expect(valueToNormalized(100, min, max, 'fine-center')).toBeCloseTo(1, 5)
  })
})

describe('round-trip normalizedToValue / valueToNormalized', () => {
  const cases = [
    { val: 440, min: 20, max: 20000, scale: 'log' },
    { val: 200, min: 20, max: 20000, scale: 'log' },
    { val: 5000, min: 20, max: 20000, scale: 'log' },
    { val: 0.3, min: 0, max: 1, scale: 'linear' },
    { val: 0.75, min: 0, max: 1, scale: 'linear' },
    { val: 0.5, min: 0.01, max: 1, scale: 'log-reverse' },
    { val: 0.9, min: 0.01, max: 1, scale: 'log-reverse' },
    { val: 0.1, min: 0.01, max: 1, scale: 'log-reverse' },
    { val: 0, min: -100, max: 100, scale: 'fine-center' },
    { val: -50, min: -100, max: 100, scale: 'fine-center' },
    { val: 30, min: -100, max: 100, scale: 'fine-center' },
    { val: -10, min: -100, max: 100, scale: 'fine-center' },
  ]

  cases.forEach(({ val, min, max, scale }) => {
    it(`round-trips ${val} [${min}–${max}, ${scale}]`, () => {
      const pos = valueToNormalized(val, min, max, scale)
      const back = normalizedToValue(pos, min, max, scale)
      expect(back).toBeCloseTo(val, 4)
    })
  })
})

describe('formatValue', () => {
  it('formats Hz below 1000 as integer Hz', () => {
    expect(formatValue(440, 'Hz')).toBe('440 Hz')
  })

  it('formats Hz >= 1000 as kHz', () => {
    expect(formatValue(2000, 'Hz')).toBe('2.0 kHz')
  })

  it('formats exactly 1000 Hz as kHz (boundary >= 1000)', () => {
    expect(formatValue(1000, 'Hz')).toBe('1.0 kHz')
  })

  it('formats 999 Hz as Hz (boundary below 1000)', () => {
    expect(formatValue(999, 'Hz')).toBe('999 Hz')
  })

  it('formats negative Hz >= -1000 as Hz', () => {
    expect(formatValue(-440, 'Hz')).toBe('-440 Hz')
  })

  it('formats negative Hz <= -1000 as kHz', () => {
    expect(formatValue(-2000, 'Hz')).toBe('-2.0 kHz')
  })

  it('formats exactly -1000 Hz as kHz (boundary)', () => {
    expect(formatValue(-1000, 'Hz')).toBe('-1.0 kHz')
  })

  it('formats seconds < 1 as ms', () => {
    expect(formatValue(0.01, 's')).toBe('10 ms')
  })

  it('formats seconds >= 1 with two decimals', () => {
    expect(formatValue(1.5, 's')).toBe('1.50 s')
  })

  it('formats exactly 1.0 s as seconds not ms (boundary < 1)', () => {
    expect(formatValue(1.0, 's')).toBe('1.00 s')
  })

  it('formats 0.999 s as ms', () => {
    expect(formatValue(0.999, 's')).toBe('999 ms')
  })

  it('formats sub-10 Hz with two decimal places', () => {
    expect(formatValue(0.1, 'Hz')).toBe('0.10 Hz')
  })

  it('formats 9.9 Hz with two decimals (below 10 boundary)', () => {
    expect(formatValue(9.9, 'Hz')).toBe('9.90 Hz')
  })

  it('formats 0.5 Hz with two decimals', () => {
    expect(formatValue(0.5, 'Hz')).toBe('0.50 Hz')
  })

  it('formats 10 Hz as integer (boundary: 10 is not < 10)', () => {
    expect(formatValue(10, 'Hz')).toBe('10 Hz')
  })

  it('formats dimensionless values to two decimals', () => {
    expect(formatValue(0.75, '')).toBe('0.75')
  })
})
