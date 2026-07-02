// audio/effects/index.js
// Each factory returns a Tone effect node plus a `params` config object.
// Effects racks read/write `params` and call `.set()` on the node —
// this indirection is what lets Pinia store plain config while Tone
// owns the actual audio graph.

import * as Tone from 'tone'

export function createReverb({ decay = 2.5, wet = 0.3, preDelay = 0.01 } = {}) {
  const node = new Tone.Reverb({ decay, preDelay })
  node.wet.value = wet
  return node
}

export function createDelay({ time = '8n', feedback = 0.35, wet = 0.25 } = {}) {
  const node = new Tone.FeedbackDelay({ delayTime: time, feedback })
  node.wet.value = wet
  return node
}

export function createDistortion({ amount = 0.4, wet = 0.5 } = {}) {
  const node = new Tone.Distortion({ distortion: amount, oversample: '4x' })
  node.wet.value = wet
  return node
}

export function createBitcrush({ bits = 4, wet = 1 } = {}) {
  const node = new Tone.BitCrusher({ bits })
  node.wet.value = wet
  return node
}

export function createFilter({ type = 'lowpass', frequency = 8000, Q = 1 } = {}) {
  return new Tone.Filter({ type, frequency, Q })
}

export function createChorus({ frequency = 1.5, depth = 0.5, wet = 0.3 } = {}) {
  const node = new Tone.Chorus({ frequency, depth }).start()
  node.wet.value = wet
  return node
}

/** Effect registry — used by EffectsRack.vue to build "add effect" menus. */
export const EFFECT_TYPES = {
  reverb: { label: 'Reverb', factory: createReverb, defaults: { decay: 2.5, wet: 0.3 } },
  delay: { label: 'Delay', factory: createDelay, defaults: { time: '8n', feedback: 0.35, wet: 0.25 } },
  distortion: { label: 'Distortion', factory: createDistortion, defaults: { amount: 0.4, wet: 0.5 } },
  bitcrush: { label: 'Bitcrush', factory: createBitcrush, defaults: { bits: 4, wet: 1 } },
  filter: { label: 'Filter', factory: createFilter, defaults: { type: 'lowpass', frequency: 8000, Q: 1 } },
  chorus: { label: 'Chorus', factory: createChorus, defaults: { frequency: 1.5, depth: 0.5, wet: 0.3 } },
}
