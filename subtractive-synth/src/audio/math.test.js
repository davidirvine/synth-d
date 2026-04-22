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
})

describe('round-trip normalizedToValue / valueToNormalized', () => {
  const cases = [
    { val: 440, min: 20, max: 20000, scale: 'log' },
    { val: 200, min: 20, max: 20000, scale: 'log' },
    { val: 5000, min: 20, max: 20000, scale: 'log' },
    { val: 0.3, min: 0, max: 1, scale: 'linear' },
    { val: 0.75, min: 0, max: 1, scale: 'linear' },
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

  it('formats seconds < 1 as ms', () => {
    expect(formatValue(0.01, 's')).toBe('10 ms')
  })

  it('formats seconds >= 1 with two decimals', () => {
    expect(formatValue(1.5, 's')).toBe('1.50 s')
  })

  it('formats dimensionless values to two decimals', () => {
    expect(formatValue(0.75, '')).toBe('0.75')
  })
})
