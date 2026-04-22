import { FaustMonoDspGenerator, FaustWasmInstantiator } from '@grame/faustwasm'
import { buildNoteOnMessages } from './keyboard.js'

const PARAM_PREFIX = '/synth/'

let ctx = null
let node = null
let active = false

export async function initAudio() {
  if (ctx) return

  ctx = new AudioContext()
  // Expose for Playwright smoke tests
  if (typeof window !== 'undefined') window.__audioCtx = ctx
  await ctx.resume()

  const factory = await FaustWasmInstantiator.loadDSPFactory('/synth.wasm', '/synth.json')

  const generator = new FaustMonoDspGenerator()
  generator.factory = factory

  node = await generator.createNode(ctx, 'synth', factory)
  node.connect(ctx.destination)
}

export function setParam(name, value) {
  if (!node) return
  node.setParamValue(PARAM_PREFIX + name, value)
}

export function noteOn(freq) {
  if (!node) return
  const messages = buildNoteOnMessages(freq, active)
  for (const msg of messages) {
    setParam(msg.param, msg.value)
  }
  active = true
}

export function noteOff() {
  if (!node) return
  setParam('gate', 0)
  active = false
}
