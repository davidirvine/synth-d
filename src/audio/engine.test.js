import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNode = { connect: vi.fn(), setParamValue: vi.fn() }

vi.mock('@grame/faustwasm', () => {
  function FaustMonoDspGenerator() {
    this.factory = null
    this.createNode = vi.fn().mockResolvedValue(mockNode)
  }
  return {
    FaustWasmInstantiator: {
      loadDSPFactory: vi.fn().mockResolvedValue({}),
    },
    FaustMonoDspGenerator,
  }
})

function makeMockCtx() {
  return {
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    destination: {},
  }
}

describe('powerOn / powerOff', () => {
  let mockCtx

  beforeEach(async () => {
    vi.resetModules()
    mockCtx = makeMockCtx()
    const MockAudioContext = vi.fn(function () {
      return mockCtx
    })
    vi.stubGlobal('AudioContext', MockAudioContext)
  })

  it('powerOn creates AudioContext and resumes on first call', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    expect(AudioContext).toHaveBeenCalledOnce()
    expect(mockCtx.resume).toHaveBeenCalledOnce()
  })

  it('powerOn resumes without creating a new AudioContext on subsequent calls', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    await powerOn()
    expect(AudioContext).toHaveBeenCalledOnce()
    expect(mockCtx.resume).toHaveBeenCalledTimes(2)
  })

  it('powerOff suspends the AudioContext', async () => {
    const { powerOn, powerOff } = await import('./engine.js')
    await powerOn()
    await powerOff()
    expect(mockCtx.suspend).toHaveBeenCalledOnce()
  })

  it('powerOff before powerOn is a no-op', async () => {
    const { powerOff } = await import('./engine.js')
    await expect(powerOff()).resolves.toBeUndefined()
    expect(mockCtx.suspend).not.toHaveBeenCalled()
  })

  it('powerOn after powerOff resumes without re-initialising', async () => {
    const { powerOn, powerOff } = await import('./engine.js')
    await powerOn()
    await powerOff()
    await powerOn()
    expect(AudioContext).toHaveBeenCalledOnce()
    expect(mockCtx.resume).toHaveBeenCalledTimes(2)
    expect(mockCtx.suspend).toHaveBeenCalledOnce()
  })
})
