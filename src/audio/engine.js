// audio/engine.js
// Framework-agnostic Tone.js engine. Nothing here touches Vue reactivity —
// stores hold serializable config; this module reads that config and drives
// real Tone.js nodes. Keeps Tone's internal scheduling clock decoupled from
// Vue's reactivity clock, which is what keeps timing sample-accurate.

import * as Tone from 'tone'

let started = false
let graphBuilt = false
let masterCompressor = null
let masterLimiter = null
let masterAnalyser = null

/**
 * Builds the master bus graph (compressor -> limiter -> destination,
 * plus an analyser tap). Building/connecting Tone nodes does NOT require
 * a running AudioContext — only actual sound processing does — so this
 * is safe to call at app startup, well before any user gesture. This is
 * called lazily by getMasterBus() so TrackEngine always has a real node
 * to connect to, instead of getting null and throwing.
 */
function buildMasterBus() {
  if (graphBuilt) return
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
  graphBuilt = true
}

/**
 * Must be called from a user gesture (click/touch) — browsers require this
 * to unlock the AudioContext. Mobile browsers are stricter than desktop:
 * Tone.start() alone sometimes leaves the context in a 'suspended' state
 * on iOS/Android WebViews, so we explicitly check and force-resume the
 * raw context too, and re-resume whenever the tab/app regains focus
 * (mobile OSes commonly suspend the context when backgrounded).
 */
export async function initAudio() {
  buildMasterBus()

  if (started) {
    await resumeIfSuspended()
    return
  }

  await Tone.start()
  await resumeIfSuspended()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resumeIfSuspended()
  })

  started = true
}

async function resumeIfSuspended() {
  const ctx = Tone.getContext()
  if (ctx.state !== 'running') {
    try {
      await ctx.resume()
    } catch (err) {
      console.warn('AudioContext resume failed', err)
    }
  }
}

export function getContextState() {
  return started ? Tone.getContext().state : 'not-started'
}

export function getMasterBus() {
  buildMasterBus()
  return masterCompressor
}

export function getAnalyser() {
  buildMasterBus()
  return masterAnalyser
}

let metronomeSynth = null

function getMetronomeSynth() {
  if (!metronomeSynth) {
    metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.006,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
    }).connect(getMasterBus())
  }
  return metronomeSynth
}

/** Plays a metronome tick; accented (higher-pitched) clicks mark beat 1. */
export function playMetronomeClick(time, accent = false) {
  getMetronomeSynth().triggerAttackRelease(accent ? 'C5' : 'C4', '32n', time, accent ? 1 : 0.6)
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
