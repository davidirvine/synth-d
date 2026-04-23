import { describe, it, expect } from 'vitest'
import { filterGains } from './filterGains.js'

describe('filterGains — pure modes', () => {
  it('mode=0 → full LP, no BP, no HP', () => {
    const { lpGain, bpGain, hpGain } = filterGains(0)
    expect(lpGain).toBeCloseTo(1, 5)
    expect(bpGain).toBeCloseTo(0, 5)
    expect(hpGain).toBeCloseTo(0, 5)
  })

  it('mode=1 → no LP, full BP, no HP', () => {
    const { lpGain, bpGain, hpGain } = filterGains(1)
    expect(lpGain).toBeCloseTo(0, 5)
    expect(bpGain).toBeCloseTo(1, 5)
    expect(hpGain).toBeCloseTo(0, 5)
  })

  it('mode=2 → no LP, no BP, full HP', () => {
    const { lpGain, bpGain, hpGain } = filterGains(2)
    expect(lpGain).toBeCloseTo(0, 5)
    expect(bpGain).toBeCloseTo(0, 5)
    expect(hpGain).toBeCloseTo(1, 5)
  })
})

describe('filterGains — crossfade midpoints', () => {
  it('mode=0.5 → half LP, half BP, no HP', () => {
    const { lpGain, bpGain, hpGain } = filterGains(0.5)
    expect(lpGain).toBeCloseTo(0.5, 5)
    expect(bpGain).toBeCloseTo(0.5, 5)
    expect(hpGain).toBeCloseTo(0, 5)
  })

  it('mode=1.5 → no LP, half BP, half HP', () => {
    const { lpGain, bpGain, hpGain } = filterGains(1.5)
    expect(lpGain).toBeCloseTo(0, 5)
    expect(bpGain).toBeCloseTo(0.5, 5)
    expect(hpGain).toBeCloseTo(0.5, 5)
  })
})

describe('filterGains — gains stay non-negative', () => {
  const modes = [-0.1, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.1]
  modes.forEach((mode) => {
    it(`mode=${mode} produces no negative gains`, () => {
      const { lpGain, bpGain, hpGain } = filterGains(mode)
      expect(lpGain).toBeGreaterThanOrEqual(0)
      expect(bpGain).toBeGreaterThanOrEqual(0)
      expect(hpGain).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('filterGains — gain ordering', () => {
  it('LP gain strictly decreases across 0→0.5→1', () => {
    expect(filterGains(0).lpGain).toBeGreaterThan(filterGains(0.5).lpGain)
    expect(filterGains(0.5).lpGain).toBeGreaterThan(filterGains(1).lpGain)
  })

  it('LP gain is 0 for mode >= 1', () => {
    expect(filterGains(1).lpGain).toBe(0)
    expect(filterGains(2).lpGain).toBe(0)
  })

  it('HP gain strictly increases across 1→1.5→2', () => {
    expect(filterGains(1).hpGain).toBeLessThan(filterGains(1.5).hpGain)
    expect(filterGains(1.5).hpGain).toBeLessThan(filterGains(2).hpGain)
  })

  it('HP gain is 0 for mode <= 1', () => {
    expect(filterGains(0).hpGain).toBe(0)
    expect(filterGains(1).hpGain).toBe(0)
  })

  it('BP peaks at mode=1', () => {
    expect(filterGains(1).bpGain).toBeGreaterThan(filterGains(0.5).bpGain)
    expect(filterGains(1).bpGain).toBeGreaterThan(filterGains(1.5).bpGain)
  })
})
