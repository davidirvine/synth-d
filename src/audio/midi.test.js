import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MidiManager } from './midi.js'

// jsdom has no navigator.requestMIDIAccess; install a mock via defineProperty.
function mockMidiAccess(access) {
  Object.defineProperty(navigator, 'requestMIDIAccess', {
    value: vi.fn().mockResolvedValue(access),
    configurable: true,
    writable: true,
  })
}

function removeMidiAccess() {
  Object.defineProperty(navigator, 'requestMIDIAccess', {
    value: undefined,
    configurable: true,
    writable: true,
  })
}

function makeMidiAccess(ports = []) {
  const inputMap = new Map(ports.map((p) => [p.id, p]))
  const access = { inputs: inputMap, onstatechange: null }
  // Propagate onstatechange assignments so we can fire them in tests
  return access
}

function makePort(id = 'port-1', name = 'Test MIDI') {
  return { id, name, type: 'input', state: 'connected', onmidimessage: null }
}

function midiEvent(bytes) {
  return { data: new Uint8Array(bytes) }
}

describe('MidiManager — constructor / callbacks', () => {
  it('accepts callbacks without throwing', () => {
    expect(() => new MidiManager({ onNoteOn: vi.fn() })).not.toThrow()
  })

  it('defaults all callbacks to no-ops', () => {
    const m = new MidiManager()
    expect(() => m._onNoteOn()).not.toThrow()
    expect(() => m._onNoteOff()).not.toThrow()
    expect(() => m._onPitchBend()).not.toThrow()
    expect(() => m._onCc()).not.toThrow()
    expect(() => m._onStatusChange()).not.toThrow()
    expect(() => m._onDevicesChange()).not.toThrow()
  })
})

describe('MidiManager — connect: unsupported browser', () => {
  afterEach(() => vi.restoreAllMocks())

  it('calls onStatusChange("unavailable") when requestMIDIAccess is absent', async () => {
    removeMidiAccess()
    const onStatusChange = vi.fn()
    const m = new MidiManager({ onStatusChange })
    await m.connect()
    expect(onStatusChange).toHaveBeenCalledWith('unavailable')
  })

  it('calls onStatusChange("unavailable") when requestMIDIAccess rejects', async () => {
    Object.defineProperty(navigator, 'requestMIDIAccess', {
      value: vi.fn().mockRejectedValue(new Error('denied')),
      configurable: true,
      writable: true,
    })
    const onStatusChange = vi.fn()
    const m = new MidiManager({ onStatusChange })
    await m.connect()
    expect(onStatusChange).toHaveBeenCalledWith('unavailable')
  })
})

describe('MidiManager — connect: success', () => {
  afterEach(() => vi.restoreAllMocks())

  it('calls onStatusChange("connected") and onDevicesChange on success', async () => {
    const onStatusChange = vi.fn()
    const onDevicesChange = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)

    const m = new MidiManager({ onStatusChange, onDevicesChange })
    await m.connect()

    expect(onStatusChange).toHaveBeenCalledWith('connected')
    expect(onDevicesChange).toHaveBeenCalledWith([{ id: 'port-1', name: 'Test MIDI' }])
  })

  it('attaches onmidimessage to input ports', async () => {
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)

    const m = new MidiManager()
    await m.connect()

    expect(port.onmidimessage).toBe(m._handleMessage)
  })
})

describe('MidiManager — message parsing: note-on', () => {
  let m, onNoteOn

  beforeEach(async () => {
    onNoteOn = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    m = new MidiManager({ onNoteOn })
    await m.connect()
  })

  afterEach(() => vi.restoreAllMocks())

  it('fires onNoteOn with note and freq for note-on (velocity > 0)', () => {
    m._handleMessage(midiEvent([0x90, 60, 100]))
    expect(onNoteOn).toHaveBeenCalledWith(60, expect.closeTo(261.63, 0))
  })

  it('fires onNoteOn for note-on on any channel', () => {
    m._handleMessage(midiEvent([0x93, 69, 64]))
    expect(onNoteOn).toHaveBeenCalledWith(69, expect.closeTo(440, 0))
  })
})

