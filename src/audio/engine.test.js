import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNode = { connect: vi.fn(), disconnect: vi.fn(), setParamValue: vi.fn() }

vi.mock('@grame/faustwasm', () => {
  function FaustMonoDspGenerator() {
    this.createNode = vi.fn().mockResolvedValue(mockNode)
  }
  return { FaustMonoDspGenerator }
})

function makeMockCtx() {
  const analyserNode = {
    connect: vi.fn(),
    fftSize: 0,
  }

  return {
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    destination: {},
    createAnalyser: vi.fn().mockReturnValue(analyserNode),
    analyserNode,
  }
}

describe('powerOn / powerOff', () => {
  let mockCtx

  beforeEach(async () => {
    vi.resetModules()
    mockNode.connect.mockClear()
    mockNode.disconnect.mockClear()
    mockNode.setParamValue.mockClear()
    mockCtx = makeMockCtx()
    vi.stubGlobal(
      'AudioContext',
      vi.fn(function () {
        return mockCtx
      })
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) }))
    vi.stubGlobal('WebAssembly', { compileStreaming: vi.fn().mockResolvedValue({}) })
  })

  it('getAnalyser returns null before powerOn is called', async () => {
    const { getAnalyser } = await import('./engine.js')
    expect(getAnalyser()).toBeNull()
  })

  it('powerOn creates a new AudioContext on every call', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    await powerOn()
    expect(AudioContext).toHaveBeenCalledTimes(2)
  })

  it('powerOn always initialises a fresh AudioContext and DSP node', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    expect(AudioContext).toHaveBeenCalledOnce()
    expect(mockCtx.resume).toHaveBeenCalledOnce()
    expect(mockCtx.createAnalyser).toHaveBeenCalledOnce()
    expect(mockCtx.analyserNode.fftSize).toBe(2048)
  })

  it('powerOff disconnects the node and closes the AudioContext', async () => {
    const { powerOn, powerOff } = await import('./engine.js')
    await powerOn()
    await powerOff()
    expect(mockNode.disconnect).toHaveBeenCalledOnce()
    expect(mockCtx.close).toHaveBeenCalledOnce()
  })

  it('powerOff before powerOn is a no-op', async () => {
    const { powerOff } = await import('./engine.js')
    await expect(powerOff()).resolves.toBeUndefined()
    expect(mockCtx.close).not.toHaveBeenCalled()
  })

  it('powerOff on an already-closed context (crash recovery) resolves and nulls refs', async () => {
    const { powerOn, powerOff, getAnalyser } = await import('./engine.js')
    await powerOn()
    // Simulate a crashed AudioContext: close() resolves immediately even when already closed
    mockCtx.close.mockResolvedValue(undefined)
    await powerOff()
    // Second powerOff should be a no-op (ctx is null after first teardown)
    await expect(powerOff()).resolves.toBeUndefined()
    expect(getAnalyser()).toBeNull()
  })

  it('powerOn after powerOff creates a fresh AudioContext', async () => {
    const { powerOn, powerOff } = await import('./engine.js')
    await powerOn()
    await powerOff()
    await powerOn()
    expect(AudioContext).toHaveBeenCalledTimes(2)
    expect(mockCtx.close).toHaveBeenCalledOnce()
  })

  it('getAnalyser returns the analyser node after powerOn completes', async () => {
    const { powerOn, getAnalyser } = await import('./engine.js')
    await powerOn()
    expect(getAnalyser()).toBe(mockCtx.analyserNode)
  })

  it('getAnalyser returns null after powerOff', async () => {
    const { powerOn, powerOff, getAnalyser } = await import('./engine.js')
    await powerOn()
    await powerOff()
    expect(getAnalyser()).toBeNull()
  })

  it('connects the worklet node through the analyser to destination', async () => {
    const { powerOn } = await import('./engine.js')
    await powerOn()
    expect(mockNode.connect).toHaveBeenCalledWith(mockCtx.analyserNode)
    expect(mockCtx.analyserNode.connect).toHaveBeenCalledWith(mockCtx.destination)
  })
})
