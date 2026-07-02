// audio/engine.js
// Framework-agnostic Tone.js engine. Nothing here touches Vue reactivity —
// stores hold serializable config; this module reads that config and drives
// real Tone.js nodes. Keeps Tone's internal scheduling clock decoupled from
// Vue's reactivity clock, which is what keeps timing sample-accurate.

import * as Tone from 'tone'

let started = false
let masterCompressor = null
let masterLimiter = null
let masterAnalyser = null

/**
 * Must be called from a user gesture (click) — browsers require this
 * to unlock the AudioContext.
 */
export async function initAudio() {
  if (started) return
  await Tone.start()

  masterCompressor = new Tone.Compressor({
    threshold: -18,
    ratio: 3,
    attack: 0.01,
    release: 0.15,
  })
  masterLimiter = new Tone.Limiter(-1)
  masterAnalyser = new Tone.Analyser('fft', 256)

  masterCompressor.chain(masterLimiter, Tone.Destination)
  masterLimiter.connect(masterAnalyser)

  started = true
}

export function getMasterBus() {
  return masterCompressor
}

export function getAnalyser() {
  return masterAnalyser
}

export function setBpm(bpm) {
  Tone.Transport.bpm.rampTo(bpm, 0.05)
}

export function setSwing(amount) {
  // amount: 0–1
  Tone.Transport.swing = amount
  Tone.Transport.swingSubdivision = '16n'
}

export function play() {
  Tone.Transport.start()
}

export function stop() {
  Tone.Transport.stop()
}

export function pause() {
  Tone.Transport.pause()
}

export function setLoopPoints(startBar, endBar) {
  Tone.Transport.loop = true
  Tone.Transport.loopStart = `${startBar}m`
  Tone.Transport.loopEnd = `${endBar}m`
}

/**
 * Schedule a repeating callback aligned to a subdivision (e.g. '16n').
 * Returns the Tone event id so callers can Tone.Transport.clear(id) later.
 */
export function scheduleRepeat(callback, subdivision) {
  return Tone.Transport.scheduleRepeat(callback, subdivision)
}

export function clearSchedule(id) {
  Tone.Transport.clear(id)
}

export function getTransportPosition() {
  return Tone.Transport.position
}

export function isRunning() {
  return Tone.Transport.state === 'started'
}

export { Tone }