describe('MidiManager — message parsing: note-off', () => {
  let m, onNoteOff

  beforeEach(async () => {
    onNoteOff = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    m = new MidiManager({ onNoteOff })
    await m.connect()
  })

  afterEach(() => vi.restoreAllMocks())

  it('fires onNoteOff for note-off message (0x80)', () => {
    m._handleMessage(midiEvent([0x90, 60, 100]))
    m._handleMessage(midiEvent([0x80, 60, 0]))
    expect(onNoteOff).toHaveBeenCalledWith(60)
  })

  it('treats note-on with velocity 0 as note-off', () => {
    m._handleMessage(midiEvent([0x90, 60, 100]))
    m._handleMessage(midiEvent([0x90, 60, 0]))
    expect(onNoteOff).toHaveBeenCalledWith(60)
  })

  it('ignores note-off for non-active note', () => {
    m._handleMessage(midiEvent([0x80, 60, 0]))
    expect(onNoteOff).not.toHaveBeenCalled()
  })
})

describe('MidiManager — pitchbend', () => {
  let m, onPitchBend

  beforeEach(async () => {
    onPitchBend = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    m = new MidiManager({ onPitchBend })
    await m.connect()
  })

  afterEach(() => vi.restoreAllMocks())

  it('does not fire onPitchBend when no note is active', () => {
    m._handleMessage(midiEvent([0xe0, 0x00, 0x7f]))
    expect(onPitchBend).not.toHaveBeenCalled()
  })

  it('fires onPitchBend with bent freq when note is active', () => {
    m._handleMessage(midiEvent([0x90, 69, 100])) // A4 = 440 Hz
    // max bend: raw = (0x7f << 7) | 0x7f = 16383
    m._handleMessage(midiEvent([0xe0, 0x7f, 0x7f]))
    expect(onPitchBend).toHaveBeenCalledWith(expect.closeTo(440 * Math.pow(2, 2 / 12), 1))
  })

  it('center pitchbend returns unmodified freq', () => {
    m._handleMessage(midiEvent([0x90, 69, 100]))
    // center: raw = (0x40 << 7) | 0x00 = 8192
    m._handleMessage(midiEvent([0xe0, 0x00, 0x40]))
    expect(onPitchBend).toHaveBeenCalledWith(expect.closeTo(440, 1))
  })
})

describe('MidiManager — CC dispatch', () => {
  afterEach(() => vi.restoreAllMocks())

  it('fires onCc with cc number and value', async () => {
    const onCc = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    const m = new MidiManager({ onCc })
    await m.connect()

    m._handleMessage(midiEvent([0xb0, 74, 100]))
    expect(onCc).toHaveBeenCalledWith({ cc: 74, value: 100 })
  })
})

describe('MidiManager — disconnect note-off synthesis', () => {
  afterEach(() => vi.restoreAllMocks())

  it('releases all active MIDI notes when selected device disconnects', async () => {
    const onNoteOff = vi.fn()
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    const m = new MidiManager({ onNoteOff })
    await m.connect()

    m._handleMessage(midiEvent([0x90, 60, 100]))
    m._handleMessage(midiEvent([0x90, 64, 100]))

    // Simulate disconnect by firing the access onstatechange
    port.state = 'disconnected'
    access.onstatechange({ port })

    expect(onNoteOff).toHaveBeenCalledWith(60)
    expect(onNoteOff).toHaveBeenCalledWith(64)
  })
})

describe('MidiManager — destroy', () => {
  afterEach(() => vi.restoreAllMocks())

  it('detaches listeners on destroy', async () => {
    const port = makePort()
    const access = makeMidiAccess([port])
    mockMidiAccess(access)
    const m = new MidiManager()
    await m.connect()
    m.destroy()
    expect(port.onmidimessage).toBeNull()
  })
})
