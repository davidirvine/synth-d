import { FaustMonoDspGenerator, FaustWasmInstantiator } from '@grame/faustwasm'
import { buildNoteOnMessages } from './keyboard.js'

const PARAM_PREFIX = '/synth/'

let ctx = null
let node = null
let analyserNode = null
let active = false
let initialized = false

export async function powerOn() {
  if (initialized) {
    await ctx.resume()
    return
  }

  ctx = new AudioContext()
  analyserNode = ctx.createAnalyser()
  analyserNode.fftSize = 2048
  // Expose for Playwright smoke tests
  if (typeof window !== 'undefined') window.__audioCtx = ctx
  await ctx.resume()

  const base = import.meta.env.BASE_URL
  const factory = await FaustWasmInstantiator.loadDSPFactory(
    `${base}synth.wasm`,
    `${base}synth.json`
  )

  const generator = new FaustMonoDspGenerator()
  generator.factory = factory

  node = await generator.createNode(ctx, 'synth', factory)
  node.connect(analyserNode)
  analyserNode.connect(ctx.destination)
  initialized = true
}

export async function powerOff() {
  if (!ctx) return
  await ctx.suspend()
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

export function getAnalyser() {
  return analyserNode
}
