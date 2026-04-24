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
  const analyserNode = {
    connect: vi.fn(),
    fftSize: 0,
  }

  return {
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    destination: {},
    createAnalyser: vi.fn().mockReturnValue(analyserNode),
    analyserNode,
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

  it('getAnalyser returns null before powerOn is called', async () => {
    const { getAnalyser } = await import('./engine.js')
    expect(getAnalyser()).toBeNull()
  })

  it('powerOn creates AudioContext and resumes on first call', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    expect(AudioContext).toHaveBeenCalledOnce()
    expect(mockCtx.resume).toHaveBeenCalledOnce()
    expect(mockCtx.createAnalyser).toHaveBeenCalledOnce()
    expect(mockCtx.analyserNode.fftSize).toBe(2048)
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

  it('getAnalyser returns the analyser node after powerOn completes', async () => {
    const { powerOn, getAnalyser } = await import('./engine.js')
    await powerOn()
    expect(getAnalyser()).toBe(mockCtx.analyserNode)
  })

  it('connects the worklet node through the analyser to destination', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    expect(mockNode.connect).toHaveBeenCalledWith(mockCtx.analyserNode)
    expect(mockCtx.analyserNode.connect).toHaveBeenCalledWith(mockCtx.destination)
  })
})
